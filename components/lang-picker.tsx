import { AUTH_PATHS, chooseLangHref } from "@/lib/auth-i18n";
import { cn } from "@/lib/utils";

/**
 * Språkvalg øverst på forsiden. «Norsk» er forsiden selv; «English» går til
 * den engelske innloggingen. Valget huskes (via /sprak), så innloggingen
 * kommer på riktig språk også senere.
 */
export function LangPicker({ className }: { className?: string }) {
  const item =
    "inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav
      aria-label="Språk / Language"
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5 ring-1 ring-foreground/10", className)}
    >
      <a
        href={chooseLangHref("nb", "/")}
        lang="nb"
        hrefLang="nb"
        aria-current="page"
        aria-label="Norsk"
        className={cn(item, "bg-background text-foreground shadow-sm")}
      >
        <span className="sm:hidden">NO</span>
        <span className="hidden sm:inline">Norsk</span>
      </a>
      <a
        href={chooseLangHref("en", AUTH_PATHS.en.login)}
        lang="en"
        hrefLang="en"
        aria-label="English"
        className={cn(item, "text-muted-foreground hover:text-foreground")}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </a>
    </nav>
  );
}
