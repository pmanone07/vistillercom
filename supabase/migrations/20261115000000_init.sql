-- =============================================================================
-- ViStiller – grunnskjema
--
-- Prinsipper
-- * Arrangører (innloggede brukere) jobber direkte mot tabellene. Row Level
--   Security sørger for at de bare ser organisasjoner de er medlem av.
-- * Deltakere uten konto rører aldri tabellene. All offentlig lesing og
--   påmelding går gjennom SECURITY DEFINER-funksjoner som bare gir ut det som
--   er trygt å vise (aldri e-postadresser eller tokens).
-- * Påmelding er atomisk: oppgaven låses med SELECT ... FOR UPDATE før ledige
--   plasser telles, så to personer kan ikke ta den siste plassen samtidig.
-- * Gjester identifiseres med et privat token. Bare SHA-256-hashen lagres.
-- * Ingen hemmelig nøkkel (service role) trengs av appen.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabeller
-- -----------------------------------------------------------------------------

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 100),
  description text check (char_length(description) <= 500),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            text not null default 'admin' check (role in ('owner', 'admin')),
  created_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index organization_members_user_id_idx on public.organization_members (user_id);

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by      uuid references auth.users (id) on delete set null,
  title           text not null check (char_length(btrim(title)) between 1 and 120),
  description     text check (char_length(description) <= 2000),
  location        text check (char_length(location) <= 200),
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  signup_deadline timestamptz,
  public_slug     text not null unique,
  status          text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_organization_id_idx on public.events (organization_id, starts_at);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  title       text not null check (char_length(btrim(title)) between 1 and 100),
  description text check (char_length(description) <= 500),
  capacity    integer not null check (capacity between 1 and 500),
  starts_at   timestamptz,
  ends_at     timestamptz,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index tasks_event_id_idx on public.tasks (event_id, sort_order);

create table public.signups (
  id                  uuid primary key default gen_random_uuid(),
  task_id             uuid not null references public.tasks (id) on delete cascade,
  participant_name    text not null check (char_length(btrim(participant_name)) between 1 and 80),
  participant_email   text check (char_length(participant_email) <= 200),
  participant_user_id uuid references auth.users (id) on delete set null,
  access_token_hash   text,            -- null når arrangøren har lagt inn personen selv
  created_at          timestamptz not null default now(),
  cancelled_at        timestamptz
);
create index signups_task_id_idx on public.signups (task_id) where cancelled_at is null;
create index signups_access_token_hash_idx on public.signups (access_token_hash)
  where access_token_hash is not null;
-- Samme gjest kan ikke stå to ganger på samme oppgave.
create unique index signups_one_active_per_token_idx
  on public.signups (task_id, access_token_hash)
  where cancelled_at is null and access_token_hash is not null;

-- -----------------------------------------------------------------------------
-- Hjelpefunksjoner
-- -----------------------------------------------------------------------------

create function public.hash_token(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
$$;

-- 244 tilfeldige biter, URL-trygt.
create function public.new_access_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
$$;

-- «Sommeravslutning – 5. klasse» -> «sommeravslutning-5-klasse-3f9a1c»
create function public.make_event_slug(p_title text)
returns text
language sql
volatile
set search_path = ''
as $$
  select coalesce(
           nullif(
             left(
               btrim(
                 regexp_replace(
                   replace(replace(replace(lower(p_title), 'æ', 'ae'), 'ø', 'o'), 'å', 'a'),
                   '[^a-z0-9]+', '-', 'g'),
                 '-'),
               48),
             ''),
           'arrangement')
         || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
$$;

create function public.events_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.public_slug := public.make_event_slug(new.title);
  new.created_by := coalesce(auth.uid(), new.created_by);
  return new;
end;
$$;
create trigger events_before_insert before insert on public.events
  for each row execute function public.events_before_insert();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- Medlemskapssjekker (SECURITY DEFINER for å unngå rekursjon i RLS).
create function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = (select auth.uid())
  );
$$;

create function public.is_event_member(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.events e
    join public.organization_members m on m.organization_id = e.organization_id
    where e.id = p_event_id and m.user_id = (select auth.uid())
  );
$$;

create function public.is_task_member(p_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tasks t
    join public.events e on e.id = t.event_id
    join public.organization_members m on m.organization_id = e.organization_id
    where t.id = p_task_id and m.user_id = (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.events               enable row level security;
alter table public.tasks                enable row level security;
alter table public.signups              enable row level security;

revoke all on public.organizations, public.organization_members, public.events,
              public.tasks, public.signups
  from anon, authenticated;

-- organizations: opprettes via create_organization(); medlemmer kan lese og endre.
grant select on public.organizations to authenticated;
grant update (name, description) on public.organizations to authenticated;
create policy "medlemmer leser organisasjon" on public.organizations
  for select to authenticated using (public.is_org_member(id));
create policy "medlemmer endrer organisasjon" on public.organizations
  for update to authenticated
  using (public.is_org_member(id)) with check (public.is_org_member(id));

-- organization_members: kun lesing (administreres via funksjoner).
grant select on public.organization_members to authenticated;
create policy "medlemmer leser medlemskap" on public.organization_members
  for select to authenticated using (public.is_org_member(organization_id));

-- events: lenke (public_slug), eier og organisasjon kan ikke endres i etterkant.
grant select, delete on public.events to authenticated;
grant insert (organization_id, title, description, location, starts_at, ends_at, signup_deadline, status)
  on public.events to authenticated;
grant update (title, description, location, starts_at, ends_at, signup_deadline, status)
  on public.events to authenticated;
create policy "medlemmer styrer arrangementer" on public.events
  for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- tasks
grant select, insert, update, delete on public.tasks to authenticated;
create policy "medlemmer styrer oppgaver" on public.tasks
  for all to authenticated
  using (public.is_event_member(event_id))
  with check (public.is_event_member(event_id));

-- signups: arrangører ser aldri token-hashen og kan ikke forfalske den.
grant select (id, task_id, participant_name, participant_email, participant_user_id, created_at, cancelled_at)
  on public.signups to authenticated;
grant insert (task_id, participant_name, participant_email) on public.signups to authenticated;
grant update (participant_name, participant_email, cancelled_at) on public.signups to authenticated;
grant delete on public.signups to authenticated;
create policy "medlemmer styrer påmeldinger" on public.signups
  for all to authenticated
  using (public.is_task_member(task_id))
  with check (public.is_task_member(task_id));

-- -----------------------------------------------------------------------------
-- Funksjoner for arrangører
-- -----------------------------------------------------------------------------

-- Oppretter en organisasjon og gjør innlogget bruker til eier.
create function public.create_organization(p_name text, p_description text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_org  uuid;
begin
  if v_user is null then
    raise exception 'VS_NOT_AUTHENTICATED';
  end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 100 then
    raise exception 'VS_INVALID_NAME';
  end if;
  if (select count(*) from public.organization_members where user_id = v_user) >= 20 then
    raise exception 'VS_TOO_MANY_ORGANIZATIONS';
  end if;

  insert into public.organizations (name, description, created_by)
  values (btrim(p_name), nullif(btrim(p_description), ''), v_user)
  returning id into v_org;
  insert into public.organization_members (organization_id, user_id, role)
  values (v_org, v_user, 'owner');
  return v_org;
end;
$$;

-- Kopierer et arrangement med alle oppgaver (uten påmeldinger). Klokkeslett
-- flyttes like langt som startdatoen. Kjører som brukeren, så RLS gjelder.
create function public.copy_event(p_event_id uuid, p_title text, p_starts_at timestamptz)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_old   public.events;
  v_new   uuid;
  v_shift interval;
begin
  select * into v_old from public.events where id = p_event_id;
  if not found then
    raise exception 'VS_NOT_FOUND';
  end if;
  if p_starts_at is null then
    raise exception 'VS_INVALID_DATE';
  end if;
  v_shift := p_starts_at - v_old.starts_at;

  insert into public.events (organization_id, title, description, location,
                             starts_at, ends_at, signup_deadline, status)
  values (v_old.organization_id,
          coalesce(nullif(btrim(p_title), ''), v_old.title),
          v_old.description, v_old.location,
          p_starts_at, v_old.ends_at + v_shift, v_old.signup_deadline + v_shift, 'open')
  returning id into v_new;

  insert into public.tasks (event_id, title, description, capacity, starts_at, ends_at, sort_order)
  select v_new, t.title, t.description, t.capacity, t.starts_at + v_shift, t.ends_at + v_shift, t.sort_order
  from public.tasks t
  where t.event_id = p_event_id;

  return v_new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Offentlige funksjoner (deltakere uten konto)
-- -----------------------------------------------------------------------------

-- Offentlig visning av et arrangement. Inneholder aldri e-post eller tokens.
create function public.public_event_json(p_event_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug',              e.public_slug,
    'title',             e.title,
    'description',       e.description,
    'location',          e.location,
    'starts_at',         e.starts_at,
    'ends_at',           e.ends_at,
    'signup_deadline',   e.signup_deadline,
    'status',            e.status,
    'signup_open',       e.status = 'open' and (e.signup_deadline is null or e.signup_deadline > now()),
    'organization_name', o.name,
    'tasks', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id',          t.id,
               'title',       t.title,
               'description', t.description,
               'capacity',    t.capacity,
               'starts_at',   t.starts_at,
               'ends_at',     t.ends_at,
               'taken',       (select count(*) from public.signups s
                               where s.task_id = t.id and s.cancelled_at is null),
               'names',       coalesce((select jsonb_agg(s.participant_name order by s.created_at)
                                        from public.signups s
                                        where s.task_id = t.id and s.cancelled_at is null), '[]'::jsonb)
             ) order by t.sort_order, t.created_at)
      from public.tasks t where t.event_id = e.id
    ), '[]'::jsonb)
  )
  from public.events e
  join public.organizations o on o.id = e.organization_id
  where e.id = p_event_id;
$$;

create function public.get_public_event(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.public_event_json(e.id)
  from public.events e
  where e.public_slug = p_slug and e.status <> 'archived';
$$;

-- Melder en gjest på en oppgave. Returnerer det private tokenet i klartekst
-- (bare hashen lagres). Sender klienten med et token den allerede har for
-- samme arrangement, gjenbrukes det, slik at én lenke dekker alle oppgavene.
create function public.signup_for_task(
  p_task_id uuid,
  p_name    text,
  p_email   text default null,
  p_token   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_task   public.tasks;
  v_event  public.events;
  v_token  text;
  v_hash   text;
  v_taken  integer;
  v_signup uuid;
begin
  -- Låser oppgaven: samtidige påmeldinger til samme oppgave går i kø her.
  select * into v_task from public.tasks where id = p_task_id for update;
  if not found then
    raise exception 'VS_TASK_NOT_FOUND';
  end if;

  select * into v_event from public.events where id = v_task.event_id;
  if v_event.status = 'archived' then
    raise exception 'VS_TASK_NOT_FOUND';
  end if;
  if v_event.status <> 'open' then
    raise exception 'VS_EVENT_CLOSED';
  end if;
  if v_event.signup_deadline is not null and v_event.signup_deadline <= now() then
    raise exception 'VS_DEADLINE_PASSED';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 80 then
    raise exception 'VS_INVALID_NAME';
  end if;
  if nullif(btrim(p_email), '') is not null
     and (char_length(p_email) > 200 or btrim(p_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'VS_INVALID_EMAIL';
  end if;

  -- Gjenbruk tokenet bare hvis det allerede tilhører dette arrangementet.
  if p_token is not null and exists (
       select 1
       from public.signups s
       join public.tasks t on t.id = s.task_id
       where s.access_token_hash = public.hash_token(p_token)
         and t.event_id = v_event.id
     ) then
    v_token := p_token;
  else
    v_token := public.new_access_token();
  end if;
  v_hash := public.hash_token(v_token);

  if exists (
       select 1 from public.signups
       where task_id = p_task_id and access_token_hash = v_hash and cancelled_at is null
     ) then
    raise exception 'VS_ALREADY_SIGNED_UP';
  end if;

  select count(*) into v_taken
  from public.signups
  where task_id = p_task_id and cancelled_at is null;
  if v_taken >= v_task.capacity then
    raise exception 'VS_TASK_FULL';
  end if;

  insert into public.signups (task_id, participant_name, participant_email,
                              participant_user_id, access_token_hash)
  values (p_task_id, btrim(p_name), nullif(lower(btrim(p_email)), ''), auth.uid(), v_hash)
  returning id into v_signup;

  return jsonb_build_object('signup_id', v_signup, 'token', v_token);
end;
$$;

-- Det en gjest har meldt seg på, sett via det private tokenet.
create function public.get_my_signups(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select s.id, s.task_id, s.participant_name, s.participant_email, s.created_at, t.event_id
    from public.signups s
    join public.tasks t on t.id = s.task_id
    join public.events e on e.id = t.event_id
    where s.access_token_hash = public.hash_token(p_token)
      and e.status <> 'archived'
  ),
  latest as (
    select event_id, participant_name, participant_email
    from mine order by created_at desc limit 1
  )
  select jsonb_build_object(
    'participant_name',  l.participant_name,
    'participant_email', l.participant_email,
    'event',             public.public_event_json(l.event_id),
    'task_ids', coalesce((
      select jsonb_agg(s.task_id order by s.created_at)
      from public.signups s
      where s.access_token_hash = public.hash_token(p_token) and s.cancelled_at is null
    ), '[]'::jsonb)
  )
  from latest l;
$$;

-- Gjesten melder seg av en oppgave. Plassen blir ledig med en gang.
create function public.cancel_my_signup(p_token text, p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  select e.status into v_status
  from public.tasks t join public.events e on e.id = t.event_id
  where t.id = p_task_id;
  if v_status is null or v_status = 'archived' then
    raise exception 'VS_SIGNUP_NOT_FOUND';
  end if;

  update public.signups
  set cancelled_at = now()
  where task_id = p_task_id
    and access_token_hash = public.hash_token(p_token)
    and cancelled_at is null;
  if not found then
    raise exception 'VS_SIGNUP_NOT_FOUND';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Funksjonsrettigheter
-- -----------------------------------------------------------------------------

revoke execute on function
  public.hash_token(text),
  public.new_access_token(),
  public.make_event_slug(text),
  public.events_before_insert(),
  public.set_updated_at(),
  public.is_org_member(uuid),
  public.is_event_member(uuid),
  public.is_task_member(uuid),
  public.create_organization(text, text),
  public.copy_event(uuid, text, timestamptz),
  public.public_event_json(uuid),
  public.get_public_event(text),
  public.signup_for_task(uuid, text, text, text),
  public.get_my_signups(text),
  public.cancel_my_signup(text, uuid)
from public, anon, authenticated;

grant execute on function public.is_org_member(uuid)                    to authenticated;
grant execute on function public.is_event_member(uuid)                  to authenticated;
grant execute on function public.is_task_member(uuid)                   to authenticated;
grant execute on function public.create_organization(text, text)        to authenticated;
grant execute on function public.copy_event(uuid, text, timestamptz)    to authenticated;

grant execute on function public.get_public_event(text)                 to anon, authenticated;
grant execute on function public.signup_for_task(uuid, text, text, text) to anon, authenticated;
grant execute on function public.get_my_signups(text)                   to anon, authenticated;
grant execute on function public.cancel_my_signup(text, uuid)           to anon, authenticated;
