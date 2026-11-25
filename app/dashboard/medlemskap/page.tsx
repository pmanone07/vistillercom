import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing";
import { getOrganizations } from "@/lib/data";
import { getT } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MembershipView } from "./membership-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).membership.title };
}

export default async function MembershipPage({ searchParams }: PageProps<"/dashboard/medlemskap">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const t = (await getT()).membership;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
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
