"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Noe gikk galt</h1>
      <p className="text-muted-foreground">Vi fikk ikke hentet siden. Sjekk nettforbindelsen og prøv igjen.</p>
      <Button onClick={reset} className="h-12 px-5 text-base">
        Prøv igjen
      </Button>
    </main>
  );
}
