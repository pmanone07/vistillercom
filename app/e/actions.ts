"use server";

import { z } from "zod";
import { messageFor } from "@/lib/errors";
import { getMessages, isLang, type Lang } from "@/lib/i18n";
import { getMySignups, TOKEN_PATTERN } from "@/lib/public-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

// Disse kalles av gjester uten konto. Alt valideres på nytt i databasen
// (kapasitet, frist, status), så ingenting her stoler på klienten.
// Siden sender med språket den vises på, så feilmeldingene kommer på samme språk.

const token = z.string().regex(TOKEN_PATTERN);

function langOf(value: unknown): Lang {
  return isLang(value) ? value : "nb";
}

export async function signUpForTask(input: {
  taskId: string;
  name: string;
  email: string;
  token: string | null;
  /** Honningfelle: skjult felt som bare roboter fyller ut. */
  website?: string;
  lang?: Lang;
}): Promise<ActionResult<{ token: string }>> {
  const lang = langOf(input.lang);
  const t = getMessages(lang);
  if (!isSupabaseConfigured) return { ok: false, error: t.errors.notConfigured };
  if (input.website) return { ok: false, error: t.public.spam };

  const parsed = z
    .object({
      taskId: z.uuid(),
      name: z.string().trim().min(1, t.errors.yourName).max(80, t.errors.nameTooLong),
      email: z.union([z.literal(""), z.email(t.errors.invalidEmail)]),
      token: token.nullable(),
    })
    .safeParse({
      taskId: input.taskId,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      token: input.token && TOKEN_PATTERN.test(input.token) ? input.token : null,
    });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message || t.errors.checkFields };

  const { data, error } = await createPublicClient().rpc("signup_for_task", {
    p_task_id: parsed.data.taskId,
    p_name: parsed.data.name,
    p_email: parsed.data.email || null,
    p_token: parsed.data.token,
  });
  if (error) return { ok: false, error: messageFor(error, lang) };
  return { ok: true, data: { token: (data as { token: string }).token } };
}

export async function cancelSignup(input: { token: string; taskId: string; lang?: Lang }): Promise<ActionResult> {
  const lang = langOf(input.lang);
  const t = getMessages(lang).errors;
  if (!isSupabaseConfigured) return { ok: false, error: t.notConfigured };
  const parsed = z.object({ token, taskId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: t.signupNotFound };

  const { error } = await createPublicClient().rpc("cancel_my_signup", {
    p_token: parsed.data.token,
    p_task_id: parsed.data.taskId,
  });
  if (error) return { ok: false, error: messageFor(error, lang) };
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
