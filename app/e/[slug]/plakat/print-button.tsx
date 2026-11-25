"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label }: { label: string }) {
  return (
    <Button onClick={() => window.print()} className="mb-8 h-12 px-5 text-base print:hidden">
      <Printer /> {label}
    </Button>
  );
}
