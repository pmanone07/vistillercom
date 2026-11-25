"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNext } from "@/lib/auth";
import { AUTH_TEXT, isAuthLang, type AuthLang } from "@/lib/auth-i18n";
import { PATHS } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { isSupabaseConfigured, siteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

// Skjemaet sender med språket («nb» eller «en»), så feilmeldingene kommer på riktig språk.
function langOf(formData: FormData): AuthLang {
  const lang = formData.get("lang");
  return isAuthLang(lang) ? lang : "nb";
}

function credentials(lang: AuthLang) {
  const { errors } = AUTH_TEXT[lang];
  return z.object({
    email: z.string().trim().toLowerCase().pipe(z.email(errors.invalidEmail)),
    password: z.string().min(8, errors.shortPassword).max(200),
  });
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { errors } = AUTH_TEXT[langOf(formData)];
  if (!isSupabaseConfigured) return { error: errors.notConfigured };
  const parsed = credentials(langOf(formData)).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return { error: errors.notConfirmed };
    return { error: errors.wrongCredentials };
  }
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const lang = langOf(formData);
  const { errors, checkEmail } = AUTH_TEXT[lang];
  if (!isSupabaseConfigured) return { error: errors.notConfigured };
  const parsed = credentials(lang).safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) {
    if (error.code === "weak_password") return { error: errors.weakPassword };
    if (error.code === "over_email_send_rate_limit") return { error: errors.rateLimit };
    console.error("[vistiller] signUp", error.message);
    return { error: errors.signUpFailed };
  }
  if (data.session) redirect("/dashboard");
  // Samme svar enten adressen er ny eller finnes fra før, så ingen kan sjekke hvem som har konto.
  return { message: checkEmail };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(PATHS[await getLang()].home);
}
