import type { Metadata } from "next";
import { Suspense } from "react";
import { LangSwitch } from "@/components/lang-switch";
import { PricingCard } from "@/components/pricing-card";
import { AUTH_PATHS } from "@/lib/auth-i18n";
import { MEMBERSHIP, showPricing } from "@/lib/membership";
import { cn } from "@/lib/utils";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Opprett konto",
  description: showPricing
    ? `ViStiller for arrangører: ${MEMBERSHIP.priceLabel} ${MEMBERSHIP.intervalLabel} ${MEMBERSHIP.unitLabel}, ${MEMBERSHIP.vatLabel}. Deltakere melder seg på gratis.`
    : "Opprett en ViStiller-konto og organiser dugnader og arrangementer. Deltakere melder seg på uten konto.",
  alternates: { canonical: "/registrer", languages: { nb: "/registrer", en: "/en/register" } },
};

const steps = [
  "Opprett konto",
  "Legg inn skolen, laget eller korpset",
  showPricing ? `Betal ${MEMBERSHIP.priceLabel} ${MEMBERSHIP.vatLabel} for ett år` : "Opprett arrangementet og del lenken",
];

export default function RegisterPage() {
  return (
    <div className={cn("grid w-full items-start gap-5", showPricing ? "max-w-4xl md:grid-cols-2" : "max-w-md")}>
      {/* Skjemaet først på mobil, med prisen synlig rett over knappen. */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">Opprett konto</h1>
          <LangSwitch lang="en" to={AUTH_PATHS.en.register} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">For deg som arrangerer. Klart på få minutter.</p>

        <ol className="my-5 space-y-2 text-sm">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        {showPricing && (
        <div className="mb-5 rounded-xl bg-primary/5 p-3 text-sm ring-1 ring-primary/15">
          <p className="font-semibold">
            {MEMBERSHIP.priceLabel} {MEMBERSHIP.intervalLabel} {MEMBERSHIP.unitLabel}{" "}
            <span className="font-normal text-muted-foreground">({MEMBERSHIP.vatLabel})</span>
          </p>
          <p className="text-muted-foreground">
            Ingenting trekkes når du oppretter konto. Du betaler i steg 3, og kan si opp når som helst.
          </p>
        </div>
        )}

        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>

      {showPricing && <PricingCard className="shadow-sm" />}
    </div>
  );
}
