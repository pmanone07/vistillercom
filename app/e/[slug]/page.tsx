import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LangProvider } from "@/components/i18n-provider";
import { LangPicker } from "@/components/lang-picker";
import { PublicFooter } from "@/components/public/public-footer";
import { SetupNotice } from "@/components/setup-notice";
import { formatEventWhen } from "@/lib/format";
import { getMessages, type Lang } from "@/lib/i18n";
import { getChosenLang } from "@/lib/i18n-server";
import { getPublicEvent } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PublicEvent } from "@/lib/types";
import { PublicEventView } from "./public-event-view";

/** Deltakerens eget valg, ellers språket arrangementet ble laget på. */
async function eventLang(event: PublicEvent | null): Promise<Lang> {
  return (await getChosenLang()) ?? event?.language ?? "nb";
}

export async function generateMetadata({ params }: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug).catch(() => null);
  const lang = await eventLang(event);
  const t = getMessages(lang);
  if (!event) return { title: t.event.pageTitle, robots: { index: false, follow: false } };
  const description = t.public.metaDescription(event.organization_name, formatEventWhen(event.starts_at, event.ends_at, lang));
  return {
    title: event.title,
    description,
    // Delingslenker skal ikke dukke opp i søk.
    robots: { index: false, follow: false },
    openGraph: { title: event.title, description, locale: lang === "en" ? "en_GB" : "nb_NO" },
  };
}

export default function PublicEventPage({ params }: PageProps<"/e/[slug]">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      {isSupabaseConfigured ? (
        <Suspense fallback={<EventSkeleton />}>
          <Loader params={params} />
        </Suspense>
      ) : (
        <>
          <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-10 sm:pt-10">
            <SetupNotice />
          </main>
          <PublicFooter />
        </>
      )}
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
  const lang = await eventLang(event);
  const here = `/e/${event.slug}`;
  return (
    <LangProvider lang={lang}>
      <main lang={lang === "en" ? "en" : undefined} className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-10 sm:pt-8">
        <div className="mb-3 flex justify-end">
          <LangPicker current={lang} to={{ nb: here, en: here }} />
        </div>
        <PublicEventView event={event} />
      </main>
      <PublicFooter lang={lang} />
    </LangProvider>
  );
}

function EventSkeleton() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-10 sm:pt-10">
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </main>
  );
}
