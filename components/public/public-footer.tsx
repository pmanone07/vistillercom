import Link from "next/link";
import { LegalLinks } from "@/components/legal-links";
import { getMessages, PATHS, type Lang } from "@/lib/i18n";

export function PublicFooter({ lang = "nb" }: { lang?: Lang }) {
  const t = getMessages(lang).common;
  return (
    <footer className="px-4 py-6 pb-safe-bar text-center text-xs text-muted-foreground">
      {t.madeWith}{" "}
      <Link href={PATHS[lang].home} className="font-semibold text-foreground underline-offset-4 hover:underline">
        ViStiller
      </Link>{" "}
      {t.footerTagline}
      <LegalLinks lang={lang} className="mt-2" />
    </footer>
  );
}
