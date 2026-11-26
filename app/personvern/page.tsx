import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, Toc } from "@/components/legal-page";
import { CONTACT_EMAIL, CONTROLLER_NAME, PRIVACY_UPDATED, privacyMailto } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description: "Hvilke personopplysninger ViStiller behandler, hvorfor, hvem som hjelper oss, og hvilke rettigheter du har.",
  alternates: { canonical: "/personvern", languages: { nb: "/personvern", en: "/en/privacy" } },
};

// Teksten beskriver det koden faktisk gjør. Endrer du hva som lagres, hvem som
// får data eller hvilke informasjonskapsler som settes, må denne siden oppdateres.

const toc = [
  ["ansvarlig", "Hvem som er ansvarlig"],
  ["kort", "Kort fortalt"],
  ["opplysninger", "Hvilke opplysninger vi behandler"],
  ["formal", "Formål og behandlingsgrunnlag"],
  ["deling", "Hvem som ser opplysningene"],
  ["leverandorer", "Leverandører (databehandlere)"],
  ["lagring", "Lagring, sikkerhet og hvor lenge"],
  ["cookies", "Informasjonskapsler og lokal lagring"],
  ["app", "Appene for Android og iOS"],
  ["barn", "Barn og unge"],
  ["rettigheter", "Dine rettigheter"],
  ["sletting", "Sletting av opplysninger"],
  ["endringer", "Endringer"],
  ["kontakt", "Kontakt"],
] as const;

function Mail() {
  return <a href={privacyMailto}>{CONTACT_EMAIL}</a>;
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Personvernerklæring"
      updated={PRIVACY_UPDATED}
      page="privacy"
      intro={
        <p>
          ViStiller hjelper skoler, FAU, idrettslag, korps og andre frivillige med å organisere dugnader og
          arrangementer. Her forklarer vi hvilke personopplysninger tjenesten behandler, hvorfor, og hva du kan gjøre
          med dem. Erklæringen gjelder nettsiden vistiller.com og ViStiller-appene for Android og iOS.
        </p>
      }
    >
      <Toc items={toc} label="Innhold" />

      <Section id="ansvarlig" title="1. Hvem som er ansvarlig">
        <p>
          Behandlingsansvarlig for ViStiller er{" "}
          {CONTROLLER_NAME ? <strong>{CONTROLLER_NAME}</strong> : "den som driver ViStiller"}. ViStiller drives
          foreløpig av en privatperson, ikke et selskap. Du når oss på <Mail />.
        </p>
        <p>
          Når en arrangør (for eksempel et FAU eller et idrettslag) bruker ViStiller til å samle inn påmeldinger, er det
          arrangøren som bestemmer hva arrangementet gjelder og hvem som inviteres. For deltakerlistene er arrangøren
          derfor behandlingsansvarlig, og ViStiller behandler opplysningene på vegne av arrangøren. Se{" "}
          <a href="#deling">punkt 5</a>.
        </p>
      </Section>

      <Section id="kort" title="2. Kort fortalt">
        <ul>
          <li>Vi samler bare inn det som trengs for å organisere dugnader og arrangementer.</li>
          <li>Deltakere trenger ikke konto. Navn er nok, og e-post er valgfritt.</li>
          <li>Vi bruker ikke reklame eller sporing, og vi selger aldri opplysninger.</li>
          <li>Vi teller besøk anonymt, uten cookies, for å se hvilke sider som brukes.</li>
          <li>
            Vi bruker bare informasjonskapsler som trengs for å holde deg innlogget og huske språket du har valgt.
          </li>
          <li>Du kan når som helst slette kontoen din selv i appen.</li>
        </ul>
      </Section>

      <Section id="opplysninger" title="3. Hvilke opplysninger vi behandler">
        <h3>Arrangører (deg med konto)</h3>
        <ul>
          <li>
            <strong>Konto:</strong> e-postadresse og passord. Passordet lagres bare som en kryptografisk hash, og
            ingen hos ViStiller kan se det.
          </li>
          <li>
            <strong>Innlogging:</strong> når kontoen ble opprettet og når du sist logget inn. Innloggingstjenesten
            lagrer også tekniske opplysninger som IP-adresse og nettlesertype i sikkerhetslogger.
          </li>
          <li>
            <strong>Organisasjon:</strong> navn og eventuell beskrivelse av skolen, laget eller korpset, og hvem som er
            administratorer (e-postadresse og rolle).
          </li>
          <li>
            <strong>Arrangementer og oppgaver:</strong> det du skriver inn, som tittel, beskrivelse, sted, tidspunkt,
            frist, antall plasser og språk, og hvem som opprettet arrangementet.
          </li>
          <li>
            <strong>Medlemskap og betaling:</strong> vi lagrer en kunde-ID og abonnements-ID fra betalingsleverandøren
            Stripe, status på abonnementet og hvor lenge det varer. Kortnummer og andre betalingsopplysninger legger du
            inn direkte hos Stripe. Vi får dem aldri.
          </li>
        </ul>

        <h3>Deltakere (deg som melder deg på via en lenke)</h3>
        <ul>
          <li>
            <strong>Navn</strong> (påkrevd) og <strong>e-postadresse</strong> (valgfritt).
          </li>
          <li>Hvilken oppgave du har meldt deg på, og når du meldte deg på eller av.</li>
          <li>
            En personlig tilgangskode, slik at du kan se og endre påmeldingene dine. Vi lagrer bare en hash av koden.
            Selve koden finnes kun i lenken din og på enheten din.
          </li>
          <li>Arrangøren kan også legge deg inn manuelt med navn og eventuelt e-post.</li>
        </ul>

        <h3>Alle besøkende</h3>
        <ul>
          <li>
            Når du åpner nettsiden eller appen, registrerer serverne tekniske opplysninger som IP-adresse, tidspunkt,
            adressen som ble åpnet og nettlesertype. Disse brukes til drift, feilsøking og sikkerhet.
          </li>
          <li>
            <strong>Besøksstatistikk:</strong> vi bruker Vercel Web Analytics til å telle sidevisninger. Den registrerer
            hvilken side som ble åpnet, hvilken side du kom fra, land, nettleser, operativsystem og type enhet. Den
            bruker ingen cookies og lagrer ikke IP-adressen. Statistikken viser bare tall for alle besøkende samlet, og
            vi kan ikke se hvem som har besøkt siden. Den personlige koden i påmeldingslenker fjernes før noe sendes.
          </li>
        </ul>
        <p>
          Vi ber ikke om fødselsnummer, adresse, telefonnummer, posisjon eller andre sensitive opplysninger. Skriv
          gjerne ikke slike opplysninger i fritekstfelt heller.
        </p>
      </Section>

      <Section id="formal" title="4. Formål og behandlingsgrunnlag">
        <ul>
          <li>
            <strong>Levere tjenesten til arrangører</strong> (konto, organisasjon, arrangementer og medlemskap).
            Grunnlaget er avtalen med deg, jf. personvernforordningen (GDPR) artikkel 6 nr. 1 bokstav b.
          </li>
          <li>
            <strong>Ta imot påmeldinger</strong> på vegne av arrangøren. Arrangøren bestemmer grunnlaget. Normalt er
            det arrangørens berettigede interesse i å organisere dugnaden (artikkel 6 nr. 1 bokstav f), og at du selv
            ber om å bli meldt på.
          </li>
          <li>
            <strong>Betaling og regnskap.</strong> Grunnlaget er avtalen (bokstav b) og plikten til å oppbevare
            regnskapsopplysninger etter bokføringsloven (bokstav c).
          </li>
          <li>
            <strong>Drift, sikkerhet og misbruk.</strong> Vi bruker logger og tekniske data for å holde tjenesten
            stabil og trygg, og anonym besøksstatistikk for å forbedre den. Grunnlaget er vår berettigede interesse
            (bokstav f).
          </li>
        </ul>
        <p>
          Vi bruker ikke opplysningene til markedsføring, profilering, reklame eller automatiserte avgjørelser, og vi
          selger dem ikke.
        </p>
      </Section>

      <Section id="deling" title="5. Hvem som ser opplysningene">
        <ul>
          <li>
            <strong>Alle med påmeldingslenken</strong> ser arrangementet, organisasjonens navn og{" "}
            <strong>navnene</strong> på dem som har meldt seg på hver oppgave. Slik ser alle hva som mangler. Lenken er
            ikke søkbar, men alle som får den, kan åpne den.
          </li>
          <li>
            <strong>Arrangørens administratorer</strong> ser hele deltakerlisten, også e-postadressene, og
            e-postadressene til de andre administratorene i organisasjonen.
          </li>
          <li>
            <strong>Du som deltaker</strong> ser dine egne påmeldinger via den personlige lenken din.
          </li>
          <li>
            <strong>Leverandørene våre</strong> behandler opplysninger på våre vegne, se neste punkt.
          </li>
        </ul>
        <p>Vi utleverer ikke opplysninger til andre, med mindre loven pålegger oss det.</p>
      </Section>

      <Section id="leverandorer" title="6. Leverandører (databehandlere)">
        <p>Vi bruker disse leverandørene for å drive ViStiller:</p>
        <ul>
          <li>
            <strong>Supabase</strong> (Supabase Inc.) driver databasen og innloggingen, og sender e-post som
            gjelder kontoen, for eksempel for å bekrefte e-postadressen. Databasen ligger i et datasenter i EU.
          </li>
          <li>
            <strong>Vercel</strong> (Vercel Inc., USA) drifter nettsiden og serverne som appen kobler seg til, og
            lager besøksstatistikken. Forespørsler kan bli behandlet i Vercels nettverk utenfor EU/EØS.
          </li>
          <li>
            <strong>Stripe</strong> (Stripe Payments Europe Ltd., Irland) tar imot betaling for medlemskap. Stripe er
            selv behandlingsansvarlig for en del av opplysningene, for eksempel for å hindre svindel og oppfylle
            regnskapsplikter. Se{" "}
            <a href="https://stripe.com/no/privacy" target="_blank" rel="noopener noreferrer">
              Stripes personvernerklæring
            </a>
            .
          </li>
        </ul>
        <p>
          Når opplysninger behandles utenfor EU/EØS, skjer det med lovlig overføringsgrunnlag: EU-kommisjonens
          standardkontrakter (SCC), og EU–US Data Privacy Framework der leverandøren er sertifisert.
        </p>
        <p>Skriftene på siden ligger hos oss selv, så nettleseren din henter ingenting fra Google eller andre.</p>
      </Section>

      <Section id="lagring" title="7. Lagring, sikkerhet og hvor lenge">
        <h3>Sikkerhet</h3>
        <ul>
          <li>All trafikk er kryptert (HTTPS).</li>
          <li>
            Databasen har tilgangsregler på hver rad. En arrangør ser bare egne organisasjoner, og en deltaker ser bare
            det lenken gir tilgang til.
          </li>
          <li>Passord og personlige tilgangskoder lagres bare som hash.</li>
          <li>Hemmelige nøkler ligger bare på serveren og sendes aldri til nettleseren eller appen.</li>
        </ul>
        <h3>Hvor lenge</h3>
        <ul>
          <li>
            <strong>Konto:</strong> til du sletter den.
          </li>
          <li>
            <strong>Organisasjoner, arrangementer og oppgaver:</strong> til en administrator sletter dem, eller til
            kontoen til den siste administratoren slettes. Vi sletter ikke gamle arrangementer automatisk. Vi
            oppfordrer arrangører til å slette arrangementer de ikke lenger trenger.
          </li>
          <li>
            <strong>Påmeldinger:</strong> til arrangøren fjerner påmeldingen eller sletter arrangementet. Melder du deg
            av selv, forsvinner navnet ditt fra listen, men påmeldingen blir liggende som avmeldt til arrangementet
            slettes. Se <a href="#sletting">punkt 12</a> hvis du vil ha den slettet helt.
          </li>
          <li>
            <strong>Betaling:</strong> Stripe oppbevarer betalingsopplysninger så lenge bokføringsloven og andre lover
            krever det, normalt fem år etter regnskapsåret.
          </li>
          <li>
            <strong>Logger:</strong> tekniske logger hos Vercel og Supabase slettes automatisk etter en kort periode,
            etter leverandørenes egne rutiner.
          </li>
        </ul>
      </Section>

      <Section id="cookies" title="8. Informasjonskapsler og lokal lagring">
        <p>ViStiller bruker bare det som trengs for at tjenesten skal virke. Derfor ber vi ikke om samtykke.</p>
        <ul>
          <li>
            <strong>Innloggingscookies</strong> (navn som begynner med <code>sb-</code>) settes når du logger inn som
            arrangør. De holder deg innlogget og slettes når du logger ut.
          </li>
          <li>
            <strong>Språkvalg</strong> (<code>vistiller-lang</code>) settes når du velger norsk eller engelsk. Den
            husker bare språket, inneholder ingen personopplysninger og slettes automatisk etter ett år.
          </li>
          <li>
            <strong>Lokal lagring på enheten</strong> (localStorage): når du melder deg på som deltaker, lagres den
            personlige tilgangskoden din, og navnet og e-posten du skrev, slik at neste påmelding går raskere.
            Opplysningene blir på enheten din og sendes bare til oss når du melder deg på. Du kan fjerne dem ved å
            slette nettstedsdata for vistiller.com i nettleseren.
          </li>
          <li>
            <strong>Frakoblet side:</strong> en «service worker» lagrer en enkel side som vises når du ikke har nett.
            Den inneholder ingen personopplysninger.
          </li>
        </ul>
        <p>
          Vi bruker ingen cookies til analyse, reklame eller sporing. Når du betaler, sendes du til Stripes egen
          betalingsside, og der gjelder Stripes cookies og vilkår.
        </p>
      </Section>

      <Section id="app" title="9. Appene for Android og iOS">
        <p>
          Appene viser vistiller.com i et eget vindu, og samme behandling gjelder der som på nettsiden. Appene ber
          bare om tilgang til internett. De bruker ikke posisjon, kamera, kontakter, bilder eller varslinger, og de
          inneholder ingen sporings- eller reklameverktøy.
        </p>
        <p>
          Når du laster ned appen, behandler Google (Google Play) og Apple (App Store) opplysninger etter sine egne
          vilkår.
        </p>
      </Section>

      <Section id="barn" title="10. Barn og unge">
        <p>
          Arrangørkontoer er ment for voksne, for eksempel foreldre, lærere, trenere og tillitsvalgte. ViStiller er
          ikke laget for at barn skal opprette konto.
        </p>
        <p>
          Deltakere trenger ikke konto. Noen arrangementer kan likevel gjelde barn og unge, for eksempel elever eller
          korpsmedlemmer. Vi spør ikke om alder og samler ikke inn mer om barn enn det som skrives i påmeldingen. Vi
          anbefaler at foresatte melder på barn under 13 år, og at man bare bruker fornavn eller et kallenavn, siden
          navnene vises for alle med lenken.
        </p>
        <p>
          Har et barn lagt inn opplysninger du vil ha slettet, kontakt arrangøren eller oss på <Mail />.
        </p>
      </Section>

      <Section id="rettigheter" title="11. Dine rettigheter">
        <p>Etter personvernregelverket har du rett til å</p>
        <ul>
          <li>få vite hvilke opplysninger vi har om deg, og få en kopi (innsyn),</li>
          <li>få rettet feil (retting),</li>
          <li>få opplysningene slettet (sletting),</li>
          <li>få behandlingen begrenset (begrensning),</li>
          <li>få utlevert opplysninger du har gitt oss i et maskinlesbart format (dataportabilitet),</li>
          <li>protestere mot behandling vi gjør på grunnlag av berettiget interesse (protest).</li>
        </ul>
        <p>
          Send en e-post til <Mail />, så svarer vi innen én måned. Vi kan be deg bekrefte at det er deg, for eksempel
          ved å svare fra e-postadressen på kontoen. Gjelder det en påmelding, kan du også kontakte arrangøren direkte.
        </p>
        <p>
          Mener du at vi behandler opplysninger i strid med regelverket, kan du klage til{" "}
          <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">
            Datatilsynet
          </a>
          . Vi setter pris på om du tar kontakt med oss først.
        </p>
      </Section>

      <Section id="sletting" title="12. Sletting av opplysninger">
        <ul>
          <li>
            <strong>Arrangører</strong> kan slette kontoen selv under <strong>Innstillinger → Konto → Slett
            kontoen min</strong>. Kontoen slettes med en gang. Organisasjoner der du er eneste administrator slettes
            også, med alle arrangementer, oppgaver og påmeldinger, og et aktivt medlemskap stoppes. Har organisasjonen
            andre administratorer, beholdes den, og du blir bare fjernet.
          </li>
          <li>
            <strong>Arrangører</strong> kan når som helst slette enkeltpåmeldinger, oppgaver og hele arrangementer.
          </li>
          <li>
            <strong>Deltakere</strong> kan melde seg av via den personlige lenken. Vil du at påmeldingen skal slettes
            helt, kan du be arrangøren fjerne den eller skrive til oss.
          </li>
        </ul>
        <p>
          Se <Link href="/slett-konto">slett konto</Link> for en steg-for-steg-forklaring. Der står det også hva du
          gjør hvis du ikke kommer inn på kontoen.
        </p>
      </Section>

      <Section id="endringer" title="13. Endringer">
        <p>
          Vi oppdaterer erklæringen når tjenesten endres. Datoen øverst viser når den sist ble endret.
        </p>
      </Section>

      <Section id="kontakt" title="14. Kontakt">
        <p>
          Spørsmål om personvern eller ønske om innsyn eller sletting? Skriv til <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
