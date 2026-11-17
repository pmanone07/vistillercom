# ViStiller

Mindre organisering. Mer fellesskap. En enkel måte for skoler, FAU, idrettslag, korps og frivillige å fordele oppgaver til dugnader og arrangementer.

Next.js 16 (App Router) · React 19 · Supabase · Tailwind 4 · shadcn/ui

## Kom i gang

1. Opprett et **nytt** Supabase-prosjekt. Skjemaet her bruker tabellnavn som kan kollidere med en eldre database (`organizations`, `events`, `signups`), så ikke kjør migreringen mot en database som allerede har data.
2. Kjør alle filene i `supabase/migrations/` i SQL-editoren, i rekkefølge etter dato (eller `supabase db push`).
3. Kopier `.env.example` til `.env.local` og fyll inn:

   | Variabel | Hva |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Prosjektets URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon-nøkkel |
   | `NEXT_PUBLIC_SITE_URL` | F.eks. `https://vistiller.com` |

   Disse tre er offentlige. De hemmelige nøklene for betaling står under «Medlemskap og betaling».
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

### Medlemskap og betaling (Stripe)

Arrangører betaler 499 kr per år per organisasjon, inkludert mva. Deltakere betaler aldri.

Mva: 499 kr er sluttprisen. Prisen sendes til Stripe som «avgift inkludert» (`tax_behavior: inclusive`), så Stripe legger aldri noe oppå. Skal mva-andelen stå spesifisert på kvitteringen, sett opp Stripe Tax med norsk mva-registrering og legg inn `STRIPE_AUTOMATIC_TAX=true`. Pris og vilkår står i `lib/membership.ts` og vises på `/registrer`, `/dashboard/medlemskap` og forsiden.

Betalingsmuren er **av** til nøklene under er satt, slik at ingen låses ute før betaling faktisk virker. Slik slår du den på:

1. Kjør `supabase/migrations/20261118000000_membership.sql` i SQL-editoren.
2. Legg inn disse som **hemmelige** miljøvariabler (lokalt i `.env.local`, og i Vercel – ikke med `NEXT_PUBLIC_`):

   | Variabel | Hvor du finner den |
   |---|---|
   | `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
   | `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endepunktet → Signing secret |
   | `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API → secret key |
   | `STRIPE_PRICE_ID` (valgfri) | En pris du har laget selv i Stripe. Tom = 499 kr/år lages automatisk |

3. Lag et webhook-endepunkt i Stripe som peker på `https://www.vistiller.com/api/stripe/webhook`, med hendelsene `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` og `customer.subscription.deleted`.
4. Slå på kundeportalen i Stripe (Settings → Billing → Customer portal), så «Administrer abonnement» virker.

Flyten: `/registrer` → opprett organisasjon → `/dashboard/medlemskap` → Stripe Checkout → tilbake, og tilgangen er aktiv. Uten aktivt medlemskap sendes arrangøren til medlemskapssiden, og serveren avviser oppretting og endring av arrangementer og oppgaver. Offentlige påmeldingslenker fortsetter å virke.

Sperren håndheves av ViStiller-serveren, ikke av databasen (RLS).

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
- **Servernøkkelen** (`SUPABASE_SECRET_KEY`) leses bare i `lib/billing.ts` og brukes kun til å kalle `set_org_membership` når Stripe har bekreftet en betaling.
- **Gjester** får et privat token. Bare SHA-256-hashen lagres, og arrangører kan ikke lese den.
- Navn på påmeldte vises til alle med lenken. E-post vises bare til arrangøren.

### Kode

- `supabase/migrations/` – skjema, RLS og funksjoner. `supabase/tests/` – databasetester.
- `lib/data.ts` – spørringer for arrangører. `lib/public-data.ts` – for offentlige sider.
- `app/dashboard/actions.ts` og `app/e/actions.ts` – server actions.
- `components/ui/` – shadcn/ui. `sticky-pages.tsx` har fått ett tillegg (`peek`) som holder fanene til arkene under synlige.
- `proxy.ts` – fornyer økten og beskytter `/dashboard` (Next 16 sitt navn på middleware).

Next.js 16 har Cache Components slått på: alt som leser økt, parametre eller database ligger bak `<Suspense>`. Les `node_modules/next/dist/docs/` før du endrer mønsteret.
