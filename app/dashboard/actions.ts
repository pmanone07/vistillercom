"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing";
import { membershipIsActive } from "@/lib/membership";
import { messageFor, NOT_CONFIGURED } from "@/lib/errors";
import { fromLocalInput, toLocalDate, toLocalTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getEventWithTasks } from "@/lib/data";
import type { ActionResult, EventStatus, TaskWithSignups } from "@/lib/types";

// Hver action verifiserer innlogging selv. Hva brukeren faktisk får gjøre,
// avgjøres av RLS i databasen – ikke av det klienten sender inn.
async function authed() {
  await requireUser();
  return createClient();
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

const NO_MEMBERSHIP = "Organisasjonen har ikke aktivt medlemskap. Gå til «Medlemskap» for å betale.";

/** Betalingsmur på serveren: sjekkes på nytt her, ikke bare i skjermbildene. */
async function orgHasAccess(supabase: Awaited<ReturnType<typeof createClient>>, organizationId: string) {
  if (!isBillingEnabled) return true;
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
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const name = z.string().trim().min(1).max(100).safeParse(input.name);
  if (!name.success) return fail("Skriv inn navnet på organisasjonen.");

  const supabase = await authed();
  const { data, error } = await supabase.rpc("create_organization", { p_name: name.data });
  if (error) return fail(messageFor(error));
  return { ok: true, data: { id: data as string } };
}

export async function renameOrganization(input: { organizationId: string; name: string }): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z.object({ organizationId: id, name: z.string().trim().min(1).max(100) }).safeParse(input);
  if (!parsed.success) return fail("Skriv inn et navn (maks 100 tegn).");
  const supabase = await authed();
  const { error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.organizationId);
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function addOrgAdmin(input: { organizationId: string; email: string }): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z
    .object({ organizationId: id, email: z.email("E-postadressen ser ikke riktig ut.") })
    .safeParse({ organizationId: input.organizationId, email: input.email.trim().toLowerCase() });
  if (!parsed.success) return fail(parsed.error.issues[0].message || "Sjekk e-postadressen.");
  const supabase = await authed();
  const { error } = await supabase.rpc("add_org_admin", {
    p_org_id: parsed.data.organizationId,
    p_email: parsed.data.email,
  });
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function removeOrgMember(input: { organizationId: string; userId: string }): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z.object({ organizationId: id, userId: id }).safeParse(input);
  if (!parsed.success) return fail("Ugyldig forespørsel.");
  const supabase = await authed();
  const { error } = await supabase.rpc("remove_org_member", {
    p_org_id: parsed.data.organizationId,
    p_user_id: parsed.data.userId,
  });
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

// --- Arrangement ------------------------------------------------------------

const eventSchema = z.object({
  id: id.optional(),
  organizationId: id,
  title: z.string().trim().min(1, "Gi arrangementet et navn.").max(120),
  description: optionalText(2000),
  location: optionalText(200),
  startsAt: z.string(),
  endsAt: z.string(),
  signupDeadline: z.string(),
});
export type EventInput = z.input<typeof eventSchema>;

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(fromDate: string, toDate: string) {
  return Math.round((Date.parse(`${toDate}T12:00:00Z`) - Date.parse(`${fromDate}T12:00:00Z`)) / 86_400_000);
}

export async function saveEvent(input: EventInput): Promise<ActionResult<{ id: string }>> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || "Sjekk feltene og prøv igjen.");
  const v = parsed.data;

  const startsAt = fromLocalInput(v.startsAt);
  if (!startsAt) return fail("Velg dato og klokkeslett for arrangementet.");
  const endsAt = v.endsAt ? fromLocalInput(v.endsAt) : null;
  if (v.endsAt && !endsAt) return fail("Sluttidspunktet er ugyldig.");
  if (endsAt && endsAt < startsAt) return fail("Slutt må være etter start.");
  const signupDeadline = v.signupDeadline ? fromLocalInput(v.signupDeadline) : null;
  if (v.signupDeadline && !signupDeadline) return fail("Påmeldingsfristen er ugyldig.");

  const fields = {
    title: v.title,
    description: v.description,
    location: v.location,
    starts_at: startsAt,
    ends_at: endsAt,
    signup_deadline: signupDeadline,
  };
  const supabase = await authed();

  if (!v.id) {
    if (!(await orgHasAccess(supabase, v.organizationId))) return fail(NO_MEMBERSHIP);
    const { data, error } = await supabase
      .from("events")
      .insert({ organization_id: v.organizationId, ...fields })
      .select("id")
      .single();
    if (error) return fail(messageFor(error));
    return { ok: true, data: { id: data.id } };
  }

  const { data: before, error: readError } = await supabase
    .from("events")
    .select("starts_at, organization_id")
    .eq("id", v.id)
    .maybeSingle();
  if (readError || !before) return fail("Fant ikke arrangementet.");
  if (!(await orgHasAccess(supabase, before.organization_id))) return fail(NO_MEMBERSHIP);

  const { error } = await supabase.from("events").update(fields).eq("id", v.id);
  if (error) return fail(messageFor(error));

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
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z.object({ eventId: id, status: z.enum(["open", "closed", "archived"]) }).safeParse({ eventId, status });
  if (!parsed.success) return fail("Ugyldig forespørsel.");
  const supabase = await authed();
  const { error } = await supabase.from("events").update({ status: parsed.data.status }).eq("id", parsed.data.eventId);
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  if (!id.safeParse(eventId).success) return fail("Ugyldig forespørsel.");
  const supabase = await authed();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function copyEvent(input: {
  eventId: string;
  title: string;
  startsAt: string;
}): Promise<ActionResult<{ id: string }>> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z
    .object({ eventId: id, title: z.string().trim().min(1, "Gi kopien et navn.").max(120), startsAt: z.string() })
    .safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || "Sjekk feltene.");
  const startsAt = fromLocalInput(parsed.data.startsAt);
  if (!startsAt) return fail("Velg ny dato og klokkeslett.");

  const supabase = await authed();
  const { data: source } = await supabase
    .from("events")
    .select("organization_id")
    .eq("id", parsed.data.eventId)
    .maybeSingle();
  if (!source) return fail("Fant ikke arrangementet.");
  if (!(await orgHasAccess(supabase, source.organization_id))) return fail(NO_MEMBERSHIP);
  const { data, error } = await supabase.rpc("copy_event", {
    p_event_id: parsed.data.eventId,
    p_title: parsed.data.title,
    p_starts_at: startsAt,
  });
  if (error) return fail(messageFor(error));
  return { ok: true, data: { id: data as string } };
}

// --- Oppgaver ---------------------------------------------------------------

const time = z.string().regex(/^(\d{2}:\d{2})?$/, "Ugyldig klokkeslett.");
const taskSchema = z.object({
  id: id.optional(),
  eventId: id,
  title: z.string().trim().min(1, "Gi oppgaven et navn.").max(100),
  description: optionalText(500),
  capacity: z.number().int().min(1, "Minst én person.").max(500, "Maks 500 personer per oppgave."),
  startTime: time,
  endTime: time,
});
export type TaskInput = z.input<typeof taskSchema>;

export async function saveTask(input: TaskInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message || "Sjekk feltene.");
  const v = parsed.data;
  if (v.startTime && v.endTime && v.endTime <= v.startTime) return fail("Slutt må være etter start.");

  const supabase = await authed();
  const { data: event } = await supabase
    .from("events")
    .select("starts_at, organization_id")
    .eq("id", v.eventId)
    .maybeSingle();
  if (!event) return fail("Fant ikke arrangementet.");
  if (!(await orgHasAccess(supabase, event.organization_id))) return fail(NO_MEMBERSHIP);

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
    if (error) return fail(messageFor(error));
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
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  if (!id.safeParse(taskId).success) return fail("Ugyldig forespørsel.");
  const supabase = await authed();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

/** Ferske oppgaver med påmeldte, for automatisk oppdatering av arrangementsiden. */
export async function loadEventTasks(eventId: string): Promise<ActionResult<TaskWithSignups[]>> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  if (!id.safeParse(eventId).success) return fail("Ugyldig forespørsel.");
  await requireUser();
  // RLS gir null hvis brukeren ikke er medlem av organisasjonen.
  const data = await getEventWithTasks(eventId);
  if (!data) return fail("Fant ikke arrangementet.");
  return { ok: true, data: data.tasks };
}

// --- Påmeldinger (lagt inn eller fjernet av arrangøren) ----------------------

export async function addSignup(input: { taskId: string; name: string; email: string }): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = z
    .object({
      taskId: id,
      name: z.string().trim().min(1, "Skriv inn et navn.").max(80),
      email: z.union([z.literal(""), z.email("E-postadressen ser ikke riktig ut.")]),
    })
    .safeParse({ ...input, email: input.email.trim().toLowerCase() });
  if (!parsed.success) return fail(parsed.error.issues[0].message || "Sjekk feltene.");

  const supabase = await authed();
  const { error } = await supabase.from("signups").insert({
    task_id: parsed.data.taskId,
    participant_name: parsed.data.name,
    participant_email: parsed.data.email || null,
  });
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}

export async function removeSignup(signupId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  if (!id.safeParse(signupId).success) return fail("Ugyldig forespørsel.");
  const supabase = await authed();
  const { error } = await supabase.from("signups").delete().eq("id", signupId);
  if (error) return fail(messageFor(error));
  return { ok: true, data: undefined };
}
