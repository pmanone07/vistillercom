import "server-only";
import { redirect } from "next/navigation";
import { PATHS } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Innlogget bruker, eller null. Verifiseres mot Supabase (ikke bare cookie). */
export async function getUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Brukes i alle arrangørsider og server actions. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect(PATHS[await getLang()].login);
  return user;
}

/** Tillater bare interne stier som mål etter innlogging. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
