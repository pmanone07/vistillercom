import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getMessages, isLang, LANG_COOKIE, type Lang } from "@/lib/i18n";

/** Språket brukeren har valgt, eller null. Leser en informasjonskapsel, så siden blir dynamisk. */
export const getChosenLang = cache(async (): Promise<Lang | null> => {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : null;
});

/** Språket for arrangørsidene: valgt språk, ellers norsk. */
export async function getLang(): Promise<Lang> {
  return (await getChosenLang()) ?? "nb";
}

/** Tekstene på brukerens språk (for server-komponenter og server actions). */
export async function getT() {
  return getMessages(await getLang());
}
