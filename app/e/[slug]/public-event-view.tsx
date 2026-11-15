"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Field, bigInput } from "@/components/field";
import { EventInfo, SignupClosedNotice } from "@/components/public/event-info";
import { TaskCard } from "@/components/public/task-card";
import { useAutoRefresh } from "@/components/public/use-auto-refresh";
import { useGuestSignups } from "@/components/public/use-guest-signups";
import { getGuestContact, getGuestToken } from "@/lib/guest";
import type { PublicEvent, PublicTask } from "@/lib/types";
import { loadMyTaskIds } from "../actions";

export function PublicEventView({ event }: { event: PublicEvent }) {
  const { busyTaskId, signUp, cancel } = useGuestSignups(event.slug);
  const [token, setToken] = useState<string | null>(null);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [signupTask, setSignupTask] = useState<PublicTask | null>(null);
  const [cancelTask, setCancelTask] = useState<PublicTask | null>(null);
  const [contact, setContact] = useState({ name: "", email: "" });
  const [honeypot, setHoneypot] = useState("");

  useAutoRefresh(20_000, !signupTask && !cancelTask && !busyTaskId);

  // Har denne enheten meldt seg på før? Da vet vi hvilke oppgaver som er «mine».
  useEffect(() => {
    const stored = getGuestToken(event.slug);
    if (!stored) return;
    let active = true;
    loadMyTaskIds({ token: stored, slug: event.slug }).then((ids) => {
      if (!active) return;
      setToken(stored);
      setMine(new Set(ids));
    });
    return () => {
      active = false;
    };
  }, [event.slug]);

  const missing = event.tasks.reduce((sum, t) => sum + Math.max(t.capacity - t.taken, 0), 0);

  function openSignup(task: PublicTask) {
    const saved = getGuestContact();
    setContact((prev) => ({ name: prev.name || saved.name, email: prev.email || saved.email }));
    setSignupTask(task);
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signupTask) return;
    const task = signupTask;
    const newToken = await signUp({
      taskId: task.id,
      name: contact.name,
      email: contact.email,
      token: token ?? getGuestToken(event.slug),
      website: honeypot,
    });
    if (!newToken) return;
    setToken(newToken);
    setMine((prev) => new Set(prev).add(task.id));
    setSignupTask(null);
  }

  async function confirmCancel() {
    if (!cancelTask || !token) return;
    const task = cancelTask;
    const ok = await cancel(token, task.id);
    if (!ok) return false;
    setMine((prev) => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
  }

  const submitting = signupTask !== null && busyTaskId === signupTask.id;

  return (
    <div className="space-y-6">
      <EventInfo event={event} />

      {token && mine.size > 0 && (
        <Link
          href={`/b/${token}`}
          className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-sm ring-1 ring-primary/20 transition-colors hover:bg-primary/15"
        >
          <UserCheck className="size-5 shrink-0 text-primary" aria-hidden />
          <span className="flex-1">
            <span className="font-semibold">
              Du stiller på {mine.size} {mine.size === 1 ? "oppgave" : "oppgaver"}.
            </span>{" "}
            Se bidragene dine og den private lenken din.
          </span>
          <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
        </Link>
      )}

      <SignupClosedNotice event={event} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Dette trenger vi hjelp til</h2>
          {event.tasks.length > 0 && (
            <p className="text-sm text-muted-foreground tabular-nums">
              {missing === 0 ? "Alt er dekket" : `${missing} ${missing === 1 ? "plass" : "plasser"} igjen`}
            </p>
          )}
        </div>

        {event.tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">
            Arrangøren har ikke lagt inn oppgaver ennå. Kom tilbake litt senere.
          </div>
        ) : (
          <ul className="space-y-3">
            {event.tasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  mine={mine.has(task.id)}
                  signupOpen={event.signup_open}
                  busy={busyTaskId === task.id}
                  onSignUp={() => openSignup(task)}
                  onCancel={() => setCancelTask(task)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={signupTask !== null} onOpenChange={(open) => !open && !submitting && setSignupTask(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{signupTask?.title}</DialogTitle>
            <DialogDescription>Skriv navnet ditt, så står du på listen. Du trenger ikke konto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSignup} className="space-y-4">
            <Field label="Navn" htmlFor="guest-name">
              <Input
                id="guest-name"
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                autoComplete="name"
                maxLength={80}
                required
                autoFocus
                className={bigInput}
              />
            </Field>
            <Field label="E-post" htmlFor="guest-email" optional hint="Bare arrangøren ser den.">
              <Input
                id="guest-email"
                type="email"
                inputMode="email"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                autoComplete="email"
                maxLength={200}
                className={bigInput}
              />
            </Field>
            {/* Honningfelle: usynlig for folk, fristende for roboter. */}
            <div aria-hidden="true" className="absolute -left-[9999px] size-0 overflow-hidden">
              <label>
                Nettside
                <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>
            <Button type="submit" disabled={submitting || !contact.name.trim()} className="h-12 w-full text-base">
              {submitting && <Loader2 className="animate-spin" />}
              Meld meg på
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelTask !== null}
        onOpenChange={(open) => !open && setCancelTask(null)}
        title="Melde deg av?"
        description={`Du fjernes fra «${cancelTask?.title ?? ""}», og plassen blir ledig for andre.`}
        confirmLabel="Ja, meld meg av"
        cancelLabel="Nei, behold"
        destructive
        onConfirm={confirmCancel}
      />
    </div>
  );
}
