import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Statisk side, så den vises på begge språk.
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Fant ikke siden</h1>
      <p className="text-muted-foreground">Lenken kan være feil eller utdatert.</p>
      <div lang="en">
        <p className="font-semibold">Page not found</p>
        <p className="text-muted-foreground">The link may be wrong or out of date.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className={cn(buttonVariants(), "h-12 px-5 text-base")}>
          Til forsiden
        </Link>
        <Link href="/en" lang="en" className={cn(buttonVariants({ variant: "outline" }), "h-12 px-5 text-base")}>
          Go to the front page
        </Link>
      </div>
    </main>
  );
}
