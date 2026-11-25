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
import { useT } from "@/components/i18n-provider";
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
  const t = useT().taskDialog;
  return (
    <Dialog open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{draft?.task ? t.edit : t.new}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        {/* key: nytt skjema for hver oppgave som åpnes */}
        {draft && <TaskForm key={draft.task?.id ?? `ny-${draft.title ?? ""}`} eventId={eventId} draft={draft} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ eventId, draft, onClose }: { eventId: string; draft: TaskDraft; onClose: () => void }) {
  const router = useRouter();
  const t = useT().taskDialog;
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
      toast.success(task ? t.updated : t.added);
      onClose();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={t.task} htmlFor="task-title">
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          autoFocus
          placeholder={t.taskPlaceholder}
          className={bigInput}
        />
      </Field>

      <Field label={t.count} htmlFor="task-capacity">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="size-11" onClick={() => setCapacity((c) => clamp(c - 1))} aria-label={t.fewer}>
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
          <Button type="button" variant="outline" className="size-11" onClick={() => setCapacity((c) => clamp(c + 1))} aria-label={t.more}>
            <Plus />
          </Button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t.from} htmlFor="task-start" optional>
          <Input id="task-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={bigInput} />
        </Field>
        <Field label={t.to} htmlFor="task-end" optional>
          <Input id="task-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={bigInput} />
        </Field>
      </div>

      <Field label={t.details} htmlFor="task-description" optional>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t.detailsPlaceholder}
          className="text-base"
        />
      </Field>

      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending && <Loader2 className="animate-spin" />}
        {task ? t.save : t.add}
      </Button>
    </form>
  );
}
