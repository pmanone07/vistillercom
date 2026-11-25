import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, Toc } from "@/components/legal-page";
import { CONTACT_EMAIL, CONTROLLER_NAME, TERMS_UPDATED } from "@/lib/legal";
import { MEMBERSHIP, showPricing } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Brukervilkår",
  description: "Vilkårene for å bruke ViStiller – for arrangører og deltakere.",
  alternates: { canonical: "/vilkar", languages: { nb: "/vilkar", en: "/en/terms" } },
};

// Vilkårene beskriver det tjenesten faktisk gjør. Endres medlemskap, sletting
// eller hva som vises offentlig, må denne siden oppdateres.

const toc = [
  ["tjenesten", "Tjenesten og hvem som kan bruke den"],
  ["konto", "Konto og innlogging"],
  ["arrangementer", "Arrangementer, dugnader og oppgaver"],
  ["medlemskap", "Medlemskap og betaling"],
  ["innhold", "Ansvar for det du legger inn"],
  ["bruk", "Akseptabel bruk"],
  ["personvern", "Personvern"],
  ["sletting", "Sletting av konto og data"],
  ["drift", "Tilgjengelighet, endringer og driftsavbrudd"],
  ["ansvar", "Ansvarsbegrensning"],
  ["lov", "Lovvalg og tvister"],
  ["kontakt", "Kontakt og ansvarlig"],
] as const;

function Mail() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Brukervilkår"
      updated={TERMS_UPDATED}
      page="terms"
      intro={
        <p>
          Disse vilkårene gjelder for bruk av ViStiller på vistiller.com og i appene for Android og iOS. Når du oppretter
          konto eller melder deg på et arrangement, godtar du vilkårene.
        </p>
      }
    >
      <Toc items={toc} label="Innhold" />

      <Section id="tjenesten" title="1. Tjenesten og hvem som kan bruke den">
        <p>
          ViStiller er et verktøy for å organisere dugnader og arrangementer for skoler, FAU, idrettslag, korps og andre
          grupper. Med ViStiller kan du opprette arrangementer med oppgaver og et bestemt antall plasser, dele dem med en
          lenke eller QR-kode, og se hvem som har meldt seg på hva.
        </p>
        <p>Det er to måter å bruke ViStiller på:</p>
        <ul>
          <li>
            <strong>Arrangører</strong> har konto og oppretter og administrerer arrangementer for en organisasjon.
            Arrangørkontoer er for voksne, og du må være minst 18 år for å opprette en.
          </li>
          <li>
            <strong>Deltakere</strong> melder seg på via en lenke, uten konto og gratis. Er deltakeren et barn, bør en
            foresatt melde barnet på.
          </li>
        </ul>
      </Section>

      <Section id="konto" title="2. Konto og innlogging">
        <ul>
          <li>Du registrerer deg med en e-postadresse du har tilgang til, og et passord på minst 8 tegn.</li>
          <li>
            Du er ansvarlig for alt som skjer med kontoen din. Hold passordet hemmelig, og ikke del kontoen med andre.
            Trenger flere å administrere, legger du dem til som administratorer i stedet.
          </li>
          <li>Mistenker du at andre har fått tilgang til kontoen, må du kontakte oss med en gang.</li>
          <li>
            Administratorer i samme organisasjon har like rettigheter til arrangementene. Eieren og administratorene er
            selv ansvarlige for hvem de gir tilgang.
          </li>
        </ul>
      </Section>

      <Section id="arrangementer" title="3. Arrangementer, dugnader og oppgaver">
        <ul>
          <li>
            Arrangører kan opprette arrangementer med tid, sted, beskrivelse og påmeldingsfrist, legge inn oppgaver med
            antall plasser, kopiere tidligere arrangementer og stenge, arkivere eller slette dem.
          </li>
          <li>
            Hvert arrangement får en delingslenke. <strong>Alle som har lenken</strong> kan se arrangementet,
            organisasjonens navn og navnene på dem som har meldt seg på. Lenken er ikke søkbar, men alle som får den,
            kan åpne den og dele den videre.
          </li>
          <li>
            Deltakere kan melde seg på og av så lenge arrangøren holder påmeldingen åpen. Arrangøren kan også legge inn
            og fjerne deltakere selv.
          </li>
          <li>
            ViStiller er et hjelpemiddel for å organisere frivillig innsats. Selve arrangementet, og avtalene mellom
            arrangør og deltakere, er arrangørens ansvar. ViStiller er ikke part i dem.
          </li>
        </ul>
      </Section>

      <Section id="medlemskap" title="4. Medlemskap og betaling">
        {!showPricing ? (
          <p>
            ViStiller er gratis å bruke for arrangører i en testperiode. Innfører vi betaling, får du beskjed i forkant,
            og ingenting trekkes uten at du selv velger å betale. For deltakere er ViStiller alltid gratis.
          </p>
        ) : (
        <>
        <p>
          For å opprette og administrere arrangementer må organisasjonen ha et aktivt medlemskap. Det koster{" "}
          {MEMBERSHIP.priceLabel} {MEMBERSHIP.intervalLabel} {MEMBERSHIP.unitLabel}, {MEMBERSHIP.vatLabel}. For
          deltakere er ViStiller alltid gratis.
        </p>
        <ul>
          {MEMBERSHIP.terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
          <li>
            Uten aktivt medlemskap kan organisasjonen ikke opprette, endre, kopiere eller administrere arrangementer.
            Arrangementer som allerede finnes, slettes ikke av den grunn.
          </li>
          <li>
            Vi refunderer ikke perioden du allerede har betalt for, verken når du sier opp eller sletter kontoen, med
            mindre ufravikelig lov gir deg rett til det.
          </li>
          <li>
            Endrer vi prisen, varsler vi i god tid før neste fornyelse. Du kan da si opp før den nye prisen gjelder.
          </li>
        </ul>
        </>
        )}
      </Section>

      <Section id="innhold" title="5. Ansvar for det du legger inn">
        <ul>
          <li>
            Du er ansvarlig for alt du skriver i ViStiller, som navn på organisasjonen, arrangementer, oppgaver,
            beskrivelser og deltakere du legger inn.
          </li>
          <li>
            Som arrangør er du ansvarlig for at du har lov til å samle inn og dele opplysninger om deltakerne. Det
            gjelder særlig når deltakerne er barn. Husk at navnene vises for alle som har lenken.
          </li>
          <li>
            Ikke skriv sensitive opplysninger, som helseopplysninger, fødselsnummer eller lignende, i arrangementer
            eller oppgaver.
          </li>
          <li>
            Du beholder rettighetene til det du legger inn. Du gir oss bare tillatelse til å lagre og vise innholdet
            slik det trengs for å drive tjenesten.
          </li>
        </ul>
      </Section>

      <Section id="bruk" title="6. Akseptabel bruk">
        <p>Du kan ikke bruke ViStiller til å</p>
        <ul>
          <li>legge inn ulovlig, krenkende, truende eller diskriminerende innhold,</li>
          <li>legge inn opplysninger om andre uten at du har lov til det,</li>
          <li>sende reklame eller søppelpost, eller lage falske påmeldinger,</li>
          <li>utgi deg for å være en annen person eller organisasjon,</li>
          <li>
            forsøke å få tilgang til andres kontoer eller data, omgå sikkerhet eller betalingsmur, eller belaste
            tjenesten unødig, for eksempel med automatiserte forespørsler,
          </li>
          <li>kopiere, selge eller videreformidle tjenesten.</li>
        </ul>
        <p>
          Bryter du vilkårene, kan vi fjerne innhold, stenge arrangementer eller stenge kontoen. Er det mulig, gir vi
          beskjed først.
        </p>
      </Section>

      <Section id="personvern" title="7. Personvern">
        <p>
          Hvordan vi behandler personopplysninger, hvem som ser hva og hvilke rettigheter du har, står i{" "}
          <Link href="/personvern">personvernerklæringen</Link>. Den er en del av disse vilkårene.
        </p>
      </Section>

      <Section id="sletting" title="8. Sletting av konto og data">
        <ul>
          <li>
            Du kan når som helst slette kontoen selv under <strong>Innstillinger → Konto → Slett kontoen min</strong>.
            Organisasjoner der du er eneste administrator slettes da med alle arrangementer, oppgaver og påmeldinger, og
            et aktivt medlemskap stoppes. Organisasjoner med andre administratorer beholdes.
          </li>
          <li>Arrangører kan når som helst slette enkeltpåmeldinger, oppgaver og hele arrangementer.</li>
          <li>
            Deltakere kan melde seg av via den personlige lenken, og kan be arrangøren eller oss om å bli slettet helt.
          </li>
          <li>Sletting kan ikke angres.</li>
        </ul>
        <p>
          Les mer på <Link href="/slett-konto">slett konto</Link>.
        </p>
      </Section>

      <Section id="drift" title="9. Tilgjengelighet, endringer og driftsavbrudd">
        <ul>
          <li>
            Vi gjør vårt beste for at ViStiller skal være tilgjengelig og fungere som det skal, men vi kan ikke love at
            tjenesten alltid er feilfri eller tilgjengelig. Vedlikehold, feil og problemer hos leverandørene våre kan gi
            avbrudd.
          </li>
          <li>
            Vi kan videreutvikle, endre eller fjerne funksjoner. Fjerner vi noe vesentlig som dere betaler for, gir vi
            beskjed i forkant.
          </li>
          <li>
            Vi kan endre vilkårene. Datoen øverst viser når de sist ble endret. Ved vesentlige endringer gir vi beskjed
            i forkant. Bruker du ViStiller videre etter at endringene gjelder, godtar du de nye vilkårene.
          </li>
          <li>
            Legges tjenesten ned, varsler vi arrangører i god tid, slik at dere kan hente ut det dere trenger.
          </li>
        </ul>
      </Section>

      <Section id="ansvar" title="10. Ansvarsbegrensning">
        <ul>
          <li>
            ViStiller leveres som den er. Vi er ikke ansvarlige for hvordan arrangementer gjennomføres, om deltakere
            møter opp, eller for innhold som brukerne legger inn.
          </li>
          <li>
            Vi er ikke ansvarlige for indirekte tap, som tapt fortjeneste, tapte data eller følgeskader av
            driftsavbrudd.
          </li>
          <li>
            Vårt samlede ansvar er begrenset til det organisasjonen har betalt for ViStiller de siste 12 månedene.
          </li>
          <li>
            Begrensningene gjelder ikke hvis vi har opptrådt grovt uaktsomt eller med vilje, eller når ufravikelig
            norsk lov sier noe annet, for eksempel forbrukerlovgivningen.
          </li>
        </ul>
      </Section>

      <Section id="lov" title="11. Lovvalg og tvister">
        <p>
          Vilkårene følger norsk lov. Oppstår det uenighet, prøver vi først å finne en løsning sammen. Lykkes ikke det,
          kan saken bringes inn for de ordinære domstolene. Er du forbruker, kan du også få hjelp av Forbrukerrådet.
        </p>
      </Section>

      <Section id="kontakt" title="12. Kontakt og ansvarlig">
        <p>
          ViStiller drives foreløpig av en privatperson, ikke et selskap
          {CONTROLLER_NAME ? (
            <>
              : <strong>{CONTROLLER_NAME}</strong>
            </>
          ) : null}
          . Spørsmål om vilkårene, medlemskap eller kontoen din? Skriv til <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
