"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNext } from "@/lib/auth";
import { NOT_CONFIGURED } from "@/lib/errors";
import { isSupabaseConfigured, siteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Skriv inn en gyldig e-postadresse.")),
  password: z.string().min(8, "Passordet må ha minst 8 tegn.").max(200),
});

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Du må bekrefte e-postadressen først. Sjekk innboksen din." };
    }
    return { error: "Feil e-post eller passord." };
  }
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) {
    if (error.code === "weak_password") return { error: "Passordet er for svakt. Velg et lengre passord." };
    if (error.code === "over_email_send_rate_limit") return { error: "For mange forsøk. Vent litt og prøv igjen." };
    console.error("[vistiller] signUp", error.message);
    return { error: "Kunne ikke opprette konto. Prøv igjen." };
  }
  if (data.session) redirect("/dashboard");
  // Samme svar enten adressen er ny eller finnes fra før, så ingen kan sjekke hvem som har konto.
  return { message: "Sjekk e-posten din og trykk på lenken for å fullføre registreringen." };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
