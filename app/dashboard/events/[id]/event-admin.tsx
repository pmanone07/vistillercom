"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  LockOpen,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StaffingBar } from "@/components/staffing";
import { formatEventWhen, formatTimeRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventRow, SignupRow, TaskWithSignups } from "@/lib/types";
import { addSignup, deleteEvent, deleteTask, removeSignup, setEventStatus } from "../../actions";
import { CopyDialog } from "./copy-dialog";
import { ShareDialog } from "./share-dialog";
import { TaskDialog, type TaskDraft } from "./task-dialog";

const SUGGESTIONS = ["Bake kake", "Rigging", "Kafévakt", "Kioskvakt", "Rydding", "Kjøring", "Ta med kaffe"];

interface Props {
  event: EventRow;
  organizationName: string;
  tasks: TaskWithSignups[];
  siteUrl: string;
}

type Confirm =
  | { kind: "delete-event" }
  | { kind: "delete-task"; task: TaskWithSignups }
  | { kind: "remove-signup"; signup: SignupRow; taskTitle: string };

export function EventAdmin({ event, organizationName, tasks, siteUrl }: Props) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [statusPending, startStatus] = useTransition();

  const isOpen = event.status === "open";
  const capacity = tasks.reduce((sum, t) => sum + t.capacity, 0);
  const taken = tasks.reduce((sum, t) => sum + t.signups.length, 0);
  const understaffed = tasks.filter((t) => t.signups.length < t.capacity);
  const usedTitles = new Set(tasks.map((t) => t.title.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !usedTitles.has(s.toLowerCase()));

  function toggleStatus() {
    startStatus(async () => {
      const result = await setEventStatus(event.id, isOpen ? "closed" : "open");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isOpen ? "Påmeldingen er stengt" : "Påmeldingen er åpnet");
      router.refresh();
    });
  }

  async function runConfirm() {
    if (!confirm) return;
    if (confirm.kind === "delete-event") {
      const result = await deleteEvent(event.id);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      toast.success("Arrangementet er slettet");
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const result =
      confirm.kind === "delete-task" ? await deleteTask(confirm.task.id) : await removeSignup(confirm.signup.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success(confirm.kind === "delete-task" ? "Oppgaven er slettet" : "Personen er fjernet");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Alle arrangementer
        </Link>
        <p className="text-sm font-medium text-muted-foreground">{organizationName}</p>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden /> {formatEventWhen(event.starts_at, event.ends_at)}
        </p>
        {event.location && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden /> {event.location}
          </p>
        )}
        {event.signup_deadline && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" aria-hidden /> Påmeldingsfrist: {formatEventWhen(event.signup_deadline)}
          </p>
        )}
      </div>

      {/* Viktigste handling først: del lenken. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button onClick={() => setShareOpen(true)} className="col-span-2 h-12 text-base sm:col-span-1">
          <Share2 /> Del
        </Button>
        <a
          href={`/e/${event.public_slug}`}
          target="_blank"
          rel="noopener"
          className={cn(buttonVariants({ variant: "outline" }), "h-12")}
        >
          <ExternalLink /> Forhåndsvis
        </a>
        <Link href={`/dashboard/events/${event.id}/rediger`} className={cn(buttonVariants({ variant: "outline" }), "h-12")}>
          <Pencil /> Rediger
        </Link>
        <Button variant="outline" onClick={() => setCopyOpen(true)} className="h-12 max-sm:col-span-2">
          <Copy /> Kopier
        </Button>
      </div>

      {!isOpen && (
        <div className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-sm">
          <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <span>Påmeldingen er stengt. Deltakere kan se listen, men ikke melde seg på.</span>
        </div>
      )}

      {tasks.length > 0 && (
        <section className="rounded-2xl bg-background p-4 ring-1 ring-foreground/10">
          <h2 className="mb-2 font-semibold">Bemanning</h2>
          <StaffingBar taken={Math.min(taken, capacity)} capacity={capacity} />
          {understaffed.length > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Mangler fortsatt folk til:{" "}
              <span className="font-medium text-foreground">{understaffed.map((t) => t.title).join(", ")}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm font-medium text-emerald-700">Alle oppgavene er dekket. Takk til alle som stiller!</p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Oppgaver</h2>
          <Button onClick={() => setTaskDraft({})} className="h-10">
            <Plus /> Ny oppgave
          </Button>
        </div>

        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-background p-6 text-center">
            <p className="font-semibold">Hva trenger dere hjelp til?</p>
            <p className="mt-1 text-sm text-muted-foreground">Legg inn oppgavene, så kan folk melde seg på når du deler lenken.</p>
          </div>
        )}

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onEdit={() => setTaskDraft({ task })}
                onDelete={() => setConfirm({ kind: "delete-task", task })}
                onRemoveSignup={(signup) => setConfirm({ kind: "remove-signup", signup, taskTitle: task.title })}
              />
            </li>
          ))}
        </ul>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Forslag:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTaskDraft({ title: s })}
                className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-sm font-medium ring-1 ring-foreground/15 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Plus className="size-3.5" aria-hidden /> {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-2 border-t pt-5">
        <Button variant="outline" onClick={toggleStatus} disabled={statusPending} className="h-11">
          {statusPending ? <Loader2 className="animate-spin" /> : isOpen ? <Lock /> : <LockOpen />}
          {isOpen ? "Steng påmeldingen" : "Åpne påmeldingen"}
        </Button>
        <Button variant="destructive" onClick={() => setConfirm({ kind: "delete-event" })} className="h-11">
          <Trash2 /> Slett arrangementet
        </Button>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} title={event.title} slug={event.public_slug} siteUrl={siteUrl} />
      <CopyDialog open={copyOpen} onOpenChange={setCopyOpen} eventId={event.id} title={event.title} />
      <TaskDialog eventId={event.id} draft={taskDraft} onClose={() => setTaskDraft(null)} />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive
        onConfirm={runConfirm}
        {...confirmText(confirm, event.title)}
      />
    </div>
  );
}

function confirmText(confirm: Confirm | null, eventTitle: string) {
  switch (confirm?.kind) {
    case "delete-event":
      return {
        title: "Slette arrangementet?",
        description: `«${eventTitle}» slettes med alle oppgaver og påmeldinger. Dette kan ikke angres.`,
        confirmLabel: "Ja, slett",
      };
    case "delete-task":
      return {
        title: "Slette oppgaven?",
        description:
          confirm.task.signups.length > 0
            ? `«${confirm.task.title}» har ${confirm.task.signups.length} påmeldte. De fjernes også. Dette kan ikke angres.`
            : `«${confirm.task.title}» fjernes fra arrangementet.`,
        confirmLabel: "Ja, slett",
      };
    case "remove-signup":
      return {
        title: "Fjerne personen?",
        description: `${confirm.signup.participant_name} fjernes fra «${confirm.taskTitle}», og plassen blir ledig igjen.`,
        confirmLabel: "Ja, fjern",
      };
    default:
      return { title: "", description: "", confirmLabel: "OK" };
  }
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onRemoveSignup,
}: {
  task: TaskWithSignups;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveSignup: (signup: SignupRow) => void;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const time = formatTimeRange(task.starts_at, task.ends_at);

  function add(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addSignup({ taskId: task.id, name, email: "" });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setName("");
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl bg-background p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold">{task.title}</h3>
          {time && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
              <Clock className="size-4" aria-hidden /> {time}
            </p>
          )}
          {task.description && <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>}
        </div>
        <div className="flex shrink-0">
          <Button variant="ghost" size="icon-lg" onClick={onEdit} aria-label={`Endre ${task.title}`}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-lg" onClick={onDelete} aria-label={`Slett ${task.title}`}>
            <Trash2 />
          </Button>
        </div>
      </div>

      <StaffingBar className="mt-3" taken={task.signups.length} capacity={task.capacity} />

      {task.signups.length > 0 && (
        <ul className="mt-3 divide-y">
          {task.signups.map((signup) => (
            <li key={signup.id} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{signup.participant_name}</span>
                {signup.participant_email && (
                  <a href={`mailto:${signup.participant_email}`} className="block truncate text-xs text-muted-foreground hover:underline">
                    {signup.participant_email}
                  </a>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveSignup(signup)}
                aria-label={`Fjern ${signup.participant_name}`}
                className="shrink-0 text-muted-foreground"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={add} className="mt-3 flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            autoFocus
            placeholder="Navn"
            aria-label={`Navn på person til ${task.title}`}
            className="h-11 text-base"
          />
          <Button type="submit" disabled={pending || !name.trim()} className="h-11 shrink-0">
            {pending && <Loader2 className="animate-spin" />} Legg til
          </Button>
          <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="h-11 shrink-0" aria-label="Avbryt">
            <X />
          </Button>
        </form>
      ) : (
        <Button variant="ghost" onClick={() => setAdding(true)} className="mt-2 -ml-2 h-10 text-muted-foreground">
          <UserPlus /> Legg til person selv
        </Button>
      )}
    </article>
  );
}
