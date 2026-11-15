import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Fant ikke siden</h1>
      <p className="text-muted-foreground">Lenken kan være feil eller utdatert.</p>
      <Link href="/" className={cn(buttonVariants(), "h-12 px-5 text-base")}>
        Til forsiden
      </Link>
    </main>
  );
}
