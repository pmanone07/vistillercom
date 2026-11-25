"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Trash2 } from "lucide-react";
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
import { useLang, useT } from "@/components/i18n-provider";
import { chooseLangHref, PATHS, type Lang } from "@/lib/i18n";
import type { DeletionPlan } from "@/lib/account";
import { cn } from "@/lib/utils";
import { deleteMyAccount } from "./actions";

interface Props {
  email: string;
  /** null når kontosletting ikke er satt opp på serveren. */
  plan: DeletionPlan | null;
  contactEmail: string;
}

const LANGUAGES: { lang: Lang; label: string }[] = [
  { lang: "nb", label: "Norsk" },
  { lang: "en", label: "English" },
];

/** Språkvalg for arrangøren. Lagres på enheten (via /sprak) og gjelder hele ViStiller. */
export function LanguageSettings() {
  const lang = useLang();
  const t = useT().settings;
  return (
    <section className="space-y-3 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
      <div>
        <h2 className="font-semibold">{t.languageTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.languageHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((option) => {
          const active = option.lang === lang;
          return (
            <a
              key={option.lang}
              href={chooseLangHref(option.lang, "/dashboard/innstillinger")}
              lang={option.lang}
              hrefLang={option.lang}
              aria-current={active ? "true" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium ring-1 transition-colors",
                active ? "bg-primary/10 text-primary ring-primary/30" : "ring-foreground/15 hover:bg-muted",
              )}
            >
              {active && <Check className="size-4" aria-hidden />}
              {option.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function AccountSettings({ email, plan, contactEmail }: Props) {
  const lang = useLang();
  const messages = useT();
  const t = messages.account;
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const confirmed = confirmation.trim().toUpperCase() === t.confirmWord;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    setError(null);
    start(async () => {
      // Ved suksess sender serveren oss videre til siden som bekrefter slettingen.
      const result = await deleteMyAccount(confirmation);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <section id="konto" className="scroll-mt-20 space-y-4 rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
      <div>
        <h2 className="font-semibold">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.signedInAs(email)}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href={PATHS[lang].terms} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.terms}
        </Link>
        <Link href={PATHS[lang].privacy} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.privacy}
        </Link>
        <Link href={PATHS[lang].deleteAccount} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.aboutDeletion}
        </Link>
      </div>

      <div className="space-y-3 rounded-xl bg-destructive/5 p-4 ring-1 ring-destructive/20">
        <div>
          <h3 className="font-semibold">{t.deleteTitle}</h3>
          <p className="text-sm text-muted-foreground">{t.deleteText}</p>
        </div>
        {plan ? (
          <Button variant="destructive" className="h-11" onClick={() => setOpen(true)}>
            <Trash2 /> {t.deleteButton}
          </Button>
        ) : (
          <p className="text-sm">
            {t.mailPrefix}{" "}
            <a href={`mailto:${contactEmail}`} className="font-medium text-primary underline underline-offset-4">
              {contactEmail}
            </a>{" "}
            {t.mailSuffix(email)}
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
                <DialogTitle>{t.dialogTitle}</DialogTitle>
                <DialogDescription>{t.dialogText(email)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                {plan.deleted.length > 0 && (
                  <div className="rounded-lg bg-destructive/5 p-3 ring-1 ring-destructive/20">
                    <p className="font-medium">{t.alsoDeleted}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {plan.deleted.map((org) => (
                        <li key={org.id}>{org.name}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-muted-foreground">{t.alsoDeletedHint}</p>
                  </div>
                )}
                {plan.kept.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="font-medium">{t.kept}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {plan.kept.map((org) => (
                        <li key={org.id}>{org.name}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-muted-foreground">{t.keptHint}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="delete-confirmation" className="font-medium">
                    {t.typePrefix} <span className="font-mono font-bold">{t.confirmWord}</span> {t.typeToConfirm}
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
                  {messages.common.cancel}
                </Button>
                <Button type="submit" variant="destructive" disabled={!confirmed || pending}>
                  {pending && <Loader2 className="animate-spin" />}
                  {t.confirmButton}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
