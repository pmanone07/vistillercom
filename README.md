# ViStiller

Mindre organisering. Mer fellesskap. En enkel måte for skoler, FAU, idrettslag, korps og frivillige å fordele oppgaver til dugnader og arrangementer.

Next.js 16 (App Router) · React 19 · Supabase · Tailwind 4 · shadcn/ui

## Kom i gang

1. Opprett et **nytt** Supabase-prosjekt. Skjemaet her bruker tabellnavn som kan kollidere med en eldre database (`organizations`, `events`, `signups`), så ikke kjør migreringen mot en database som allerede har data.
2. Kjør begge filene i `supabase/migrations/` i SQL-editoren, i rekkefølge etter dato (eller `supabase db push`).
3. Kopier `.env.example` til `.env.local` og fyll inn:

   | Variabel | Hva |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Prosjektets URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon-nøkkel |
   | `NEXT_PUBLIC_SITE_URL` | F.eks. `https://vistiller.com` |

   Appen bruker **ikke** secret/service-role-nøkkelen. Ikke legg den inn noe sted.
4. I Supabase → Authentication → URL Configuration: sett Site URL, og legg til `https://DITT-DOMENE/auth/callback` (og `http://localhost:3000/auth/callback`) under Redirect URLs.
5. `npm install` og `npm run dev`.

De samme tre variablene må legges inn i Vercel (Production og Preview).

## Kommandoer

| Kommando | Gjør |
|---|---|
| `npm run dev` | Utviklingsserver |
| `npm run build` | Produksjonsbygg |
| `npm run typecheck` | Rutetyper + TypeScript |
| `npm run lint` | ESLint |
| `npm run test:db` | Kjører migreringen i en lokal Postgres (pglite) og tester tilgang, kapasitet og gjestepåmelding |

## Slik henger det sammen

| Sti | Hvem | Hva |
|---|---|---|
| `/` | Alle | Forside (Sticky Pages) |
| `/login`, `/registrer` | Arrangør | E-post og passord |
| `/dashboard` | Arrangør | Kommende/tidligere arrangementer og bemanning |
| `/dashboard/events/[id]` | Arrangør | Oppgaver, påmeldte, deling, QR, kopiering |
| `/e/[slug]` | Deltaker | Offentlig side: se oppgaver og meld seg på uten konto |
| `/e/[slug]/plakat` | Alle | Utskriftsvennlig plakat med QR-kode |
| `/b/[token]` | Deltaker | Mine bidrag – privat lenke (Sticky Pages som faner) |

### Mobil

- **PWA:** `app/manifest.ts` og ikonene i `public/icons/` gjør at appen kan legges til på hjemskjermen. `public/sw.js` viser `/offline` når nettet mangler; ingenting annet bufres.
- **Android/iOS (Capacitor):** app-ID `com.vistillercom.app`. Prosjektene ligger i `android/` og `ios/` og er et skall rundt `https://vistiller.com` (se `capacitor.config.ts`), så nettsiden må være publisert før appene viser noe.
  - Android: åpne mappen `android/` i Android Studio (`npm run cap:android`), ikke rotmappen.
  - iOS: bygges på Mac med Xcode (`npm run cap:ios`) eller i Codemagic (`codemagic.yaml`, starter på git-tagger som `ios-1`; oppsettet står øverst i filen).
  - Ikon og startskjerm: kildene lages av `scripts/make-app-assets.mjs`. Kjør `npm run cap:assets` for å lage dem på nytt og fordele dem til begge appene.
  - Etter endringer i `capacitor.config.ts` eller nye plugins: `npm run cap:sync`.

- **Flere administratorer:** `/dashboard/innstillinger` (krever migreringen `20261116000000_org_admins.sql`).

### Sikkerhet

- **Arrangører** jobber direkte mot tabellene. Row Level Security slipper dem bare til organisasjoner de er medlem av.
- **Deltakere** har ingen tabelltilgang. De går gjennom fire databasefunksjoner (`get_public_event`, `signup_for_task`, `get_my_signups`, `cancel_my_signup`) som aldri gir ut e-post eller tokens.
- **Kapasitet** håndheves i databasen: oppgaven låses (`FOR UPDATE`) før plassene telles, så to kan ikke ta den siste plassen samtidig.
- **Gjester** får et privat token. Bare SHA-256-hashen lagres, og arrangører kan ikke lese den.
- Navn på påmeldte vises til alle med lenken. E-post vises bare til arrangøren.

### Kode

- `supabase/migrations/` – skjema, RLS og funksjoner. `supabase/tests/` – databasetester.
- `lib/data.ts` – spørringer for arrangører. `lib/public-data.ts` – for offentlige sider.
- `app/dashboard/actions.ts` og `app/e/actions.ts` – server actions.
- `components/ui/` – shadcn/ui. `sticky-pages.tsx` har fått ett tillegg (`peek`) som holder fanene til arkene under synlige.
- `proxy.ts` – fornyer økten og beskytter `/dashboard` (Next 16 sitt navn på middleware).

Next.js 16 har Cache Components slått på: alt som leser økt, parametre eller database ligger bak `<Suspense>`. Les `node_modules/next/dist/docs/` før du endrer mønsteret.
