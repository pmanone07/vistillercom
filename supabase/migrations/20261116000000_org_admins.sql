-- =============================================================================
-- Flere administratorer per organisasjon
--
-- * Alle medlemmer kan se hvem som er med og legge til en ny administrator.
--   Personen må ha opprettet ViStiller-konto først (ingen e-post sendes herfra).
-- * Bare eiere kan fjerne andre. Alle kan forlate selv, men den siste eieren
--   kan ikke fjernes – en organisasjon står aldri uten eier.
-- * E-postadresser leses fra auth.users bare gjennom disse funksjonene, og bare
--   for organisasjoner man selv er medlem av.
-- =============================================================================

create function public.list_org_members(p_org_id uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_org_member(p_org_id) then
    raise exception 'VS_NOT_FOUND';
  end if;
  return query
    select m.user_id, u.email::text, m.role, m.created_at
    from public.organization_members m
    join auth.users u on u.id = m.user_id
    where m.organization_id = p_org_id
    order by (m.role = 'owner') desc, m.created_at;
end;
$$;

create function public.add_org_admin(p_org_id uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_org_member(p_org_id) then
    raise exception 'VS_NOT_FOUND';
  end if;
  if (select count(*) from public.organization_members where organization_id = p_org_id) >= 25 then
    raise exception 'VS_TOO_MANY_MEMBERS';
  end if;

  select u.id into v_user
  from auth.users u
  where lower(u.email) = lower(btrim(coalesce(p_email, '')))
  limit 1;
  if v_user is null then
    raise exception 'VS_USER_NOT_FOUND';
  end if;
  if exists (
    select 1 from public.organization_members
    where organization_id = p_org_id and user_id = v_user
  ) then
    raise exception 'VS_ALREADY_MEMBER';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (p_org_id, v_user, 'admin');
  return v_user;
end;
$$;

create function public.remove_org_member(p_org_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me          uuid := auth.uid();
  v_my_role     text;
  v_target_role text;
begin
  select role into v_my_role from public.organization_members
  where organization_id = p_org_id and user_id = v_me;
  if v_my_role is null then
    raise exception 'VS_NOT_FOUND';
  end if;

  -- Låser medlemsradene, så to eiere ikke kan fjerne hverandre samtidig.
  perform 1 from public.organization_members where organization_id = p_org_id for update;

  select role into v_target_role from public.organization_members
  where organization_id = p_org_id and user_id = p_user_id;
  if v_target_role is null then
    raise exception 'VS_NOT_FOUND';
  end if;

  if p_user_id <> v_me and v_my_role <> 'owner' then
    raise exception 'VS_OWNER_ONLY';
  end if;
  if v_target_role = 'owner' and (
       select count(*) from public.organization_members
       where organization_id = p_org_id and role = 'owner'
     ) <= 1 then
    raise exception 'VS_LAST_OWNER';
  end if;

  delete from public.organization_members
  where organization_id = p_org_id and user_id = p_user_id;
end;
$$;

revoke execute on function
  public.list_org_members(uuid),
  public.add_org_admin(uuid, text),
  public.remove_org_member(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.list_org_members(uuid)        to authenticated;
grant execute on function public.add_org_admin(uuid, text)     to authenticated;
grant execute on function public.remove_org_member(uuid, uuid) to authenticated;
