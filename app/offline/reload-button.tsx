"use client";

import { Button } from "@/components/ui/button";

export function ReloadButton() {
  return (
    <Button onClick={() => window.location.reload()} className="h-12 px-5 text-base">
      Prøv igjen
    </Button>
  );
}
