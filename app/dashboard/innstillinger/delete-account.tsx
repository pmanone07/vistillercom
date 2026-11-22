"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DELETE_CONFIRMATION } from "@/lib/legal";
import type { DeletionPlan } from "@/lib/account";
import { deleteMyAccount } from "./actions";

interface Props {
  email: string;
  /** null når kontosletting ikke er satt opp på serveren. */
  plan: DeletionPlan | null;
  contactEmail: string;
}

export function AccountSettings({ email, plan, contactEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const confirmed = confirmation.trim().toUpperCase() === DELETE_CONFIRMATION;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    setError(null);
    start(async () => {
      // Ved suksess sender serveren oss videre til /slett-konto/slettet.
      const result = await deleteMyAccount(confirmation);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <section id="konto" className="scroll-mt-20 space-y-4 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
      <div>
        <h2 className="font-semibold">Konto</h2>
        <p className="text-sm text-muted-foreground">Innlogget som {email}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/personvern" className="font-medium text-primary underline-offset-4 hover:underline">
          Personvernerklæring
        </Link>
        <Link href="/slett-konto" className="font-medium text-primary underline-offset-4 hover:underline">
          Om sletting av konto
        </Link>
      </div>

      <div className="space-y-3 rounded-xl bg-destructive/5 p-4 ring-1 ring-destructive/20">
        <div>
          <h3 className="font-semibold">Slett kontoen</h3>
          <p className="text-sm text-muted-foreground">
            Kontoen og personopplysningene dine slettes permanent. Dette kan ikke angres.
          </p>
        </div>
        {plan ? (
          <Button variant="destructive" className="h-11" onClick={() => setOpen(true)}>
            <Trash2 /> Slett kontoen min
          </Button>
        ) : (
          <p className="text-sm">
            Send e-post til{" "}
            <a href={`mailto:${contactEmail}`} className="font-medium text-primary underline underline-offset-4">
              {contactEmail}
            </a>{" "}
            fra {email}, så sletter vi kontoen for deg.
          </p>
        )}
      </div>

      {plan && (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (pending) return;
            setOpen(next);
            if (!next) {
              setConfirmation("");
              setError(null);
            }
          }}
        >
          <DialogContent showCloseButton={false}>
            <form onSubmit={submit} className="contents">
              <DialogHeader>
                <DialogTitle>Slette kontoen?</DialogTitle>
                <DialogDescription>
                  Kontoen {email} slettes permanent, og du blir logget ut. Dette kan ikke angres.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                {plan.deleted.length > 0 && (
                  <div className="rounded-lg bg-destructive/5 p-3 ring-1 ring-destructive/20">
                    <p className="font-medium">Dette slettes også, fordi du er eneste administrator:</p>
                    <ul className="mt-1 list-disc pl-5">
                      {plan.deleted.map((org) => (
                        <li key={org.id}>{org.name}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-muted-foreground">
                      Med alle arrangementer, oppgaver og påmeldinger. Et aktivt medlemskap stoppes med en gang,
                      uten refusjon for resten av perioden.
                    </p>
                  </div>
                )}
                {plan.kept.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="font-medium">Dette beholdes, fordi andre administrerer det:</p>
                    <ul className="mt-1 list-disc pl-5">
                      {plan.kept.map((org) => (
                        <li key={org.id}>{org.name}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-muted-foreground">Du blir bare fjernet som administrator.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="delete-confirmation" className="font-medium">
                    Skriv <span className="font-mono font-bold">{DELETE_CONFIRMATION}</span> for å bekrefte
                  </label>
                  <Input
                    id="delete-confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="h-11 text-base"
                    disabled={pending}
                  />
                </div>
                {error && (
                  <p role="alert" className="text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Avbryt
                </Button>
                <Button type="submit" variant="destructive" disabled={!confirmed || pending}>
                  {pending && <Loader2 className="animate-spin" />}
                  Slett kontoen permanent
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
