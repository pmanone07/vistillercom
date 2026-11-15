import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EventNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">Fant ikke arrangementet</h1>
      <p className="max-w-sm text-muted-foreground">
        Lenken kan være ufullstendig, eller arrangementet er avsluttet. Sjekk at du har fått med hele lenken.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
        Til forsiden
      </Link>
    </div>
  );
}
