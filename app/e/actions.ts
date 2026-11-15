"use server";

import { z } from "zod";
import { messageFor, NOT_CONFIGURED } from "@/lib/errors";
import { getMySignups, TOKEN_PATTERN } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

// Disse kalles av gjester uten konto. Alt valideres på nytt i databasen
// (kapasitet, frist, status), så ingenting her stoler på klienten.

const token = z.string().regex(TOKEN_PATTERN);

const signupSchema = z.object({
  taskId: z.uuid(),
  name: z.string().trim().min(1, "Skriv inn navnet ditt.").max(80, "Navnet er for langt."),
  email: z.union([z.literal(""), z.email("E-postadressen ser ikke riktig ut.")]),
  token: token.nullable(),
});

export async function signUpForTask(input: {
  taskId: string;
  name: string;
  email: string;
  token: string | null;
  /** Honningfelle: skjult felt som bare roboter fyller ut. */
  website?: string;
}): Promise<ActionResult<{ token: string }>> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  if (input.website) return { ok: false, error: "Noe gikk galt. Prøv igjen." };

  const parsed = signupSchema.safeParse({
    taskId: input.taskId,
    name: input.name,
    email: input.email.trim().toLowerCase(),
    token: input.token && TOKEN_PATTERN.test(input.token) ? input.token : null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message || "Sjekk feltene." };

  const { data, error } = await createPublicClient().rpc("signup_for_task", {
    p_task_id: parsed.data.taskId,
    p_name: parsed.data.name,
    p_email: parsed.data.email || null,
    p_token: parsed.data.token,
  });
  if (error) return { ok: false, error: messageFor(error) };
  return { ok: true, data: { token: (data as { token: string }).token } };
}

export async function cancelSignup(input: { token: string; taskId: string }): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const parsed = z.object({ token, taskId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Fant ikke påmeldingen." };

  const { error } = await createPublicClient().rpc("cancel_my_signup", {
    p_token: parsed.data.token,
    p_task_id: parsed.data.taskId,
  });
  if (error) return { ok: false, error: messageFor(error) };
  return { ok: true, data: undefined };
}

/** Hvilke oppgaver i arrangementet denne enheten allerede står på. */
export async function loadMyTaskIds(input: { token: string; slug: string }): Promise<string[]> {
  if (!token.safeParse(input.token).success) return [];
  try {
    const mine = await getMySignups(input.token);
    return mine && mine.event.slug === input.slug ? mine.task_ids : [];
  } catch {
    return [];
  }
}
