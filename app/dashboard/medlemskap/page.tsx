import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing";
import { getOrganizations } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MembershipView } from "./membership-view";

export const metadata: Metadata = { title: "Medlemskap" };

export default function MembershipPage({ searchParams }: PageProps<"/dashboard/medlemskap">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medlemskap</h1>
        <p className="text-sm text-muted-foreground">Pris, betaling og abonnement for organisasjonen din.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <Loader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Loader({ searchParams }: Pick<PageProps<"/dashboard/medlemskap">, "searchParams">) {
  const query = await searchParams;
  await requireUser();
  const organizations = await getOrganizations();
  if (organizations.length === 0) redirect("/dashboard");

  const paidSession = typeof query.betalt === "string" ? query.betalt : null;
  return (
    <MembershipView
      organizations={organizations}
      billingEnabled={isBillingEnabled}
      paidSession={paidSession}
      cancelled={query.avbrutt === "1"}
    />
  );
}
