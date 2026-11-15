const MESSAGES: Record<string, string> = {
  VS_NOT_AUTHENTICATED: "Du må logge inn først.",
  VS_INVALID_NAME: "Skriv inn et navn (maks 80 tegn).",
  VS_INVALID_EMAIL: "E-postadressen ser ikke riktig ut.",
  VS_INVALID_DATE: "Velg en gyldig dato.",
  VS_TOO_MANY_ORGANIZATIONS: "Du er med i for mange organisasjoner.",
  VS_NOT_FOUND: "Fant ikke det du lette etter.",
  VS_USER_NOT_FOUND: "Fant ingen ViStiller-konto med den e-postadressen. Be personen opprette konto først.",
  VS_ALREADY_MEMBER: "Personen er allerede administrator her.",
  VS_TOO_MANY_MEMBERS: "Organisasjonen har nådd grensen på 25 administratorer.",
  VS_OWNER_ONLY: "Bare eieren kan fjerne andre administratorer.",
  VS_LAST_OWNER: "Organisasjonen må ha minst én eier.",
  VS_TASK_NOT_FOUND: "Oppgaven finnes ikke lenger.",
  VS_EVENT_CLOSED: "Påmeldingen er stengt.",
  VS_DEADLINE_PASSED: "Påmeldingsfristen har gått ut.",
  VS_ALREADY_SIGNED_UP: "Du står allerede på denne oppgaven.",
  VS_TASK_FULL: "Noen tok akkurat den siste plassen. Velg gjerne en annen oppgave.",
  VS_SIGNUP_NOT_FOUND: "Fant ikke påmeldingen. Den kan allerede være fjernet.",
};

export const GENERIC_ERROR = "Noe gikk galt. Prøv igjen om litt.";
export const NOT_CONFIGURED = "Supabase er ikke satt opp ennå. Se README for miljøvariabler.";

/** Oversetter databasefeil (VS_*-koder) til norsk tekst som kan vises til brukeren. */
export function messageFor(error: { message?: string } | null | undefined) {
  const code = error?.message?.match(/VS_[A-Z_]+/)?.[0];
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (error?.message) console.error("[vistiller]", error.message);
  // Under utvikling vises den tekniske årsaken, så feil er lette å finne.
  if (process.env.NODE_ENV === "development" && error?.message) {
    return `${GENERIC_ERROR} (${error.message})`;
  }
  return GENERIC_ERROR;
}
