import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Vi vet ikke hvilket språk arrangementet hadde, så siden vises på begge.
export default function EventNotFound() {
  const nb = getMessages("nb").public;
  const en = getMessages("en").public;
  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">{nb.notFoundTitle}</h1>
      <p className="max-w-sm text-muted-foreground">{nb.notFoundText}</p>
      <div lang="en" className="space-y-2">
        <p className="text-lg font-semibold">{en.notFoundTitle}</p>
        <p className="max-w-sm text-muted-foreground">{en.notFoundText}</p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
        {getMessages("nb").common.toHome} / Home
      </Link>
    </div>
  );
}
