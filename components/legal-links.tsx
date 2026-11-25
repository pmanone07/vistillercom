import Link from "next/link";
import { getMessages, PATHS, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Lenkene til vilkår, personvern og kontosletting, brukt i alle bunntekster. */
export function LegalLinks({
  className,
  linkClassName,
  lang = "nb",
}: {
  className?: string;
  linkClassName?: string;
  lang?: Lang;
}) {
  const link = cn("underline-offset-4 hover:underline", linkClassName);
  const t = getMessages(lang).common;
  const paths = PATHS[lang];
  return (
    <nav aria-label={t.legalNav} className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", className)}>
      <Link href={paths.terms} className={link}>
        {t.terms}
      </Link>
      <Link href={paths.privacy} className={link}>
        {t.privacy}
      </Link>
      <Link href={paths.deleteAccount} className={link}>
        {t.deleteAccount}
      </Link>
    </nav>
  );
}
