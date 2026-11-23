"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PricingCard } from "@/components/pricing-card";
import { formatShortDate } from "@/lib/format";
import { MEMBERSHIP } from "@/lib/membership";
import { cn } from "@/lib/utils";
import type { Organization } from "@/lib/types";
import { confirmCheckout, openBillingPortal, startCheckout } from "./actions";

interface Props {
  organizations: Organization[];
  billingEnabled: boolean;
  /** Stripe-referansen når brukeren nettopp kom tilbake fra betaling. */
  paidSession: string | null;
  cancelled: boolean;
}

export function MembershipView({ organizations, billingEnabled, paidSession, cancelled }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(paidSession !== null);
  const [justPaid, setJustPaid] = useState(false);
  const handled = useRef(false);

  // Tilbake fra Stripe: bekreft betalingen med en gang, og rydd adressen.
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (cancelled) {
      toast.info("Betalingen ble avbrutt. Ingenting er trukket.");
      window.history.replaceState(null, "", "/dashboard/medlemskap");
    }
    if (!paidSession) return;
    confirmCheckout(paidSession).then((result) => {
      window.history.replaceState(null, "", "/dashboard/medlemskap");
      setConfirming(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.data.paid) {
        setJustPaid(true);
        toast.success("Betalingen er mottatt. Velkommen!");
      } else {
        toast.info("Betalingen er ikke fullført ennå. Siden oppdateres når den er det.");
      }
      router.refresh();
    });
  }, [paidSession, cancelled, router]);

  if (!billingEnabled) {
    return (
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            Betaling er ikke slått på ennå, så alt er åpent for alle organisasjoner. Legg inn Stripe-nøklene (se
            README) for å aktivere medlemskapet.
          </p>
        </div>
        <PricingCard />
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-background p-10 text-center ring-1 ring-foreground/10">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="font-semibold">Bekrefter betalingen …</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {justPaid && (
        <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
          <p className="flex items-center gap-2 font-semibold text-emerald-950">
            <CheckCircle2 className="size-5" aria-hidden /> Takk! Medlemskapet er aktivt.
          </p>
          <p className="mt-1 text-sm text-emerald-950/80">Kvitteringen er sendt på e-post fra Stripe.</p>
          <Link href="/dashboard/events/new" className={cn(buttonVariants(), "mt-4 h-12 px-5 text-base")}>
            Opprett første arrangement <ArrowRight />
          </Link>
        </div>
      )}
      {organizations.map((organization) => (
        <OrganizationMembership key={organization.id} organization={organization} showName={organizations.length > 1} />
      ))}
    </div>
  );
}

function OrganizationMembership({ organization, showName }: { organization: Organization; showName: boolean }) {
  const [pending, startTransition] = useTransition();

  function go(action: (id: string) => ReturnType<typeof startCheckout>) {
    startTransition(async () => {
      const result = await action(organization.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.location.assign(result.data.url);
    });
  }

  if (organization.hasMembership ?? organization.hasAccess) {
    const until = organization.access_until ? formatShortDate(organization.access_until) : null;
    const ending = organization.cancel_at_period_end;
    const pastDue = organization.subscription_status === "past_due";
    return (
      <section className="space-y-4 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
        <div>
          {showName && <p className="text-sm font-medium text-muted-foreground">{organization.name}</p>}
          <p className="flex items-center gap-2 text-lg font-bold">
            <CheckCircle2 className="size-5 text-emerald-600" aria-hidden /> Aktivt medlemskap
          </p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-muted-foreground">Pris</dt>
            <dd className="font-semibold">
              {MEMBERSHIP.priceLabel} {MEMBERSHIP.intervalLabel}{" "}
              <span className="font-normal text-muted-foreground">({MEMBERSHIP.vatLabel})</span>
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-muted-foreground">{ending ? "Avsluttes" : "Fornyes automatisk"}</dt>
            <dd className="font-semibold">{until ?? "–"}</dd>
          </div>
        </dl>
        {ending && (
          <p className="text-sm text-muted-foreground">
            Abonnementet er sagt opp. Dere har full tilgang til og med {until}, og blir ikke trukket igjen.
          </p>
        )}
        {pastDue && (
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Siste betaling gikk ikke gjennom. Oppdater kortet for å beholde tilgangen.
          </p>
        )}
        <Button variant="outline" onClick={() => go(openBillingPortal)} disabled={pending} className="h-11">
          {pending ? <Loader2 className="animate-spin" /> : <CreditCard />}
          Administrer abonnement
        </Button>
        <p className="text-xs text-muted-foreground">
          Her kan du si opp, bytte kort og laste ned kvitteringer. Åpnes hos Stripe.
        </p>
      </section>
    );
  }

  const hadBefore = Boolean(organization.subscription_status);
  return (
    <div className="space-y-3">
      <div className="flex gap-3 rounded-2xl bg-muted p-4 text-sm">
        <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <p>
          <span className="font-semibold">{organization.name}</span>{" "}
          {hadBefore
            ? "har ikke lenger et aktivt medlemskap. Arrangementene deres er trygt lagret og blir tilgjengelige igjen når dere fornyer."
            : "trenger et medlemskap før dere kan opprette arrangementer."}
        </p>
      </div>
      <PricingCard>
        <Button onClick={() => go(startCheckout)} disabled={pending} className="h-12 w-full text-base">
          {pending ? <Loader2 className="animate-spin" /> : <CreditCard />}
          Gå til betaling – {MEMBERSHIP.priceLabel} {MEMBERSHIP.intervalLabel}
        </Button>
        <p className="mt-2 text-center text-xs font-medium">Totalt å betale: {MEMBERSHIP.priceLabel} {MEMBERSHIP.vatLabel}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Du sendes til Stripe for sikker kortbetaling, og kommer tilbake hit etterpå.
        </p>
      </PricingCard>
    </div>
  );
}
