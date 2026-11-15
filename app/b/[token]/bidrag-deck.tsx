"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Bookmark, Check, CheckCircle2, ChevronDown, Copy, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StickyPages, type StickyPageItem } from "@/components/ui/sticky-pages";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EventInfo, SignupClosedNotice } from "@/components/public/event-info";
import { TaskCard } from "@/components/public/task-card";
import { useAutoRefresh } from "@/components/public/use-auto-refresh";
import { useGuestSignups } from "@/components/public/use-guest-signups";
import { getGuestContact, setGuestContact, setGuestToken } from "@/lib/guest";
import { cn, copyToClipboard } from "@/lib/utils";
import type { MySignups, PublicTask } from "@/lib/types";

/**
 * Bidragssiden er en bunke med tre «ark» (Sticky Pages). Hvert ark har en fane
 * øverst. Arkene over det du ser på ligger stablet som faner i toppen, og de
 * under stikker opp nederst – så alle tre fanene er alltid synlige og fungerer
 * som navigasjon. Du kan rulle mellom arkene eller trykke på en fane.
 */
const TAB = 56; // høyden på en fane, i px
const PAGE_COUNT = 3;

const subscribeNever = () => () => {};

export function BidragDeck({ token, data }: { token: string; data: MySignups }) {
  const { event } = data;
  const { busyTaskId, signUp, cancel } = useGuestSignups(event.slug);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [cancelTask, setCancelTask] = useState<PublicTask | null>(null);
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribeNever, () => window.location.origin, () => "");
  const link = `${origin}/b/${token}`;

  useAutoRefresh(20_000, !cancelTask && !busyTaskId);

  const mineIds = useMemo(() => new Set(data.task_ids), [data.task_ids]);
  const mine = event.tasks.filter((t) => mineIds.has(t.id));
  const available = event.tasks.filter((t) => !mineIds.has(t.id) && t.taken < t.capacity);

  // Åpnes lenken på en ny enhet, husker vi den der også.
  useEffect(() => {
    setGuestToken(event.slug, token);
    if (!getGuestContact().name) {
      setGuestContact({ name: data.participant_name, email: data.participant_email ?? "" });
    }
  }, [event.slug, token, data.participant_name, data.participant_email]);

  /** Hvor bunken starter på siden, og hvor langt man ruller per ark. */
  const metrics = useCallback(() => {
    const root = wrapRef.current?.firstElementChild as HTMLElement | null;
    const first = root?.firstElementChild as HTMLElement | null;
    if (!root || !first) return null;
    return { top: root.getBoundingClientRect().top + window.scrollY, step: first.offsetHeight - TAB };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const m = metrics();
      if (!m || m.step <= 0) return;
      const index = Math.round((window.scrollY - m.top) / m.step);
      setActive(Math.min(Math.max(index, 0), PAGE_COUNT - 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [metrics]);

  const goTo = useCallback(
    (index: number) => {
      const m = metrics();
      if (!m) return;
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: m.top + index * m.step, behavior: calm ? "auto" : "smooth" });
    },
    [metrics],
  );

  async function copyLink() {
    if (await copyToClipboard(link)) {
      setCopied(true);
      toast.success("Lenken er kopiert");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Kunne ikke kopiere. Marker lenken og kopier den selv.");
    }
  }

  async function shareLink() {
    try {
      await navigator.share({ title: `Mine bidrag – ${event.title}`, url: link });
    } catch {
      // Delingsmenyen ble lukket.
    }
  }

  async function confirmCancel() {
    if (!cancelTask) return;
    return cancel(token, cancelTask.id);
  }

  const canShare = origin !== "" && typeof navigator.share === "function";

  const sections: { id: string; title: string; count?: number; body: React.ReactNode }[] = [
    {
      id: "mine",
      title: "Mine oppgaver",
      count: mine.length,
      body: (
        <div className="space-y-4">
          <EventInfo event={event} compact />
          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center">
              <p className="font-semibold">Du står ikke på noen oppgaver nå</p>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">Vil du bidra likevel? Se hva som fortsatt trengs.</p>
              <Button onClick={() => goTo(1)} className="h-11">
                Se ledige oppgaver <ArrowRight />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Takk, {data.participant_name.split(" ")[0]}! Dette har du sagt ja til:
              </p>
              <ul className="space-y-3">
                {mine.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      mine
                      signupOpen={event.signup_open}
                      busy={busyTaskId === task.id}
                      onSignUp={() => {}}
                      onCancel={() => setCancelTask(task)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    },
    {
      id: "ledige",
      title: "Ledige oppgaver",
      count: available.length,
      body: (
        <div className="space-y-4">
          <SignupClosedNotice event={event} />
          {available.length === 0 ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-700" aria-hidden />
              <p className="font-semibold">Alt er dekket!</p>
              <p className="text-sm text-muted-foreground">Takk til alle som stiller opp.</p>
            </div>
          ) : (
            <>
              {event.signup_open && (
                <p className="text-sm text-muted-foreground">
                  Ett trykk, så står du på som {data.participant_name}.
                </p>
              )}
              <ul className="space-y-3">
                {available.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      mine={false}
                      signupOpen={event.signup_open}
                      busy={busyTaskId === task.id}
                      onSignUp={() =>
                        signUp({
                          taskId: task.id,
                          name: data.participant_name,
                          email: data.participant_email ?? "",
                          token,
                        })
                      }
                      onCancel={() => {}}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    },
    {
      id: "lenke",
      title: "Min lenke",
      body: (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
            <Bookmark className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="text-sm">
              <p className="font-semibold">Ta vare på denne lenken</p>
              <p className="text-muted-foreground">
                Den er din private inngang til å se, legge til eller melde deg av oppgaver – også fra en annen mobil
                eller PC. Den er lagret på denne enheten.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Din private lenke"
              className="h-11 font-mono text-xs"
            />
            <Button variant="outline" onClick={copyLink} className="h-11 shrink-0 px-3">
              {copied ? <Check /> : <Copy />} Kopier
            </Button>
          </div>
          {canShare && (
            <Button variant="outline" onClick={shareLink} className="h-11 w-full">
              <Share2 /> Send lenken til meg selv
            </Button>
          )}
          <Link href={`/e/${event.slug}`} className={cn(buttonVariants({ variant: "ghost" }), "h-11 w-full")}>
            Se hele arrangementet <ArrowRight />
          </Link>
        </div>
      ),
    },
  ];

  const pages: StickyPageItem[] = sections.map((section, index) => ({
    id: section.id,
    bg: "bg-background",
    className: cn(
      "ring-1 ring-foreground/10",
      index > 0 && "rounded-t-3xl shadow-[0_-12px_30px_-18px_rgb(0_0_0/0.4)]",
    ),
    content: (
      <section aria-label={section.title} className="flex h-full flex-col">
        <button
          type="button"
          onClick={() => goTo(index)}
          aria-current={active === index ? "step" : undefined}
          style={{ height: TAB }}
          className="flex w-full shrink-0 items-center gap-3 px-4 text-left outline-none focus-visible:bg-muted"
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
              active === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </span>
          <span className={cn("flex-1 font-semibold", active !== index && "text-muted-foreground")}>{section.title}</span>
          {section.count !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">{section.count}</span>
          )}
          <ChevronDown
            aria-hidden
            className={cn("size-5 text-muted-foreground transition-transform", active === index && "rotate-180")}
          />
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-6">{section.body}</div>
      </section>
    ),
  }));

  return (
    <div ref={wrapRef}>
      <StickyPages
        pages={pages}
        stackOffset={TAB}
        peek
        pageHeight={`calc(100dvh - ${(PAGE_COUNT - 1) * TAB}px)`}
        aria-label="Mine bidrag"
      />
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
