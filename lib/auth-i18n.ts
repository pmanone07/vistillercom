// Tekster for innlogging og registrering på norsk og engelsk. Resten av
// tekstene ligger i lib/i18n.ts. Trygg å bruke både på serveren og i nettleseren.

import { PATHS, type Lang } from "@/lib/i18n";

export { LANG_COOKIE, chooseLangHref, isLang as isAuthLang } from "@/lib/i18n";
export type AuthLang = Lang;

/** Hvor innlogging/registrering ligger for hvert språk. */
export const AUTH_PATHS = {
  nb: { login: PATHS.nb.login, register: PATHS.nb.register },
  en: { login: PATHS.en.login, register: PATHS.en.register },
} as const;

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
    termsHref: PATHS.nb.terms,
    privacyHref: PATHS.nb.privacy,
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
    termsHref: PATHS.en.terms,
    privacyHref: PATHS.en.privacy,
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
