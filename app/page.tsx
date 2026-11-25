import Link from "next/link";
import { ClipboardList, GraduationCap, HeartHandshake, Link2, Music, Trophy, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StickyPages, type StickyPageItem } from "@/components/ui/sticky-pages";
import { Logo } from "@/components/logo";
import { LangPicker } from "@/components/lang-picker";
import { LegalLinks } from "@/components/legal-links";
import { MEMBERSHIP, showPricing } from "@/lib/membership";
import { cn } from "@/lib/utils";
import { ScrollDownButton } from "./scroll-down-button";

const steps = [
  {
    icon: ClipboardList,
    title: "Opprett arrangementet",
    text: "Legg inn dato, sted og hva dere trenger: fem som baker, tre som rigger, to som rydder.",
  },
  {
    icon: Link2,
    title: "Del én lenke",
    text: "Send den på SMS, Messenger, Spond eller e-post – eller heng opp QR-koden.",
  },
  {
    icon: Users,
    title: "Folk melder seg på",
    text: "Uten konto og uten skjemaer. Du ser hele tiden hvem som stiller og hva som mangler.",
  },
];

const audiences = [
  { icon: GraduationCap, title: "Skoler og FAU", text: "Sommeravslutninger, klassefester, kafésalg og foreldrevakter." },
  { icon: Trophy, title: "Idrettslag", text: "Cuper, kioskvakter, kjøring til kamp, rigging og rydding." },
  { icon: Music, title: "Korps", text: "Konserter, 17. mai, loppemarked og loddsalg." },
  { icon: HeartHandshake, title: "Nabolag og frivillige", text: "Dugnader, velforeninger og fellesmiddager." },
];

const pages: StickyPageItem[] = [
  {
    id: "hero",
    bg: "bg-background",
    content: (
      <div className="flex h-full flex-col">
        <header className="mx-auto flex h-16 w-full max-w-5xl shrink-0 items-center justify-between px-5 pt-safe">
          <Logo />
          <div className="flex items-center gap-2">
            <LangPicker />
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-3 sm:px-4")}>
              Logg inn
            </Link>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
          <p className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            For skoler, idrettslag, korps og frivillige
          </p>
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            Mindre organisering. <span className="text-primary">Mer fellesskap.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
            Planlegg dugnader og arrangementer, fordel oppgaver og få folk til å stille opp – helt enkelt.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/dashboard/events/new" className={cn(buttonVariants(), "h-12 px-6 text-base")}>
              Opprett arrangement
            </Link>
            <ScrollDownButton>Se hvordan det fungerer</ScrollDownButton>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "slik",
    bg: "bg-muted",
    className: "rounded-t-3xl shadow-[0_-16px_40px_-24px_rgb(0_0_0/0.35)]",
    content: (
      // Ytre flate ruller hvis skjermen er svært lav; min-h-full + justify-center
      // midtstiller uten å klippe toppen.
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-5 py-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Slik fungerer det</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground sm:text-base">
            Slutt på Excel-ark, Facebook-tråder og «hvem tar med kaffe?».
          </p>
          <ol className="mt-5 grid gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-5">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl bg-background p-3.5 ring-1 ring-foreground/10 sm:flex-col sm:gap-4 sm:p-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "for-hvem",
    bg: "bg-background",
    className: "rounded-t-3xl shadow-[0_-16px_40px_-24px_rgb(0_0_0/0.35)]",
    content: (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-5 py-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Laget for alle som arrangerer
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground sm:text-base">
            Bruk ViStiller gjennom hele året, ikke bare til én dugnad.
          </p>
          {/* To kolonner på mobil, så alle fire får plass på ett ark. */}
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5 lg:grid-cols-4">
            {audiences.map((a) => (
              <li key={a.title} className="flex flex-col gap-2.5 rounded-2xl bg-muted/60 p-3.5 sm:gap-4 sm:p-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-foreground/10 sm:size-11">
                  <a.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="leading-snug font-semibold">{a.title}</h3>
                  <p className="mt-1 text-[0.8rem] leading-snug text-muted-foreground sm:text-sm">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "start",
    bg: "bg-primary",
    className: "rounded-t-3xl",
    content: (
      <div className="flex h-full flex-col text-primary-foreground">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Klart på få minutter.
          </h2>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/85">
            Opprett et arrangement, del lenken, og la folk velge hva de vil bidra med.
          </p>
          {showPricing && (
          <p className="mt-6 rounded-2xl bg-primary-foreground/10 px-5 py-3 text-primary-foreground">
            <span className="text-2xl font-bold tabular-nums">{MEMBERSHIP.priceLabel}</span>{" "}
            <span className="text-primary-foreground/85">
              {MEMBERSHIP.intervalLabel} {MEMBERSHIP.unitLabel}
            </span>
            <span className="block text-sm text-primary-foreground/75">
              Prisen er {MEMBERSHIP.vatLabel}. Deltakere melder seg på gratis.
            </span>
          </p>
          )}
          <Link
            href="/dashboard/events/new"
            className={cn(buttonVariants({ variant: "secondary" }), "mt-8 h-12 px-6 text-base")}
          >
            Opprett arrangement
          </Link>
        </div>
        <footer className="px-5 py-5 pb-safe-bar text-center text-sm text-primary-foreground/75">
          <LegalLinks className="mb-1" linkClassName="text-primary-foreground" />
          © ViStiller · vistiller.com
        </footer>
      </div>
    ),
  },
];

export default function Home() {
  return (
    <main>
      {/* 100svh: riktig høyde på mobil selv når adresselinjen vises. */}
      <StickyPages pages={pages} pageHeight="100svh" />
    </main>
  );
}
