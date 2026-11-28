"use client";

import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Vises øverst når arrangøren forhåndsviser siden (?preview=<id>).
 * Lenker rett til arrangementet i appen (ikke «tilbake» i historikken, som
 * etter et språkbytte bare ville vist forrige språkversjon av siden).
 */
export function PreviewBar({ backHref }: { backHref: string }) {
  const t = useT().public;
  return (
    <div className="sticky top-0 z-20 border-b bg-primary pt-[env(safe-area-inset-top)] text-primary-foreground">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-2">
        <Link href={backHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-9 shrink-0")}>
          <ArrowLeft /> {t.backToApp}
        </Link>
        <p className="flex min-w-0 items-center gap-1.5 text-sm">
          <Eye className="size-4 shrink-0" aria-hidden />
          <span className="truncate sm:hidden">{t.previewLabel}</span>
          <span className="truncate max-sm:hidden">{t.previewNotice}</span>
        </p>
      </div>
    </div>
  );
}
