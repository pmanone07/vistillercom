// Opplysninger som vises i personvernerklæringen, vilkårene og på /slett-konto.

/** Navnet på den behandlingsansvarlige. Tomt = vises ikke (fyll inn før lansering). */
export const CONTROLLER_NAME = "";

/** Adressen for personvernspørsmål og slettebegjæringer. Vises offentlig. */
export const CONTACT_EMAIL = "the.pman07@gmail.com";

// Oppdater begge språk samtidig når teksten endres.
export const PRIVACY_UPDATED = "25. november 2026";
export const PRIVACY_UPDATED_EN = "25 November 2026";
export const TERMS_UPDATED = "22. november 2026";
export const TERMS_UPDATED_EN = "22 November 2026";

export const deletionMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Sletting av ViStiller-konto")}`;
export const privacyMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Personvern i ViStiller")}`;
export const deletionMailtoEn = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Delete my ViStiller account")}`;
export const privacyMailtoEn = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Privacy in ViStiller")}`;
