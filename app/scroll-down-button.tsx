"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Ruller ett «ark» ned på forsiden (Sticky Pages har ingen ankere å lenke til). */
export function ScrollDownButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      className="h-12 px-5 text-base"
      onClick={() => {
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.innerHeight, behavior: calm ? "auto" : "smooth" });
      }}
    >
      {children} <ChevronDown />
    </Button>
  );
}
