"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, bigInput } from "@/components/field";
import { copyEvent } from "../../actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  title: string;
}

export function CopyDialog({ open, onOpenChange, eventId, title }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState(title);
  const [startsAt, setStartsAt] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await copyEvent({ eventId, title: newTitle, startsAt });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Arrangementet er kopiert");
      onOpenChange(false);
      router.push(`/dashboard/events/${result.data.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Kopier arrangementet</DialogTitle>
          <DialogDescription>
            Alle oppgavene blir med til det nye arrangementet. Påmeldingene blir ikke kopiert.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Navn" htmlFor="copy-title">
            <Input id="copy-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={120} required className={bigInput} />
          </Field>
          <Field label="Ny dato og klokkeslett" htmlFor="copy-starts">
            <Input
              id="copy-starts"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className={bigInput}
            />
          </Field>
          <Button type="submit" disabled={pending} className="h-12 w-full text-base">
            {pending && <Loader2 className="animate-spin" />}
            Opprett kopi
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
