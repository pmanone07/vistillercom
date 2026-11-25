import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/auth";
import { getEventWithTasks, requireOrgAccess } from "@/lib/data";
import { getT } from "@/lib/i18n-server";
import { isSupabaseConfigured, siteUrl } from "@/lib/supabase/env";
import { EventAdmin } from "./event-admin";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).event.pageTitle };
}

export default function EventPage({ params }: PageProps<"/dashboard/events/[id]">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<EventSkeleton />}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: Pick<PageProps<"/dashboard/events/[id]">, "params">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  await requireUser();
  const data = await getEventWithTasks(id);
  if (!data) notFound();
  await requireOrgAccess(data.event.organization_id);
  return <EventAdmin {...data} siteUrl={siteUrl} />;
}

function EventSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
