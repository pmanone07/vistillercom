// Det gjesten har på enheten sin: privat token per arrangement, og navn/e-post
// slik at neste påmelding er ett trykk. Alt er valgfritt og kan mangle.
const TOKEN_PREFIX = "vistiller:token:";
const CONTACT_KEY = "vistiller:kontakt";

export interface GuestContact {
  name: string;
  email: string;
}

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Privat modus e.l. – siden fungerer uten.
  }
}

export function getGuestToken(slug: string) {
  return read(TOKEN_PREFIX + slug);
}

export function setGuestToken(slug: string, token: string) {
  write(TOKEN_PREFIX + slug, token);
}

export function getGuestContact(): GuestContact {
  try {
    const parsed = JSON.parse(read(CONTACT_KEY) ?? "{}");
    return { name: typeof parsed.name === "string" ? parsed.name : "", email: typeof parsed.email === "string" ? parsed.email : "" };
  } catch {
    return { name: "", email: "" };
  }
}

export function setGuestContact(contact: GuestContact) {
  write(CONTACT_KEY, JSON.stringify(contact));
}
