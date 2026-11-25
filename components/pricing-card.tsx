"use client";

import { Check } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

/** Pris, hva som er inkludert og vilkårene – samme innhold overalt det vises. */
export function PricingCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  const t = useT().pricing;
  return (
    <section
      aria-labelledby="pris-tittel"
      className={cn("rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6", className)}
    >
      <p className="text-sm font-semibold text-primary">{t.forOrganizers}</p>
      <h2 id="pris-tittel" className="mt-1 text-lg font-bold">
        {t.product}
      </h2>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-extrabold tracking-tight tabular-nums">{t.price}</span>
        <span className="text-base font-medium text-muted-foreground">{t.per}</span>
      </p>
      <p className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
        {t.vat}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t.monthly}</p>

      <ul className="mt-4 space-y-2 text-sm">
        {t.included.map((line) => (
          <li key={line} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {children && <div className="mt-5">{children}</div>}

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">{t.howTitle}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {t.terms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
