"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PricingCard } from "@/components/pricing-card";
import { useLang, useT } from "@/components/i18n-provider";
import { formatShortDate } from "@/lib/format";
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
  const t = useT().membership;
  const [confirming, setConfirming] = useState(paidSession !== null);
  const [justPaid, setJustPaid] = useState(false);
  const handled = useRef(false);

  // Tilbake fra Stripe: bekreft betalingen med en gang, og rydd adressen.
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (cancelled) {
      toast.info(t.cancelled);
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
        toast.success(t.received);
      } else {
        toast.info(t.pending);
      }
      router.refresh();
    });
  }, [paidSession, cancelled, router, t]);

  if (!billingEnabled) {
    return (
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{t.notEnabled}</p>
        </div>
        <PricingCard />
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-background p-10 text-center ring-1 ring-foreground/10">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="font-semibold">{t.confirming}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {justPaid && (
        <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
          <p className="flex items-center gap-2 font-semibold text-emerald-950">
            <CheckCircle2 className="size-5" aria-hidden /> {t.thanks}
          </p>
          <p className="mt-1 text-sm text-emerald-950/80">{t.receipt}</p>
          <Link href="/dashboard/events/new" className={cn(buttonVariants(), "mt-4 h-12 px-5 text-base")}>
            {t.firstEvent} <ArrowRight />
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
  const lang = useLang();
  const t = useT().membership;

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
    const until = organization.access_until ? formatShortDate(organization.access_until, lang) : null;
    const ending = organization.cancel_at_period_end;
    const pastDue = organization.subscription_status === "past_due";
    return (
      <section className="space-y-4 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
        <div>
          {showName && <p className="text-sm font-medium text-muted-foreground">{organization.name}</p>}
          <p className="flex items-center gap-2 text-lg font-bold">
            <CheckCircle2 className="size-5 text-emerald-600" aria-hidden /> {t.active}
          </p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-muted-foreground">{t.price}</dt>
            <dd className="font-semibold">
              {t.priceValue} <span className="font-normal text-muted-foreground">({t.vat})</span>
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-muted-foreground">{ending ? t.ends : t.renews}</dt>
            <dd className="font-semibold">{until ?? "–"}</dd>
          </div>
        </dl>
        {ending && (
          <p className="text-sm text-muted-foreground">{t.endingText(until)}</p>
        )}
        {pastDue && (
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.pastDue}
          </p>
        )}
        <Button variant="outline" onClick={() => go(openBillingPortal)} disabled={pending} className="h-11">
          {pending ? <Loader2 className="animate-spin" /> : <CreditCard />}
          {t.manage}
        </Button>
        <p className="text-xs text-muted-foreground">{t.manageHint}</p>
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
          {hadBefore ? t.lapsed : t.needs}
        </p>
      </div>
      <PricingCard>
        <Button onClick={() => go(startCheckout)} disabled={pending} className="h-12 w-full text-base">
          {pending ? <Loader2 className="animate-spin" /> : <CreditCard />}
          {t.checkout}
        </Button>
        <p className="mt-2 text-center text-xs font-medium">{t.total}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t.redirectHint}</p>
      </PricingCard>
    </div>
  );
}
