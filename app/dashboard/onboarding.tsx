"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, bigInput } from "@/components/field";
import { createOrganization } from "./actions";

export function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createOrganization({ name });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push("/dashboard/events/new");
    });
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-background p-6 ring-1 ring-foreground/10">
      <h1 className="text-xl font-bold">Velkommen til ViStiller</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Hvem arrangerer du for? Navnet vises til dem som melder seg på.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Skole, lag, korps eller gruppe" htmlFor="org-name" hint="For eksempel «Strindheim skole FAU» eller «Ranheim IL».">
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoFocus
            className={bigInput}
          />
        </Field>
        <Button type="submit" disabled={pending || !name.trim()} className="h-12 w-full text-base">
          {pending && <Loader2 className="animate-spin" />}
          Fortsett
        </Button>
      </form>
    </div>
  );
}
