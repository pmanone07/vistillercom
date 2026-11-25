// Tekster for innlogging og registrering på norsk og engelsk.
// Resten av ViStiller (dashbord, arrangementer, juridiske sider) er bare på norsk.
// Trygg å bruke både på serveren og i nettleseren.

export type AuthLang = "nb" | "en";

/** Informasjonskapsel med språket brukeren valgte da appen ble åpnet. */
export const LANG_COOKIE = "vistiller-lang";

export function isAuthLang(value: unknown): value is AuthLang {
  return value === "nb" || value === "en";
}

/** Hvor innlogging/registrering ligger for hvert språk. */
export const AUTH_PATHS = {
  nb: { login: "/login", register: "/registrer" },
  en: { login: "/en/login", register: "/en/register" },
} as const;

/** Lenke som lagrer språkvalget og sender brukeren videre (se app/sprak/route.ts). */
export function chooseLangHref(lang: AuthLang, to: string) {
  return `/sprak?lang=${lang}&to=${encodeURIComponent(to)}`;
}

export const AUTH_TEXT = {
  nb: {
    email: "E-post",
    password: "Passord",
    passwordHint: "Minst 8 tegn.",
    login: "Logg inn",
    register: "Opprett konto",
    noAccount: "Har du ikke konto? ",
    haveAccount: "Har du konto fra før? ",
    acceptPrefix: "Ved å opprette konto godtar du ",
    terms: "brukervilkårene",
    readAlso: ". Les også ",
    privacy: "personvernerklæringen",
    errors: {
      invalidEmail: "Skriv inn en gyldig e-postadresse.",
      shortPassword: "Passordet må ha minst 8 tegn.",
      notConfirmed: "Du må bekrefte e-postadressen først. Sjekk innboksen din.",
      wrongCredentials: "Feil e-post eller passord.",
      weakPassword: "Passordet er for svakt. Velg et lengre passord.",
      rateLimit: "For mange forsøk. Vent litt og prøv igjen.",
      signUpFailed: "Kunne ikke opprette konto. Prøv igjen.",
      notConfigured: "Supabase er ikke satt opp ennå. Se README for miljøvariabler.",
    },
    checkEmail: "Sjekk e-posten din og trykk på lenken for å fullføre registreringen.",
  },
  en: {
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters.",
    login: "Log in",
    register: "Create account",
    noAccount: "Don't have an account? ",
    haveAccount: "Already have an account? ",
    acceptPrefix: "By creating an account you accept the ",
    terms: "terms of service",
    readAlso: ". Please also read the ",
    privacy: "privacy policy",
    errors: {
      invalidEmail: "Enter a valid email address.",
      shortPassword: "The password must be at least 8 characters.",
      notConfirmed: "You need to confirm your email address first. Check your inbox.",
      wrongCredentials: "Wrong email or password.",
      weakPassword: "The password is too weak. Choose a longer password.",
      rateLimit: "Too many attempts. Wait a moment and try again.",
      signUpFailed: "Could not create the account. Please try again.",
      notConfigured: "Supabase is not configured yet. See the README for environment variables.",
    },
    checkEmail: "Check your email and tap the link to finish signing up.",
  },
} as const;
