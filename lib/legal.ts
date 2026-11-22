// Opplysninger som vises i personvernerklæringen og på /slett-konto.

/** Navnet på den behandlingsansvarlige. Tomt = vises ikke (fyll inn før lansering). */
export const CONTROLLER_NAME = "";

/** Adressen for personvernspørsmål og slettebegjæringer. Vises offentlig. */
export const CONTACT_EMAIL = "the.pman07@gmail.com";

export const PRIVACY_UPDATED = "22. november 2026";
export const TERMS_UPDATED = "22. november 2026";

export const deletionMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Sletting av ViStiller-konto")}`;
export const privacyMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Personvern i ViStiller")}`;

/** Ordet brukeren må skrive for å slette kontoen. */
export const DELETE_CONFIRMATION = "SLETT";
