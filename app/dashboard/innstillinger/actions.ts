"use server";

import { redirect } from "next/navigation";
import { deleteAccount as deleteAccountData } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { isAdminConfigured } from "@/lib/billing";
import { CONTACT_EMAIL, DELETE_CONFIRMATION } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";



/** Sletter kontoen til den innloggede brukeren. Krever at brukeren skriver SLETT. */
export async function deleteMyAccount(confirmation: string): Promise<ActionResult> {
  const user = await requireUser();
  if (confirmation.trim().toUpperCase() !== DELETE_CONFIRMATION) {
    return { ok: false, error: `Skriv ${DELETE_CONFIRMATION} for å bekrefte.` };
  }
  if (!isAdminConfigured) {
    return { ok: false, error: `Kontosletting er ikke tilgjengelig akkurat nå. Send e-post til ${CONTACT_EMAIL}.` };
  }

  try {
    await deleteAccountData(user.id);
  } catch (error) {
    console.error("[vistiller] deleteMyAccount", error instanceof Error ? error.message : error);
    return { ok: false, error: `Kunne ikke slette kontoen. Prøv igjen, eller send e-post til ${CONTACT_EMAIL}.` };
  }

  // Brukeren finnes ikke lenger; fjern bare innloggingen fra denne enheten.
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/slett-konto/slettet");
}
