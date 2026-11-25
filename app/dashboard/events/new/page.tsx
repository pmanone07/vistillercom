import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getOrganizations } from "@/lib/data";
import { getT } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EventForm } from "../event-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).eventForm.newTitle };
}

export default async function NewEventPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const t = await getT();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">{t.eventForm.newTitle}</h1>
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <Loader />
      </Suspense>
    </div>
  );
}

async function Loader() {
  await requireUser();
  const organizations = await getOrganizations();
  if (organizations.length === 0) redirect("/dashboard");
  // Bare organisasjoner med aktivt medlemskap kan opprette arrangementer.
  const active = organizations.filter((o) => o.hasAccess);
  if (active.length === 0) redirect("/dashboard/medlemskap");
  return <EventForm organizations={active} />;
}
