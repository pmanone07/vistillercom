-- =============================================================================
-- Språk per arrangement (norsk «nb» eller engelsk «en»)
--
-- * Arrangementet får språket arrangøren brukte da det ble opprettet. Siden
--   deltakerne ser (/e/…) vises på det språket, med mulighet til å bytte.
-- * Kopierte arrangementer beholder språket.
-- * Eksisterende arrangementer blir norske.
--
-- Trygg å kjøre flere ganger. Endrer ingen eksisterende data (bortsett fra at
-- den nye kolonnen får verdien 'nb').
-- =============================================================================

alter table public.events
  add column if not exists language text not null default 'nb';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_language_check') then
    alter table public.events add constraint events_language_check check (language in ('nb', 'en'));
  end if;
end;
$$;

-- Arrangøren kan sette språket ved opprettelse og endre det senere.
grant insert (language) on public.events to authenticated;
grant update (language) on public.events to authenticated;

-- Den offentlige visningen tar med språket.
create or replace function public.public_event_json(p_event_id uuid)
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
    'language',          e.language,
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

-- Kopien får samme språk som originalen.
create or replace function public.copy_event(p_event_id uuid, p_title text, p_starts_at timestamptz)
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
                             starts_at, ends_at, signup_deadline, status, language)
  values (v_old.organization_id,
          coalesce(nullif(btrim(p_title), ''), v_old.title),
          v_old.description, v_old.location,
          p_starts_at, v_old.ends_at + v_shift, v_old.signup_deadline + v_shift, 'open', v_old.language)
  returning id into v_new;

  insert into public.tasks (event_id, title, description, capacity, starts_at, ends_at, sort_order)
  select v_new, t.title, t.description, t.capacity, t.starts_at + v_shift, t.ends_at + v_shift, t.sort_order
  from public.tasks t
  where t.event_id = p_event_id;

  return v_new;
end;
$$;
