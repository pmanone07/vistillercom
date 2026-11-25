import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, CalendarPlus, ChevronRight, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoRefresh } from "@/components/auto-refresh";
import { SetupNotice } from "@/components/setup-notice";
import { StaffingBar } from "@/components/staffing";
import { requireUser } from "@/lib/auth";
import { getEventSummaries, getOrganizations, type EventSummary } from "@/lib/data";
import { formatEventWhen } from "@/lib/format";
import { getMessages, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { Onboarding } from "./onboarding";

export default function DashboardPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireUser();
  const [organizations, events, lang] = await Promise.all([getOrganizations(), getEventSummaries(), getLang()]);
  if (organizations.length === 0) return <Onboarding />;
  // Betalingsmur: uten aktivt medlemskap i noen organisasjon går man til betaling.
  if (!organizations.some((o) => o.hasAccess)) redirect("/dashboard/medlemskap");
  const unpaid = organizations.filter((o) => !o.hasAccess);
  const t = getMessages(lang).dashboard;

  const upcoming = events.filter((e) => !e.over);
  const past = events.filter((e) => e.over).reverse();
  const orgName = new Map(organizations.map((o) => [o.id, o.name]));
  const showOrg = organizations.length > 1;

  const signedUp = upcoming.reduce((sum, e) => sum + e.taken, 0);
  const missing = upcoming.reduce((sum, e) => sum + e.missing, 0);

  return (
    <div className="space-y-8">
      {/* Bemanningstallene følger med når folk melder seg på. */}
      <AutoRefresh intervalMs={20_000} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{showOrg ? t.yourEvents : organizations[0].name}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {unpaid.length > 0 && (
        <Link
          href="/dashboard/medlemskap"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200"
        >
          <span className="flex-1">
            <span className="font-semibold">{unpaid.map((o) => o.name).join(", ")}</span> {t.missingMembership}
          </span>
          <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
      )}

      <dl className="grid grid-cols-3 gap-3">
        <Stat label={t.upcoming} value={upcoming.length} />
        <Stat label={t.signedUp} value={signedUp} />
        <Stat label={t.missingPeople} value={missing} tone={missing > 0 ? "warn" : "ok"} />
      </dl>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t.upcoming}</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-background p-8 text-center">
            <CalendarPlus className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
            <p className="font-semibold">{t.noUpcoming}</p>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">{t.noUpcomingHint}</p>
            <Link href="/dashboard/events/new" className={cn(buttonVariants(), "h-12 px-5 text-base")}>
              {t.createEvent}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((event) => (
              <li key={event.id}>
                <EventCard lang={lang} event={event} orgName={showOrg ? orgName.get(event.organization_id) : undefined} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t.past}</h2>
          <ul className="space-y-3">
            {past.map((event) => (
              <li key={event.id}>
                <EventCard
                  lang={lang}
                  event={event}
                  orgName={showOrg ? orgName.get(event.organization_id) : undefined}
                  past
                />
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">{t.copyHint}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" | "ok" }) {
  return (
    <div className="rounded-2xl bg-background p-3 ring-1 ring-foreground/10">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "warn" && "text-amber-700",
          tone === "ok" && "text-emerald-700",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function EventCard({ event, orgName, past, lang }: { event: EventSummary; orgName?: string; past?: boolean; lang: Lang }) {
  const t = getMessages(lang).dashboard;
  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="block rounded-2xl bg-background p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {orgName && <p className="text-xs font-medium text-muted-foreground">{orgName}</p>}
          <h3 className="text-base leading-snug font-semibold">{event.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" aria-hidden /> {formatEventWhen(event.starts_at, event.ends_at, lang)}
          </p>
          {event.location && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden /> {event.location}
            </p>
          )}
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      {event.taskCount === 0 ? (
        <p className="mt-3 text-sm text-amber-800">{t.noTasks}</p>
      ) : past ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.filled(event.taken, event.capacity)}</p>
      ) : (
        <StaffingBar className="mt-3" taken={event.taken} capacity={event.capacity} />
      )}
      {event.status === "closed" && !past && <p className="mt-2 text-xs font-medium text-muted-foreground">{t.closed}</p>}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
