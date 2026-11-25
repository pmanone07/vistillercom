import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/app/(auth)/auth-form";
import { LangSwitch } from "@/components/lang-switch";
import { AUTH_PATHS } from "@/lib/auth-i18n";
import { MEMBERSHIP, showPricing } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a ViStiller account and organize volunteer work and events. Participants sign up without an account.",
  alternates: { canonical: "/en/register", languages: { nb: "/registrer", en: "/en/register" } },
};

// Samme pris og steg som den norske siden, men det detaljerte priskortet
// (components/pricing-card.tsx) finnes bare på norsk.
const steps = [
  "Create an account",
  "Add your school, team or band",
  showPricing ? `Pay NOK ${MEMBERSHIP.priceNok} incl. VAT for one year` : "Create the event and share the link",
];

export default function EnglishRegisterPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold">Create account</h1>
        <LangSwitch lang="nb" to={AUTH_PATHS.nb.register} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">For organizers. Ready in a few minutes.</p>

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
            NOK {MEMBERSHIP.priceNok} per year per organization{" "}
            <span className="font-normal text-muted-foreground">(incl. VAT)</span>
          </p>
          <p className="text-muted-foreground">
            Nothing is charged when you create an account. You pay in step 3 and can cancel at any time.
          </p>
        </div>
      )}

      <Suspense>
        <AuthForm mode="register" lang="en" />
      </Suspense>
    </div>
  );
}
