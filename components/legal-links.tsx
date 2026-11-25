import Link from "next/link";
import { cn } from "@/lib/utils";

const LABELS = {
  nb: { nav: "Vilkår og personvern", terms: "Vilkår", privacy: "Personvern", del: "Slett konto" },
  // Sidene selv finnes bare på norsk.
  en: { nav: "Terms and privacy", terms: "Terms (Norwegian)", privacy: "Privacy (Norwegian)", del: "Delete account" },
} as const;

/** Lenkene til personvern og kontosletting, brukt i alle bunntekster. */
export function LegalLinks({
  className,
  linkClassName,
  lang = "nb",
}: {
  className?: string;
  linkClassName?: string;
  lang?: "nb" | "en";
}) {
  const link = cn("underline-offset-4 hover:underline", linkClassName);
  const t = LABELS[lang];
  return (
    <nav aria-label={t.nav} className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", className)}>
      <Link href="/vilkar" className={link}>
        {t.terms}
      </Link>
      <Link href="/personvern" className={link}>
        {t.privacy}
      </Link>
      <Link href="/slett-konto" className={link}>
        {t.del}
      </Link>
    </nav>
  );
}
