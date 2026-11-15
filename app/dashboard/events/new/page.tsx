import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getOrganizations } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EventForm } from "../event-form";

export const metadata: Metadata = { title: "Nytt arrangement" };

export default function NewEventPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Nytt arrangement</h1>
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
  return <EventForm organizations={organizations} />;
}
