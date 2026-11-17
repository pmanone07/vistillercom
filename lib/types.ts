export type EventStatus = "open" | "closed" | "archived";

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  /** Kan organisasjonen bruke ViStiller nå? Alltid true når betalingsmuren er av. */
  hasAccess: boolean;
  // Medlemskapsfeltene finnes bare når betalingsmuren er på.
  subscription_status?: string | null;
  access_until?: string | null;
  cancel_at_period_end?: boolean;
  /** Finnes det en Stripe-kunde (kan åpne «Administrer abonnement»)? */
  hasBillingAccount?: boolean;
}

export interface EventRow {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  signup_deadline: string | null;
  public_slug: string;
  status: EventStatus;
}

export interface TaskRow {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  capacity: number;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
}

export interface SignupRow {
  id: string;
  task_id: string;
  participant_name: string;
  participant_email: string | null;
  created_at: string;
}

export interface TaskWithSignups extends TaskRow {
  signups: SignupRow[];
}

// --- Offentlige former (fra databasefunksjonene). Aldri e-post eller tokens. ---

export interface PublicTask {
  id: string;
  title: string;
  description: string | null;
  capacity: number;
  starts_at: string | null;
  ends_at: string | null;
  taken: number;
  names: string[];
}

export interface PublicEvent {
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  signup_deadline: string | null;
  status: EventStatus;
  signup_open: boolean;
  organization_name: string;
  tasks: PublicTask[];
}

export interface MySignups {
  participant_name: string;
  participant_email: string | null;
  event: PublicEvent;
  task_ids: string[];
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
