import { Check } from "lucide-react";
import { MEMBERSHIP } from "@/lib/membership";
import { cn } from "@/lib/utils";

/** Pris, hva som er inkludert og vilkårene – samme innhold overalt det vises. */
export function PricingCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <section
      aria-labelledby="pris-tittel"
      className={cn("rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6", className)}
    >
      <p className="text-sm font-semibold text-primary">For arrangører</p>
      <h2 id="pris-tittel" className="mt-1 text-lg font-bold">
        {MEMBERSHIP.productName}
      </h2>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-extrabold tracking-tight tabular-nums">{MEMBERSHIP.priceLabel}</span>
        <span className="text-base font-medium text-muted-foreground">
          {MEMBERSHIP.intervalLabel} · {MEMBERSHIP.unitLabel}
        </span>
      </p>
      <p className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
        Prisen er {MEMBERSHIP.vatLabel}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Det tilsvarer ca. {Math.round(MEMBERSHIP.priceNok / 12)} kr i måneden. Deltakerne betaler aldri noe.
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        {MEMBERSHIP.included.map((line) => (
          <li key={line} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {children && <div className="mt-5">{children}</div>}

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Slik fungerer abonnementet</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {MEMBERSHIP.terms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
