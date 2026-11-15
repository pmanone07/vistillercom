import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicFooter } from "@/components/public/public-footer";
import { SetupNotice } from "@/components/setup-notice";
import { formatEventWhen } from "@/lib/format";
import { getPublicEvent } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PublicEventView } from "./public-event-view";

export async function generateMetadata({ params }: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug).catch(() => null);
  if (!event) return { title: "Arrangement", robots: { index: false, follow: false } };
  const description = `${event.organization_name} · ${formatEventWhen(event.starts_at, event.ends_at)}. Se hva som trengs, og meld deg på.`;
  return {
    title: event.title,
    description,
    // Delingslenker skal ikke dukke opp i søk.
    robots: { index: false, follow: false },
    openGraph: { title: event.title, description },
  };
}

export default function PublicEventPage({ params }: PageProps<"/e/[slug]">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-10 sm:pt-10">
        {isSupabaseConfigured ? (
          <Suspense fallback={<EventSkeleton />}>
            <Loader params={params} />
          </Suspense>
        ) : (
          <SetupNotice />
        )}
      </main>
      <PublicFooter />
      {/* Tittelen hentes per forespørsel (se generateMetadata), så siden må merkes som dynamisk. */}
      <Suspense>
        <DynamicMarker />
      </Suspense>
    </div>
  );
}

async function DynamicMarker() {
  await connection();
  return null;
}

async function Loader({ params }: Pick<PageProps<"/e/[slug]">, "params">) {
  const { slug } = await params;
  await connection(); // ledige plasser skal alltid være ferske
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  return <PublicEventView event={event} />;
}

function EventSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Laster arrangementet">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
