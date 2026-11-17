// Pris og vilkår for medlemskapet. Endres her, og vises likt overalt.
// (Selve beløpet som trekkes settes i lib/billing.ts fra de samme tallene.)
export const MEMBERSHIP = {
  priceNok: 499,
  priceLabel: "499 kr",
  /** Prisen er sluttprisen kunden betaler. Stripe får samme beskjed (tax_behavior: inclusive). */
  vatLabel: "inkl. mva",
  intervalLabel: "per år",
  unitLabel: "per organisasjon",
  productName: "ViStiller-medlemskap",
  included: [
    "Ubegrenset antall arrangementer og oppgaver",
    "Delingslenke og QR-kode til hvert arrangement",
    "Deltakere melder seg på uten konto – helt gratis for dem",
    "Flere administratorer i samme organisasjon",
    "Kopier fjorårets arrangement med ett trykk",
  ],
  terms: [
    "499 kr inkl. mva trekkes når du starter, og deretter én gang i året.",
    "Prisen er inkludert merverdiavgift. Ingenting kommer i tillegg.",
    "Abonnementet fornyes automatisk til du sier det opp.",
    "Du kan si opp når som helst under «Medlemskap». Tilgangen varer ut perioden du har betalt for.",
    "Betalingen gjelder én organisasjon (skole, lag, korps eller gruppe), uansett hvor mange administratorer dere er.",
    "Sikker kortbetaling via Stripe. ViStiller lagrer ikke kortopplysninger.",
  ],
} as const;

export interface MembershipFields {
  subscription_status?: string | null;
  access_until?: string | null;
  cancel_at_period_end?: boolean;
}

/** Statuser der Stripe fortsatt regner abonnementet som løpende. */
const LIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Har organisasjonen betalt tilgang akkurat nå? `now` sendes inn av den som spør. */
export function membershipIsActive(org: MembershipFields, now: number) {
  if (!org.access_until || !org.subscription_status) return false;
  return LIVE_STATUSES.has(org.subscription_status) && new Date(org.access_until).getTime() > now;
}
