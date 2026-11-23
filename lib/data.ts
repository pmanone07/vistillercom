import "server-only";
import { redirect } from "next/navigation";
import { isBillingEnabled, isPaywallEnabled } from "@/lib/billing";
import { membershipIsActive, type MembershipFields } from "@/lib/membership";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, Organization, SignupRow, TaskRow, TaskWithSignups } from "@/lib/types";

// Alle spørringer her kjører som innlogget bruker. RLS avgjør hva som kommer tilbake.

const EVENT_COLUMNS = "id, organization_id, title, description, location, starts_at, ends_at, signup_deadline, public_slug, status";
const TASK_COLUMNS = "id, event_id, title, description, capacity, starts_at, ends_at, sort_order, created_at";
const SIGNUP_COLUMNS = "id, task_id, participant_name, participant_email, created_at, cancelled_at";

export interface EventSummary extends EventRow {
  capacity: number;
  taken: number;
  /** Plasser som fortsatt mangler folk. */
  missing: number;
  taskCount: number;
  /** Arrangementet er ferdig (sluttet for mer enn seks timer siden). */
  over: boolean;
}

export async function getOrganizations(): Promise<Organization[]> {
  const supabase = await createClient();
  // Medlemskapskolonnene leses bare når betalingsmuren er på, så appen virker
  // også før medlemskapsmigreringen er kjørt.
  const columns = isBillingEnabled
    ? "id, name, description, subscription_status, access_until, cancel_at_period_end, stripe_customer_id"
    : "id, name, description";
  const { data, error } = await supabase.from("organizations").select(columns).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const now = Date.now();
  type Row = Pick<Organization, "id" | "name" | "description"> & MembershipFields & { stripe_customer_id?: string | null };
  return ((data ?? []) as unknown as Row[]).map(({ stripe_customer_id, ...org }) => ({
    ...org,
    hasAccess: !isPaywallEnabled || membershipIsActive(org, now),
    hasMembership: !isBillingEnabled || membershipIsActive(org, now),
    hasBillingAccount: Boolean(stripe_customer_id),
  }));
}

/** Sender videre til medlemskapssiden hvis organisasjonen ikke har betalt tilgang. */
export async function requireOrgAccess(organizationId: string) {
  if (!isPaywallEnabled) return;
  const organizations = await getOrganizations();
  const org = organizations.find((o) => o.id === organizationId);
  if (!org?.hasAccess) redirect("/dashboard/medlemskap");
}

export interface OrgMember {
  user_id: string;
  email: string;
  role: "owner" | "admin";
}

export async function getOrgMembers(organizationId: string): Promise<OrgMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_org_members", { p_org_id: organizationId });
  if (error) throw new Error(error.message);
  return (data ?? []) as OrgMember[];
}

export async function getEventSummaries(): Promise<EventSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, tasks(id, capacity, signups(id, cancelled_at))`)
    .neq("status", "archived")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);

  type Row = EventRow & { tasks: { id: string; capacity: number; signups: { id: string; cancelled_at: string | null }[] }[] };
  const cutoff = Date.now() - 6 * 3_600_000;
  return ((data ?? []) as unknown as Row[]).map(({ tasks, ...event }) => {
    let capacity = 0;
    let taken = 0;
    let missing = 0;
    for (const task of tasks) {
      const active = task.signups.filter((s) => !s.cancelled_at).length;
      capacity += task.capacity;
      taken += active;
      missing += Math.max(task.capacity - active, 0);
    }
    const over = new Date(event.ends_at ?? event.starts_at).getTime() < cutoff;
    return { ...event, capacity, taken, missing, taskCount: tasks.length, over };
  });
}

export async function getEventWithTasks(
  id: string,
): Promise<{ event: EventRow; organizationName: string; tasks: TaskWithSignups[] } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, organizations(name), tasks(${TASK_COLUMNS}, signups(${SIGNUP_COLUMNS}))`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  type TaskJoined = TaskRow & { created_at: string; signups: (SignupRow & { cancelled_at: string | null })[] };
  const { tasks, organizations, ...event } = data as unknown as EventRow & {
    organizations: { name: string } | null;
    tasks: TaskJoined[];
  };

  const sorted = [...tasks]
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
    .map((task) => ({
      ...task,
      signups: task.signups
        .filter((s) => !s.cancelled_at)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));

  return { event, organizationName: organizations?.name ?? "", tasks: sorted };
}
