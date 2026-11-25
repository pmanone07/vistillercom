import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LangProvider } from "@/components/i18n-provider";
import { LangPicker } from "@/components/lang-picker";
import { PublicFooter } from "@/components/public/public-footer";
import { SetupNotice } from "@/components/setup-notice";
import { getMessages, PATHS, type Lang } from "@/lib/i18n";
import { getChosenLang } from "@/lib/i18n-server";
import { getMySignups } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { BidragDeck } from "./bidrag-deck";

export const metadata: Metadata = {
  title: "Mine bidrag / My contributions",
  robots: { index: false, follow: false },
  // Den private lenken skal ikke lekke videre til andre nettsteder.
  referrer: "no-referrer",
};

export default function BidragPage({ params }: PageProps<"/b/[token]">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      {isSupabaseConfigured ? (
        <Suspense fallback={<BidragSkeleton />}>
          <Loader params={params} />
        </Suspense>
      ) : (
        <>
          <main className="mx-auto w-full max-w-xl flex-1">
            <SetupNotice />
          </main>
          <PublicFooter />
        </>
      )}
    </div>
  );
}

async function Loader({ params }: Pick<PageProps<"/b/[token]">, "params">) {
  const { token } = await params;
  const data = await getMySignups(token);
  // Deltakerens eget valg, ellers språket arrangementet ble laget på.
  const lang: Lang = (await getChosenLang()) ?? data?.event.language ?? "nb";
  const here = `/b/${token}`;
  return (
    <LangProvider lang={lang}>
      <main lang={lang === "en" ? "en" : undefined} className="mx-auto w-full max-w-xl flex-1">
        <div className="flex justify-end px-4 pt-3 pb-1">
          <LangPicker current={lang} to={{ nb: here, en: here }} />
        </div>
        {data ? <BidragDeck token={token} data={data} /> : <BidragNotFound lang={lang} />}
      </main>
      <PublicFooter lang={lang} />
    </LangProvider>
  );
}

function BidragNotFound({ lang }: { lang: Lang }) {
  const t = getMessages(lang);
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">{t.bidrag.notFoundTitle}</h1>
      <p className="max-w-sm text-muted-foreground">{t.bidrag.notFoundText}</p>
      <Link href={PATHS[lang].home} className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
        {t.common.toHome}
      </Link>
    </div>
  );
}

function BidragSkeleton() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1">
      <div className="space-y-4 p-4" aria-busy="true">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </main>
  );
}
