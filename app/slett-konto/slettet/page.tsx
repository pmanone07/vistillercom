import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kontoen er slettet",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <LegalPage title="Kontoen er slettet">
      <div className="flex flex-col items-start gap-4">
        <p className="flex items-start gap-2 text-lg">
          <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          Kontoen din og personopplysningene som hørte til, er slettet. Takk for at du brukte ViStiller.
        </p>
        <Link href="/" className={cn(buttonVariants(), "h-11 px-5")}>
          Til forsiden
        </Link>
      </div>
    </LegalPage>
  );
}
