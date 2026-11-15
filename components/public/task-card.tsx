"use client";

import { Check, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffingBar } from "@/components/staffing";
import { formatTimeRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PublicTask } from "@/lib/types";

interface Props {
  task: PublicTask;
  /** Denne enheten står allerede på oppgaven. */
  mine: boolean;
  /** Påmeldingen er åpen (status og frist). */
  signupOpen: boolean;
  busy?: boolean;
  onSignUp: () => void;
  onCancel: () => void;
}

/** Oppgavekort for deltakere: hva, når, hvor mange, hvem – og én stor knapp. */
export function TaskCard({ task, mine, signupOpen, busy, onSignUp, onCancel }: Props) {
  const full = task.taken >= task.capacity;
  const time = formatTimeRange(task.starts_at, task.ends_at);

  return (
    <article
      className={cn(
        "rounded-2xl bg-card p-4 ring-1 transition-shadow",
        mine ? "shadow-md ring-2 shadow-primary/10 ring-primary" : "ring-foreground/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold">{task.title}</h3>
          {time && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
              <Clock className="size-4" aria-hidden /> {time}
            </p>
          )}
          {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
        </div>
        {mine && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            <Check className="size-3.5" aria-hidden /> Du stiller
          </span>
        )}
      </div>

      <StaffingBar className="mt-3" taken={task.taken} capacity={task.capacity} />

      {task.names.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="sr-only">Påmeldt: </span>
          {task.names.join(", ")}
        </p>
      )}

      <div className="mt-3">
        {mine ? (
          <Button variant="outline" onClick={onCancel} disabled={busy} className="h-11 w-full">
            {busy && <Loader2 className="animate-spin" />} Meld meg av
          </Button>
        ) : !signupOpen ? null : full ? (
          <p className="text-sm font-medium text-emerald-700">Denne er dekket – takk!</p>
        ) : (
          <Button onClick={onSignUp} disabled={busy} className="h-12 w-full text-base">
            {busy && <Loader2 className="animate-spin" />} Meld meg på
          </Button>
        )}
      </div>
    </article>
  );
}
