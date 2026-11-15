import { CalendarDays, Clock, Lock, MapPin } from "lucide-react";
import { formatEventWhen } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";

/** Topp på deltakersidene: hvem, hva, når og hvor. */
export function EventInfo({ event, compact }: { event: PublicEvent; compact?: boolean }) {
  return (
    <header className="space-y-2">
      <p className="text-sm font-medium text-primary">{event.organization_name}</p>
      <h1 className={compact ? "text-xl leading-tight font-bold" : "text-3xl leading-tight font-bold tracking-tight"}>
        {event.title}
      </h1>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden /> {formatEventWhen(event.starts_at, event.ends_at)}
        </li>
        {event.location && (
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {event.location}
          </li>
        )}
        {!compact && event.signup_deadline && event.signup_open && (
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden /> Påmeldingsfrist: {formatEventWhen(event.signup_deadline)}
          </li>
        )}
      </ul>
      {!compact && event.description && <p className="pt-1 whitespace-pre-line text-foreground/90">{event.description}</p>}
    </header>
  );
}

export function SignupClosedNotice({ event }: { event: PublicEvent }) {
  if (event.signup_open) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-sm">
      <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span>
        {event.status === "open" ? "Påmeldingsfristen har gått ut." : "Påmeldingen er stengt."} Ta kontakt med arrangøren
        hvis du lurer på noe.
      </span>
    </div>
  );
}
