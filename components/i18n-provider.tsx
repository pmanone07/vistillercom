"use client";

import { createContext, useContext } from "react";
import { getMessages, type Lang, type Messages } from "@/lib/i18n";

const LangContext = createContext<Lang>("nb");

/** Gir klientkomponentene under seg riktig språk. Språket bestemmes på serveren. */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Tekstene på gjeldende språk. */
export function useT(): Messages {
  return getMessages(useContext(LangContext));
}
