import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { MEMBERSHIP } from "@/lib/membership";
import { supabaseUrl } from "@/lib/supabase/env";

// Hemmelige nøkler. Leses bare her, på serveren, og sendes aldri til nettleseren.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
// NEXT_SUPABASE_SECRET_KEY godtas også, siden det er navnet som ligger i Vercel.
// (Bare NEXT_PUBLIC_-variabler havner i nettleseren, så dette er fortsatt hemmelig.)
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.NEXT_SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/**
 * Betalingsmuren er bare på når både Stripe og Supabase sin servernøkkel er
 * satt. Mangler de, er alt åpent – slik at siden ikke låser folk ute før
 * betalingen faktisk kan gjennomføres.
 */
export const isBillingEnabled = Boolean(stripeSecretKey && supabaseSecretKey && supabaseUrl);

/**
 * MIDLERTIDIG AV mens appen testes og godkjennes i Google Play.
 * Sett tilbake til false for å slå betalingsmuren på igjen.
 * Stripe, medlemskapssiden og webhooken virker som før; det er bare kravet
 * om aktivt medlemskap for å bruke dashbordet som er pauset.
 */
const PAYWALL_PAUSED = true;

/** Kreves aktivt medlemskap for å opprette og administrere arrangementer? */
export const isPaywallEnabled = isBillingEnabled && !PAYWALL_PAUSED;

/**
 * Sett STRIPE_AUTOMATIC_TAX=true når Stripe Tax er satt opp (med norsk
 * mva-registrering). Da regner Stripe ut mva-andelen av de 499 kronene og
 * viser den på kvitteringen. Uten dette trekkes fortsatt nøyaktig 499 kr.
 */
export const stripeAutomaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";

let stripeClient: Stripe | null = null;
export function getStripe() {
  if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY mangler");
  stripeClient ??= new Stripe(stripeSecretKey);
  return stripeClient;
}

/** Servernøkkelen til Supabase er satt (trengs for medlemskap og kontosletting). */
export const isAdminConfigured = Boolean(supabaseSecretKey && supabaseUrl);

/**
 * Supabase med servernøkkel – går forbi RLS. Brukes kun til å skrive
 * medlemskapsstatus og til å slette en konto brukeren selv har bedt om.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Det som trekkes i Stripe Checkout. Bruker STRIPE_PRICE_ID hvis den er satt. */
export function membershipLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId) return { price: priceId, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: "nok",
      unit_amount: MEMBERSHIP.priceNok * 100,
      recurring: { interval: "year" },
      // 499 kr er sluttprisen: mva er inkludert, og legges aldri oppå.
      tax_behavior: "inclusive",
      product_data: { name: MEMBERSHIP.productName },
    },
  };
}

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Speiler et Stripe-abonnement inn i organisasjonen. `organizationId` kan
 * utelates når abonnementet allerede er koblet til en organisasjon.
 */
export async function syncSubscription(subscription: Stripe.Subscription, organizationId?: string | null) {
  const periodEnds = subscription.items.data.map((item) => item.current_period_end).filter(Boolean);
  const accessUntil = periodEnds.length > 0 ? new Date(Math.max(...periodEnds) * 1000).toISOString() : null;

  const { error } = await createAdminClient().rpc("set_org_membership", {
    p_org_id: organizationId ?? subscription.metadata?.organization_id ?? null,
    p_customer_id: idOf(subscription.customer),
    p_subscription_id: subscription.id,
    p_status: subscription.status,
    p_access_until: accessUntil,
    // Oppsigelse meldes på to måter: eldre flagg (cancel_at_period_end) eller,
    // fra kundeportalen, en sluttdato (cancel_at). Begge betyr «fornyes ikke».
    p_cancel_at_period_end: subscription.cancel_at_period_end || subscription.cancel_at != null,
  });
  if (error) throw new Error(`set_org_membership: ${error.message}`);
}

export { idOf as stripeId };
