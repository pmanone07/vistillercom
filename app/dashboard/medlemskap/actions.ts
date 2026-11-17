"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getStripe, isBillingEnabled, membershipLineItem, stripeAutomaticTax, syncSubscription } from "@/lib/billing";
import { membershipIsActive } from "@/lib/membership";
import { getOrigin } from "@/lib/public-data";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

const NOT_ENABLED = "Betaling er ikke satt opp ennå.";
const STRIPE_FAILED = "Fikk ikke kontakt med betalingsløsningen. Prøv igjen om litt.";

/** Organisasjonen slik innlogget bruker ser den. RLS gir null hvis man ikke er medlem. */
async function getOwnOrganization(organizationId: string) {
  if (!z.uuid().safeParse(organizationId).success) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, stripe_customer_id, subscription_status, access_until")
    .eq("id", organizationId)
    .maybeSingle();
  return data;
}

/** Starter Stripe Checkout for årsmedlemskap. Returnerer adressen brukeren skal sendes til. */
export async function startCheckout(organizationId: string): Promise<ActionResult<{ url: string }>> {
  if (!isBillingEnabled) return { ok: false, error: NOT_ENABLED };
  const user = await requireUser();
  const org = await getOwnOrganization(organizationId);
  if (!org) return { ok: false, error: "Fant ikke organisasjonen." };
  if (membershipIsActive(org, Date.now())) {
    return { ok: false, error: "Organisasjonen har allerede et aktivt medlemskap." };
  }

  const origin = await getOrigin();
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [membershipLineItem()],
      locale: "nb",
      // Gjenbruk Stripe-kunden hvis organisasjonen har hatt medlemskap før.
      ...(org.stripe_customer_id ? { customer: org.stripe_customer_id } : { customer_email: user.email }),
      // Mva er inkludert i prisen. Med Stripe Tax påslått spesifiseres mva-andelen på kvitteringen.
      ...(stripeAutomaticTax
        ? {
            automatic_tax: { enabled: true },
            ...(org.stripe_customer_id ? { customer_update: { address: "auto" as const } } : {}),
          }
        : {}),
      client_reference_id: org.id,
      metadata: { organization_id: org.id },
      subscription_data: {
        description: `ViStiller-medlemskap for ${org.name}`,
        metadata: { organization_id: org.id },
      },
      success_url: `${origin}/dashboard/medlemskap?betalt={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/medlemskap?avbrutt=1`,
    });
    if (!session.url) return { ok: false, error: STRIPE_FAILED };
    return { ok: true, data: { url: session.url } };
  } catch (err) {
    console.error("[vistiller] startCheckout", err instanceof Error ? err.message : err);
    return { ok: false, error: STRIPE_FAILED };
  }
}

/**
 * Kalles når brukeren kommer tilbake fra Stripe. Henter betalingen direkte fra
 * Stripe, så tilgangen er på plass med en gang – uten å vente på webhooken.
 */
export async function confirmCheckout(sessionId: string): Promise<ActionResult<{ paid: boolean }>> {
  if (!isBillingEnabled) return { ok: false, error: NOT_ENABLED };
  await requireUser();
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return { ok: false, error: "Ugyldig betalingsreferanse." };

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    // Bare medlemmer av organisasjonen betalingen gjelder, får bekrefte den.
    const org = session.client_reference_id ? await getOwnOrganization(session.client_reference_id) : null;
    if (!org) return { ok: false, error: "Fant ikke organisasjonen." };

    const subscription = session.subscription;
    if (session.status !== "complete" || !subscription || typeof subscription === "string") {
      return { ok: true, data: { paid: false } };
    }
    await syncSubscription(subscription, org.id);
    return { ok: true, data: { paid: true } };
  } catch (err) {
    console.error("[vistiller] confirmCheckout", err instanceof Error ? err.message : err);
    return { ok: false, error: STRIPE_FAILED };
  }
}

/** Åpner Stripe sin kundeportal: si opp, bytte kort, se kvitteringer. */
export async function openBillingPortal(organizationId: string): Promise<ActionResult<{ url: string }>> {
  if (!isBillingEnabled) return { ok: false, error: NOT_ENABLED };
  await requireUser();
  const org = await getOwnOrganization(organizationId);
  if (!org?.stripe_customer_id) return { ok: false, error: "Organisasjonen har ikke noe abonnement å administrere." };

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      locale: "nb",
      return_url: `${await getOrigin()}/dashboard/medlemskap`,
    });
    return { ok: true, data: { url: portal.url } };
  } catch (err) {
    console.error("[vistiller] openBillingPortal", err instanceof Error ? err.message : err);
    return { ok: false, error: STRIPE_FAILED };
  }
}
