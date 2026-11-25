import { Languages } from "lucide-react";
import { chooseLangHref, type AuthLang } from "@/lib/auth-i18n";
import { cn } from "@/lib/utils";

/**
 * Bytter språk på innloggings- og registreringssidene. Går via /sprak, som
 * husker valget til neste gang appen åpnes. Vanlig <a>, fordi /sprak er en
 * route handler som setter en informasjonskapsel og videresender.
 */
export function LangSwitch({ to, lang, className }: { to: string; lang: AuthLang; className?: string }) {
  return (
    <a
      href={chooseLangHref(lang, to)}
      hrefLang={lang === "en" ? "en" : "nb"}
      lang={lang === "en" ? "en" : "nb"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-foreground/10 hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      {lang === "en" ? "English" : "Norsk"}
    </a>
  );
}
