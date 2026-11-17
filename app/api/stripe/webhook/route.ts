import type Stripe from "stripe";
import { getStripe, isBillingEnabled, stripeId, stripeWebhookSecret, syncSubscription } from "@/lib/billing";

// Stripe kaller denne når noe skjer med et abonnement: betalt, fornyet, sagt
// opp, mislykket betaling. Signaturen bevises med STRIPE_WEBHOOK_SECRET, så
// ingen andre kan gi en organisasjon tilgang.
export async function POST(request: Request) {
  if (!isBillingEnabled || !stripeWebhookSecret) {
    return new Response("Betaling er ikke satt opp", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Mangler signatur", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    // Signaturen gjelder de rå bytene, så kroppen må ikke tolkes som JSON først.
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, stripeWebhookSecret);
  } catch {
    return new Response("Ugyldig signatur", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const subscriptionId = stripeId(session.subscription);
        if (session.mode === "subscription" && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscription(subscription, session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
    }
  } catch (err) {
    // 500 får Stripe til å prøve igjen senere.
    console.error("[vistiller] stripe webhook", event.type, err instanceof Error ? err.message : err);
    return new Response("Kunne ikke behandle hendelsen", { status: 500 });
  }
  return Response.json({ received: true });
}
