"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, bigInput } from "@/components/field";
import { toLocalTime } from "@/lib/format";
import type { TaskRow } from "@/lib/types";
import { saveTask } from "../../actions";

export interface TaskDraft {
  /** Eksisterende oppgave som redigeres. */
  task?: TaskRow;
  /** Forhåndsutfylt navn for en ny oppgave. */
  title?: string;
}

interface Props {
  eventId: string;
  draft: TaskDraft | null;
  onClose: () => void;
}

export function TaskDialog({ eventId, draft, onClose }: Props) {
  return (
    <Dialog open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{draft?.task ? "Endre oppgave" : "Ny oppgave"}</DialogTitle>
          <DialogDescription>Hva trenger dere hjelp til, og hvor mange?</DialogDescription>
        </DialogHeader>
        {/* key: nytt skjema for hver oppgave som åpnes */}
        {draft && <TaskForm key={draft.task?.id ?? `ny-${draft.title ?? ""}`} eventId={eventId} draft={draft} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ eventId, draft, onClose }: { eventId: string; draft: TaskDraft; onClose: () => void }) {
  const router = useRouter();
  const { task } = draft;
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(task?.title ?? draft.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [capacity, setCapacity] = useState(task?.capacity ?? 2);
  const [startTime, setStartTime] = useState(toLocalTime(task?.starts_at));
  const [endTime, setEndTime] = useState(toLocalTime(task?.ends_at));

  const clamp = (n: number) => Math.min(Math.max(Math.round(n) || 1, 1), 500);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveTask({ id: task?.id, eventId, title, description, capacity, startTime, endTime });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(task ? "Oppgaven er oppdatert" : "Oppgaven er lagt til");
      onClose();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Oppgave" htmlFor="task-title">
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          autoFocus
          placeholder="Bake kake"
          className={bigInput}
        />
      </Field>

      <Field label="Antall personer" htmlFor="task-capacity">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="size-11" onClick={() => setCapacity((c) => clamp(c - 1))} aria-label="Færre">
            <Minus />
          </Button>
          <Input
            id="task-capacity"
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            value={capacity}
            onChange={(e) => setCapacity(clamp(Number(e.target.value)))}
            className="h-11 w-20 text-center text-base tabular-nums"
          />
          <Button type="button" variant="outline" className="size-11" onClick={() => setCapacity((c) => clamp(c + 1))} aria-label="Flere">
            <Plus />
          </Button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fra kl." htmlFor="task-start" optional>
          <Input id="task-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={bigInput} />
        </Field>
        <Field label="Til kl." htmlFor="task-end" optional>
          <Input id="task-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={bigInput} />
        </Field>
      </div>

      <Field label="Beskrivelse" htmlFor="task-description" optional>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Ta med ferdig oppskåret kake."
          className="text-base"
        />
      </Field>

      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending && <Loader2 className="animate-spin" />}
        {task ? "Lagre" : "Legg til oppgave"}
      </Button>
    </form>
  );
}
