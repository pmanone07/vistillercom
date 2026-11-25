"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isPaywallEnabled } from "@/lib/billing";
import { membershipIsActive } from "@/lib/membership";
import { messageFor } from "@/lib/errors";
import { fromLocalInput, toLocalDate, toLocalTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getEventWithTasks } from "@/lib/data";
import { getMessages, type Messages } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import type { ActionResult, EventStatus, TaskWithSignups } from "@/lib/types";

// Hver action verifiserer innlogging selv. Hva brukeren faktisk får gjøre,
// avgjøres av RLS i databasen – ikke av det klienten sender inn.
async function authed() {
  await requireUser();
  return createClient();
}

/** Språket til den innloggede brukeren, og feilmeldingene på det språket. */
async function i18n() {
  const lang = await getLang();
  return { lang, t: getMessages(lang).errors };
}

type ErrorText = Messages["errors"];

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/** Betalingsmur på serveren: sjekkes på nytt her, ikke bare i skjermbildene. */
async function orgHasAccess(supabase: Awaited<ReturnType<typeof createClient>>, organizationId: string) {
  if (!isPaywallEnabled) return true;
  const { data } = await supabase
    .from("organizations")
    .select("subscription_status, access_until")
    .eq("id", organizationId)
    .maybeSingle();
  return data ? membershipIsActive(data, Date.now()) : false;
}

const id = z.uuid();
const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

// --- Organisasjon -----------------------------------------------------------

export async function createOrganization(input: { name: string }): Promise<ActionResult<{ id: string }>> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const name = z.string().trim().min(1).max(100).safeParse(input.name);
  if (!name.success) return fail(t.orgName);

  const supabase = await authed();
  const { data, error } = await supabase.rpc("create_organization", { p_name: name.data });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: { id: data as string } };
}

export async function renameOrganization(input: { organizationId: string; name: string }): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z.object({ organizationId: id, name: z.string().trim().min(1).max(100) }).safeParse(input);
  if (!parsed.success) return fail(t.orgNameLength);
  const supabase = await authed();
  const { error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.organizationId);
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function addOrgAdmin(input: { organizationId: string; email: string }): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z
    .object({ organizationId: id, email: z.email(t.invalidEmail) })
    .safeParse({ organizationId: input.organizationId, email: input.email.trim().toLowerCase() });
  if (!parsed.success) return fail(parsed.error.issues[0].message || t.invalidEmail);
  const supabase = await authed();
  const { error } = await supabase.rpc("add_org_admin", {
    p_org_id: parsed.data.organizationId,
    p_email: parsed.data.email,
  });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function removeOrgMember(input: { organizationId: string; userId: string }): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z.object({ organizationId: id, userId: id }).safeParse(input);
  if (!parsed.success) return fail(t.invalidRequest);
  const supabase = await authed();
  const { error } = await supabase.rpc("remove_org_member", {
    p_org_id: parsed.data.organizationId,
    p_user_id: parsed.data.userId,
  });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

// --- Arrangement ------------------------------------------------------------

const eventSchema = (t: ErrorText) =>
  z.object({
    id: id.optional(),
    organizationId: id,
    title: z.string().trim().min(1, t.eventTitle).max(120),
    description: optionalText(2000),
    location: optionalText(200),
    startsAt: z.string(),
    endsAt: z.string(),
    signupDeadline: z.string(),
    /** Språket på deltakersiden. */
    language: z.enum(["nb", "en"]).optional(),
  });
export type EventInput = z.input<ReturnType<typeof eventSchema>>;

/**
 * Er migreringen med events.language ikke kjørt ennå, mangler kolonnen. Da
 * lagres arrangementet uten språk (og vises på norsk), i stedet for å feile.
 */
function missingLanguageColumn(error: { message?: string; code?: string } | null) {
  return Boolean(error && (error.code === "PGRST204" || error.code === "42703") && error.message?.includes("language"));
}

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(fromDate: string, toDate: string) {
  return Math.round((Date.parse(`${toDate}T12:00:00Z`) - Date.parse(`${fromDate}T12:00:00Z`)) / 86_400_000);
}

export async function saveEvent(input: EventInput): Promise<ActionResult<{ id: string }>> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = eventSchema(t).safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || t.checkFields);
  const v = parsed.data;

  const startsAt = fromLocalInput(v.startsAt);
  if (!startsAt) return fail(t.eventStart);
  const endsAt = v.endsAt ? fromLocalInput(v.endsAt) : null;
  if (v.endsAt && !endsAt) return fail(t.eventEndInvalid);
  if (endsAt && endsAt < startsAt) return fail(t.endBeforeStart);
  const signupDeadline = v.signupDeadline ? fromLocalInput(v.signupDeadline) : null;
  if (v.signupDeadline && !signupDeadline) return fail(t.deadlineInvalid);

  const fields = {
    title: v.title,
    description: v.description,
    location: v.location,
    starts_at: startsAt,
    ends_at: endsAt,
    signup_deadline: signupDeadline,
  };
  // Nye arrangementer får arrangørens språk hvis skjemaet ikke sier noe annet.
  const language = v.language ?? (v.id ? undefined : lang);
  const supabase = await authed();

  if (!v.id) {
    if (!(await orgHasAccess(supabase, v.organizationId))) return fail(t.noMembership);
    const insert = (withLanguage: boolean) =>
      supabase
        .from("events")
        .insert({ organization_id: v.organizationId, ...fields, ...(withLanguage ? { language } : {}) })
        .select("id")
        .single();
    let { data, error } = await insert(true);
    if (missingLanguageColumn(error)) ({ data, error } = await insert(false));
    if (error || !data) return fail(messageFor(error, lang));
    return { ok: true, data: { id: data.id } };
  }

  const { data: before, error: readError } = await supabase
    .from("events")
    .select("starts_at, organization_id")
    .eq("id", v.id)
    .maybeSingle();
  if (readError || !before) return fail(t.eventNotFound);
  if (!(await orgHasAccess(supabase, before.organization_id))) return fail(t.noMembership);

  let { error } = await supabase
    .from("events")
    .update({ ...fields, ...(language ? { language } : {}) })
    .eq("id", v.id);
  if (missingLanguageColumn(error)) ({ error } = await supabase.from("events").update(fields).eq("id", v.id));
  if (error) return fail(messageFor(error, lang));

  // Flyttes arrangementet til en annen dag, følger oppgavenes klokkeslett med.
  const days = dayDiff(toLocalDate(before.starts_at), toLocalDate(startsAt));
  if (days !== 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, starts_at, ends_at")
      .eq("event_id", v.id);
    for (const task of tasks ?? []) {
      if (!task.starts_at && !task.ends_at) continue;
      const move = (iso: string | null) =>
        iso ? fromLocalInput(`${shiftDate(toLocalDate(iso), days)}T${toLocalTime(iso)}`) : null;
      await supabase
        .from("tasks")
        .update({ starts_at: move(task.starts_at), ends_at: move(task.ends_at) })
        .eq("id", task.id);
    }
  }
  return { ok: true, data: { id: v.id } };
}

export async function setEventStatus(eventId: string, status: EventStatus): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z.object({ eventId: id, status: z.enum(["open", "closed", "archived"]) }).safeParse({ eventId, status });
  if (!parsed.success) return fail(t.invalidRequest);
  const supabase = await authed();
  const { error } = await supabase.from("events").update({ status: parsed.data.status }).eq("id", parsed.data.eventId);
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  if (!id.safeParse(eventId).success) return fail(t.invalidRequest);
  const supabase = await authed();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function copyEvent(input: {
  eventId: string;
  title: string;
  startsAt: string;
}): Promise<ActionResult<{ id: string }>> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z
    .object({ eventId: id, title: z.string().trim().min(1, t.copyTitle).max(120), startsAt: z.string() })
    .safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || t.checkFields);
  const startsAt = fromLocalInput(parsed.data.startsAt);
  if (!startsAt) return fail(t.copyStart);

  const supabase = await authed();
  const { data: source } = await supabase
    .from("events")
    .select("organization_id")
    .eq("id", parsed.data.eventId)
    .maybeSingle();
  if (!source) return fail(t.eventNotFound);
  if (!(await orgHasAccess(supabase, source.organization_id))) return fail(t.noMembership);
  const { data, error } = await supabase.rpc("copy_event", {
    p_event_id: parsed.data.eventId,
    p_title: parsed.data.title,
    p_starts_at: startsAt,
  });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: { id: data as string } };
}

// --- Oppgaver ---------------------------------------------------------------

const taskSchema = (t: ErrorText) => {
  const time = z.string().regex(/^(\d{2}:\d{2})?$/, t.invalidTime);
  return z.object({
    id: id.optional(),
    eventId: id,
    title: z.string().trim().min(1, t.taskTitle).max(100),
    description: optionalText(500),
    capacity: z.number().int().min(1, t.capacityMin).max(500, t.capacityMax),
    startTime: time,
    endTime: time,
  });
};
export type TaskInput = z.input<ReturnType<typeof taskSchema>>;

export async function saveTask(input: TaskInput): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = taskSchema(t).safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || t.checkFields);
  const v = parsed.data;
  if (v.startTime && v.endTime && v.endTime <= v.startTime) return fail(t.endBeforeStart);

  const supabase = await authed();
  const { data: event } = await supabase
    .from("events")
    .select("starts_at, organization_id")
    .eq("id", v.eventId)
    .maybeSingle();
  if (!event) return fail(t.eventNotFound);
  if (!(await orgHasAccess(supabase, event.organization_id))) return fail(t.noMembership);

  // Klokkeslettene gjelder arrangementsdagen (norsk tid).
  const date = toLocalDate(event.starts_at);
  const fields = {
    title: v.title,
    description: v.description,
    capacity: v.capacity,
    starts_at: v.startTime ? fromLocalInput(`${date}T${v.startTime}`) : null,
    ends_at: v.endTime ? fromLocalInput(`${date}T${v.endTime}`) : null,
  };

  if (v.id) {
    const { error } = await supabase.from("tasks").update(fields).eq("id", v.id).eq("event_id", v.eventId);
    if (error) return fail(messageFor(error, lang));
    return { ok: true, data: undefined };
  }

  const { data: last } = await supabase
    .from("tasks")
    .select("sort_order")
    .eq("event_id", v.eventId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("tasks")
    .insert({ event_id: v.eventId, sort_order: (last?.sort_order ?? -1) + 1, ...fields });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  if (!id.safeParse(taskId).success) return fail(t.invalidRequest);
  const supabase = await authed();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

/** Ferske oppgaver med påmeldte, for automatisk oppdatering av arrangementsiden. */
export async function loadEventTasks(eventId: string): Promise<ActionResult<TaskWithSignups[]>> {
  const { t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  if (!id.safeParse(eventId).success) return fail(t.invalidRequest);
  await requireUser();
  // RLS gir null hvis brukeren ikke er medlem av organisasjonen.
  const data = await getEventWithTasks(eventId);
  if (!data) return fail(t.eventNotFound);
  return { ok: true, data: data.tasks };
}

// --- Påmeldinger (lagt inn eller fjernet av arrangøren) ----------------------

export async function addSignup(input: { taskId: string; name: string; email: string }): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  const parsed = z
    .object({
      taskId: id,
      name: z.string().trim().min(1, t.enterName).max(80),
      email: z.union([z.literal(""), z.email(t.invalidEmail)]),
    })
    .safeParse({ ...input, email: input.email.trim().toLowerCase() });
  if (!parsed.success) return fail(parsed.error.issues[0].message || t.checkFields);

  const supabase = await authed();
  const { error } = await supabase.from("signups").insert({
    task_id: parsed.data.taskId,
    participant_name: parsed.data.name,
    participant_email: parsed.data.email || null,
  });
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}

export async function removeSignup(signupId: string): Promise<ActionResult> {
  const { lang, t } = await i18n();
  if (!isSupabaseConfigured) return fail(t.notConfigured);
  if (!id.safeParse(signupId).success) return fail(t.invalidRequest);
  const supabase = await authed();
  const { error } = await supabase.from("signups").delete().eq("id", signupId);
  if (error) return fail(messageFor(error, lang));
  return { ok: true, data: undefined };
}
