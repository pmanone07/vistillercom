import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your account has been deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPageEn() {
  return (
    <LegalPage lang="en" page="accountDeleted" title="Your account has been deleted">
      <div className="flex flex-col items-start gap-4">
        <p className="flex items-start gap-2 text-lg">
          <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          Your account and the personal data that belonged to it have been deleted. Thank you for using ViStiller.
        </p>
        <Link href="/en" className={cn(buttonVariants(), "h-11 px-5")}>
          Go to the front page
        </Link>
      </div>
    </LegalPage>
  );
}
