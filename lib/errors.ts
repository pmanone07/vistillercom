import { getMessages, type Lang, type Messages } from "@/lib/i18n";

type ErrorCode = Extract<keyof Messages["errors"], `VS_${string}`>;

export const GENERIC_ERROR = getMessages("nb").errors.generic;
export const NOT_CONFIGURED = getMessages("nb").errors.notConfigured;

/** Oversetter databasefeil (VS_*-koder) til tekst som kan vises til brukeren. */
export function messageFor(error: { message?: string } | null | undefined, lang: Lang = "nb") {
  const t = getMessages(lang).errors;
  const code = error?.message?.match(/VS_[A-Z_]+/)?.[0];
  if (code && code in t) return t[code as ErrorCode];
  if (error?.message) console.error("[vistiller]", error.message);
  // Under utvikling vises den tekniske årsaken, så feil er lette å finne.
  if (process.env.NODE_ENV === "development" && error?.message) {
    return `${t.generic} (${error.message})`;
  }
  return t.generic;
}
