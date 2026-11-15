-- =============================================================================
-- Retter «permission denied for function make_event_slug» ved opprettelse av
-- arrangement.
--
-- Triggeren som lager delingslenken kaller make_event_slug(). Hvis triggeren
-- ikke kjører med eierens rettigheter i databasen, mangler den innloggede
-- brukeren tilgang til funksjonen. Denne filen setter triggerfunksjonen på
-- nytt og gir i tillegg tilgang til de tre hjelpefunksjonene som er ufarlige
-- å kalle (de leser ingen tabeller), slik at feilen ikke kan oppstå uansett.
--
-- Trygg å kjøre flere ganger. Endrer ingen data.
-- =============================================================================

create or replace function public.events_before_insert()
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

revoke execute on function public.events_before_insert() from public, anon, authenticated;

-- Rene hjelpefunksjoner: lager en lenkestump, et tilfeldig token og en hash.
grant execute on function public.make_event_slug(text) to authenticated;
grant execute on function public.new_access_token()    to anon, authenticated;
grant execute on function public.hash_token(text)      to anon, authenticated;
