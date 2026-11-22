import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Trash2 } from "lucide-react";
import { LegalPage, Section } from "@/components/legal-page";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_EMAIL, deletionMailto } from "@/lib/legal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Slett konto",
  description: "Slik sletter du ViStiller-kontoen din og personopplysningene som hører til.",
  alternates: { canonical: "/slett-konto" },
};

// Offentlig side som Google Play og App Store kan lenke til. Krever ikke innlogging.
export default function DeleteAccountPage() {
  return (
    <LegalPage
      title="Slett ViStiller-kontoen din"
      intro={
        <p>
          Du kan når som helst slette kontoen din i ViStiller, i appen for Android og iOS eller på vistiller.com.
          Personopplysningene dine slettes da permanent.
        </p>
      }
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/innstillinger#konto"
          className={cn(buttonVariants({ variant: "destructive" }), "h-12 text-base")}
        >
          <Trash2 /> Slett kontoen nå
        </Link>
        <a href={deletionMailto} className={cn(buttonVariants({ variant: "outline" }), "h-12 text-base")}>
          <Mail /> Be om sletting på e-post
        </a>
      </div>

      <Section id="selv" title="Slik sletter du kontoen selv">
        <ol>
          <li>
            Logg inn på <Link href="/login?next=/dashboard/innstillinger">vistiller.com</Link> eller i
            ViStiller-appen.
          </li>
          <li>
            Trykk <strong>Innstillinger</strong> øverst, og velg <strong>Innstillinger</strong> i menyen.
          </li>
          <li>
            Gå ned til <strong>Konto</strong> og trykk <strong>Slett kontoen min</strong>.
          </li>
          <li>
            Skriv <strong>SLETT</strong> og trykk <strong>Slett kontoen permanent</strong>.
          </li>
        </ol>
        <p>Kontoen slettes med en gang, og du blir logget ut.</p>
      </Section>

      <Section id="epost" title="Kommer du ikke inn på kontoen?">
        <p>
          Send en e-post til <a href={deletionMailto}>{CONTACT_EMAIL}</a> fra e-postadressen du bruker i ViStiller,
          og skriv at du vil slette kontoen. Vi bekrefter når det er gjort, senest innen 30 dager. Sender du fra en
          annen adresse, må vi bekrefte at kontoen er din før vi sletter noe.
        </p>
      </Section>

      <Section id="hva" title="Hva som slettes">
        <ul>
          <li>Kontoen din: e-postadresse, passord og innloggingsopplysninger.</li>
          <li>Administratorrollen din i alle organisasjoner.</li>
          <li>
            Organisasjoner der du er <strong>eneste administrator</strong>, med alle arrangementer, oppgaver og
            påmeldinger. Et aktivt medlemskap stoppes med en gang, uten refusjon for resten av perioden.
          </li>
        </ul>
      </Section>

      <Section id="beholdes" title="Hva som beholdes">
        <ul>
          <li>
            Organisasjoner som har <strong>andre administratorer</strong>, med arrangementene sine. Du fjernes bare
            som administrator. Var du eneste eier, blir den administratoren som har vært med lengst, ny eier.
          </li>
          <li>
            Betalingsopplysninger hos betalingsleverandøren Stripe, så lenge bokføringsloven krever det (normalt fem
            år).
          </li>
          <li>Tekniske logger, som slettes automatisk etter kort tid.</li>
        </ul>
      </Section>

      <Section id="deltaker" title="Har du meldt deg på uten konto?">
        <p>
          Deltakere har ingen konto som kan slettes. Du kan melde deg av via den personlige lenken du fikk da du meldte
          deg på. Vil du at påmeldingen og navnet ditt skal slettes helt, kan du be arrangøren fjerne deg, eller skrive
          til <a href={deletionMailto}>{CONTACT_EMAIL}</a> med navnet på arrangementet.
        </p>
        <p>
          Les mer i <Link href="/personvern">personvernerklæringen</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
