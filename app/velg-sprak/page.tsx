import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { AUTH_PATHS, chooseLangHref } from "@/lib/auth-i18n";

export const metadata: Metadata = {
  title: "Velg språk / Choose language",
  robots: { index: false },
};

// Vises første gang appen åpnes av en som ikke er logget inn (se /start i proxy.ts).
// Norsk gir forsiden som før, English gir den engelske innloggingen.
const choices = [
  { lang: "nb", label: "Norsk", sub: "Fortsett på norsk", to: "/" },
  { lang: "en", label: "English", sub: "Continue in English", to: AUTH_PATHS.en.login },
] as const;

export default function ChooseLanguagePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Logo className="mb-6 text-xl" />
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
        <h1 className="text-xl font-bold">
          Velg språk <span className="font-normal text-muted-foreground">/</span>{" "}
          <span lang="en">Choose language</span>
        </h1>
        <ul className="mt-5 space-y-3">
          {choices.map((choice) => (
            <li key={choice.lang}>
              <a
                href={chooseLangHref(choice.lang, choice.to)}
                lang={choice.lang}
                hrefLang={choice.lang}
                className="flex min-h-14 items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-foreground/15 transition-colors hover:bg-muted"
              >
                <span>
                  <span className="block text-base font-semibold">{choice.label}</span>
                  <span className="block text-sm text-muted-foreground">{choice.sub}</span>
                </span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
