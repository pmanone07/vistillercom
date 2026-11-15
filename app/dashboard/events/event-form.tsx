"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, bigInput } from "@/components/field";
import { toLocalInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventRow, Organization } from "@/lib/types";
import { saveEvent } from "../actions";

interface Props {
  organizations: Organization[];
  /** Finnes når et eksisterende arrangement redigeres. */
  event?: EventRow;
}

export function EventForm({ organizations, event }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    organizationId: event?.organization_id ?? organizations[0]?.id ?? "",
    title: event?.title ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    startsAt: toLocalInput(event?.starts_at),
    endsAt: toLocalInput(event?.ends_at),
    signupDeadline: toLocalInput(event?.signup_deadline),
  });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const backHref = event ? `/dashboard/events/${event.id}` : "/dashboard";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveEvent({ id: event?.id, ...form });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(event ? "Endringene er lagret" : "Arrangementet er opprettet");
      router.push(`/dashboard/events/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
      {!event && organizations.length > 1 && (
        <Field label="Arrangør" htmlFor="organizationId">
          <select
            id="organizationId"
            value={form.organizationId}
            onChange={set("organizationId")}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Navn på arrangementet" htmlFor="title">
        <Input
          id="title"
          value={form.title}
          onChange={set("title")}
          maxLength={120}
          required
          autoFocus={!event}
          placeholder="Sommeravslutning – 5. klasse"
          className={bigInput}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starter" htmlFor="startsAt">
          <Input id="startsAt" type="datetime-local" value={form.startsAt} onChange={set("startsAt")} required className={bigInput} />
        </Field>
        <Field label="Slutter" htmlFor="endsAt" optional>
          <Input id="endsAt" type="datetime-local" value={form.endsAt} onChange={set("endsAt")} min={form.startsAt || undefined} className={bigInput} />
        </Field>
      </div>

      <Field label="Sted" htmlFor="location" optional>
        <Input id="location" value={form.location} onChange={set("location")} maxLength={200} placeholder="Gymsalen" className={bigInput} />
      </Field>

      <Field label="Beskrivelse" htmlFor="description" optional hint="Vises øverst på siden deltakerne ser.">
        <Textarea id="description" value={form.description} onChange={set("description")} maxLength={2000} rows={3} className="text-base" />
      </Field>

      <Field label="Påmeldingsfrist" htmlFor="signupDeadline" optional hint="Etter fristen kan ingen nye melde seg på.">
        <Input
          id="signupDeadline"
          type="datetime-local"
          value={form.signupDeadline}
          onChange={set("signupDeadline")}
          className={bigInput}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={backHref} className={cn(buttonVariants({ variant: "outline" }), "h-12 px-5 text-base")}>
          Avbryt
        </Link>
        <Button type="submit" disabled={pending} className="h-12 px-5 text-base">
          {pending && <Loader2 className="animate-spin" />}
          {event ? "Lagre endringer" : "Opprett arrangement"}
        </Button>
      </div>
    </form>
  );
}
