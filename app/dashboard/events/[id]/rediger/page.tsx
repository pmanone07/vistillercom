import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getEventWithTasks, getOrganizations } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EventForm } from "../../event-form";

export const metadata: Metadata = { title: "Rediger arrangement" };

export default function EditEventPage({ params }: PageProps<"/dashboard/events/[id]/rediger">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Rediger arrangement</h1>
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <Loader params={params} />
      </Suspense>
    </div>
  );
}

async function Loader({ params }: Pick<PageProps<"/dashboard/events/[id]/rediger">, "params">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  await requireUser();
  const [data, organizations] = await Promise.all([getEventWithTasks(id), getOrganizations()]);
  if (!data) notFound();
  if (!organizations.find((o) => o.id === data.event.organization_id)?.hasAccess) redirect("/dashboard/medlemskap");
  return <EventForm organizations={organizations} event={data.event} />;
}
