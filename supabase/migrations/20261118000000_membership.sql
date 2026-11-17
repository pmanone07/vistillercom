-- =============================================================================
-- Medlemskap (Stripe-abonnement) per organisasjon
--
-- * Feltene speiler abonnementet i Stripe og oppdateres bare av serveren, via
--   set_org_membership(), når Stripe bekrefter en betaling eller endring.
-- * Medlemmer kan lese feltene (for å se status), men aldri endre dem:
--   UPDATE-rettigheten på organizations gjelder fortsatt bare navn/beskrivelse.
--
-- Trygg å kjøre flere ganger. Endrer ingen eksisterende data.
-- =============================================================================

alter table public.organizations
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status    text,
  add column if not exists access_until           timestamptz,
  add column if not exists cancel_at_period_end   boolean not null default false;

create unique index if not exists organizations_stripe_subscription_id_idx
  on public.organizations (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- Kalles av ViStiller-serveren (service role) når Stripe melder fra.
-- Finner organisasjonen på id, eller på abonnements-id hvis id mangler.
create or replace function public.set_org_membership(
  p_org_id               uuid,
  p_customer_id          text,
  p_subscription_id      text,
  p_status               text,
  p_access_until         timestamptz,
  p_cancel_at_period_end boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select o.id into v_org
  from public.organizations o
  where (p_org_id is not null and o.id = p_org_id)
     or (p_org_id is null and p_subscription_id is not null and o.stripe_subscription_id = p_subscription_id)
  limit 1;
  if v_org is null then
    raise exception 'VS_NOT_FOUND';
  end if;

  update public.organizations
  set stripe_customer_id     = coalesce(p_customer_id, stripe_customer_id),
      stripe_subscription_id = coalesce(p_subscription_id, stripe_subscription_id),
      subscription_status    = p_status,
      access_until           = p_access_until,
      cancel_at_period_end   = coalesce(p_cancel_at_period_end, false)
  where id = v_org;
  return v_org;
end;
$$;

revoke execute on function public.set_org_membership(uuid, text, text, text, timestamptz, boolean)
  from public, anon, authenticated;
grant execute on function public.set_org_membership(uuid, text, text, text, timestamptz, boolean)
  to service_role;
