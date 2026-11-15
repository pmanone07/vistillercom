import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicFooter } from "@/components/public/public-footer";
import { SetupNotice } from "@/components/setup-notice";
import { getMySignups } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { BidragDeck } from "./bidrag-deck";

export const metadata: Metadata = {
  title: "Mine bidrag",
  robots: { index: false, follow: false },
  // Den private lenken skal ikke lekke videre til andre nettsteder.
  referrer: "no-referrer",
};

export default function BidragPage({ params }: PageProps<"/b/[token]">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <main className="mx-auto w-full max-w-xl flex-1">
        {isSupabaseConfigured ? (
          <Suspense fallback={<BidragSkeleton />}>
            <Loader params={params} />
          </Suspense>
        ) : (
          <SetupNotice />
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

async function Loader({ params }: Pick<PageProps<"/b/[token]">, "params">) {
  const { token } = await params;
  const data = await getMySignups(token);
  if (!data) return <BidragNotFound />;
  return <BidragDeck token={token} data={data} />;
}

function BidragNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">Fant ikke bidragene dine</h1>
      <p className="max-w-sm text-muted-foreground">
        Lenken kan være ufullstendig, eller arrangementet er avsluttet. Sjekk at du har fått med hele lenken.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
        Til forsiden
      </Link>
    </div>
  );
}

function BidragSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-busy="true" aria-label="Laster bidragene dine">
      <Skeleton className="h-14 rounded-2xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
