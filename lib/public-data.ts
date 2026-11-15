import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { isSupabaseConfigured, siteUrl } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import type { MySignups, PublicEvent } from "@/lib/types";

export const SLUG_PATTERN = /^[a-z0-9-]{3,80}$/;
export const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

/** Offentlig visning av et arrangement. Null hvis det ikke finnes eller er arkivert. */
export const getPublicEvent = cache(async (slug: string): Promise<PublicEvent | null> => {
  if (!isSupabaseConfigured || !SLUG_PATTERN.test(slug)) return null;
  const { data, error } = await createPublicClient().rpc("get_public_event", { p_slug: slug });
  if (error) throw new Error(error.message);
  return (data as PublicEvent | null) ?? null;
});

/** Det en gjest har meldt seg på, via det private tokenet. */
export async function getMySignups(token: string): Promise<MySignups | null> {
  if (!isSupabaseConfigured || !TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await createPublicClient().rpc("get_my_signups", { p_token: token });
  if (error) throw new Error(error.message);
  return (data as MySignups | null) ?? null;
}

/** Adressen siden faktisk ble åpnet på (riktig også lokalt og i forhåndsvisninger). */
export async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
