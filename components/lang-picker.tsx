import { chooseLangHref, type AuthLang } from "@/lib/auth-i18n";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { lang: "nb", short: "NO", label: "Norsk", to: "/" },
  { lang: "en", short: "EN", label: "English", to: "/en" },
] as const;

/**
 * Språkvalg øverst på forsiden: norsk (/) eller engelsk (/en). Valget huskes
 * (via /sprak), så innloggingen også kommer på riktig språk senere.
 */
export function LangPicker({ current, className }: { current: AuthLang; className?: string }) {
  const item =
    "inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav
      aria-label="Språk / Language"
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5 ring-1 ring-foreground/10", className)}
    >
      {OPTIONS.map((o) => {
        const active = o.lang === current;
        return (
          <a
            key={o.lang}
            href={chooseLangHref(o.lang, o.to)}
            lang={o.lang}
            hrefLang={o.lang}
            aria-label={o.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              item,
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="sm:hidden">{o.short}</span>
            <span className="hidden sm:inline">{o.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
