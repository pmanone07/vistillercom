"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getStripe, isBillingEnabled, membershipLineItem, stripeAutomaticTax, syncSubscription } from "@/lib/billing";
import { getMessages } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { membershipIsActive } from "@/lib/membership";
import { getOrigin } from "@/lib/public-data";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

async function texts() {
  const lang = await getLang();
  return { lang, t: getMessages(lang).membership };
}

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
  const { lang, t } = await texts();
  if (!isBillingEnabled) return { ok: false, error: t.errNotEnabled };
  const user = await requireUser();
  const org = await getOwnOrganization(organizationId);
  if (!org) return { ok: false, error: t.errOrg };
  if (membershipIsActive(org, Date.now())) {
    return { ok: false, error: t.errAlready };
  }

  const origin = await getOrigin();
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [membershipLineItem()],
      locale: lang === "en" ? "en" : "nb",
      // Vanlig betaling: ViStiller er selger, og kunden betaler nøyaktig prisen.
      // Stripe-kontoen har Managed Payments (Stripe som selger) på som standard,
      // og det krever avgiftskode på produktet – så det slås av for disse kjøpene.
      managed_payments: { enabled: false },
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
        description: t.stripeDescription(org.name),
        metadata: { organization_id: org.id },
      },
      success_url: `${origin}/dashboard/medlemskap?betalt={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/medlemskap?avbrutt=1`,
    });
    if (!session.url) return { ok: false, error: t.errStripe };
    return { ok: true, data: { url: session.url } };
  } catch (err) {
    console.error("[vistiller] startCheckout", err instanceof Error ? err.message : err);
    return { ok: false, error: t.errStripe };
  }
}

/**
 * Kalles når brukeren kommer tilbake fra Stripe. Henter betalingen direkte fra
 * Stripe, så tilgangen er på plass med en gang – uten å vente på webhooken.
 */
export async function confirmCheckout(sessionId: string): Promise<ActionResult<{ paid: boolean }>> {
  const { t } = await texts();
  if (!isBillingEnabled) return { ok: false, error: t.errNotEnabled };
  await requireUser();
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return { ok: false, error: t.errRef };

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    // Bare medlemmer av organisasjonen betalingen gjelder, får bekrefte den.
    const org = session.client_reference_id ? await getOwnOrganization(session.client_reference_id) : null;
    if (!org) return { ok: false, error: t.errOrg };

    const subscription = session.subscription;
    if (session.status !== "complete" || !subscription || typeof subscription === "string") {
      return { ok: true, data: { paid: false } };
    }
    await syncSubscription(subscription, org.id);
    return { ok: true, data: { paid: true } };
  } catch (err) {
    console.error("[vistiller] confirmCheckout", err instanceof Error ? err.message : err);
    return { ok: false, error: t.errStripe };
  }
}

/** Åpner Stripe sin kundeportal: si opp, bytte kort, se kvitteringer. */
export async function openBillingPortal(organizationId: string): Promise<ActionResult<{ url: string }>> {
  const { lang, t } = await texts();
  if (!isBillingEnabled) return { ok: false, error: t.errNotEnabled };
  await requireUser();
  const org = await getOwnOrganization(organizationId);
  if (!org?.stripe_customer_id) return { ok: false, error: t.errNoSub };

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      locale: lang === "en" ? "en" : "nb",
      return_url: `${await getOrigin()}/dashboard/medlemskap`,
    });
    return { ok: true, data: { url: portal.url } };
  } catch (err) {
    console.error("[vistiller] openBillingPortal", err instanceof Error ? err.message : err);
    return { ok: false, error: t.errStripe };
  }
}
