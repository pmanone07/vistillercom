"use server";

import { redirect } from "next/navigation";
import { deleteAccount as deleteAccountData } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { isAdminConfigured } from "@/lib/billing";
import { getMessages, PATHS } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { CONTACT_EMAIL } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

/** Sletter kontoen til den innloggede brukeren. Krever at brukeren skriver SLETT (eller DELETE). */
export async function deleteMyAccount(confirmation: string): Promise<ActionResult> {
  const user = await requireUser();
  const lang = await getLang();
  const t = getMessages(lang).account;
  // Begge ordene godtas, så et språkbytte midt i ikke gjør at bekreftelsen feiler.
  const word = confirmation.trim().toUpperCase();
  if (word !== getMessages("nb").account.confirmWord && word !== getMessages("en").account.confirmWord) {
    return { ok: false, error: t.errorConfirm(t.confirmWord) };
  }
  if (!isAdminConfigured) {
    return { ok: false, error: t.errorUnavailable(CONTACT_EMAIL) };
  }

  try {
    await deleteAccountData(user.id);
  } catch (error) {
    console.error("[vistiller] deleteMyAccount", error instanceof Error ? error.message : error);
    return { ok: false, error: t.errorFailed(CONTACT_EMAIL) };
  }

  // Brukeren finnes ikke lenger; fjern bare innloggingen fra denne enheten.
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect(PATHS[lang].accountDeleted);
}
