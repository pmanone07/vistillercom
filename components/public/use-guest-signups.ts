"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelSignup, signUpForTask } from "@/app/e/actions";
import { setGuestContact, setGuestToken } from "@/lib/guest";

interface SignUpInput {
  taskId: string;
  name: string;
  email: string;
  token: string | null;
  website?: string;
}

/**
 * Felles påmeldingslogikk for deltakersiden og bidragssiden: kaller serveren,
 * husker token og navn på enheten, og henter ferske tall etterpå.
 */
export function useGuestSignups(slug: string) {
  const router = useRouter();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const signUp = useCallback(
    async (input: SignUpInput): Promise<string | null> => {
      setBusyTaskId(input.taskId);
      try {
        const result = await signUpForTask(input);
        if (!result.ok) {
          toast.error(result.error);
          router.refresh(); // vis oppdaterte plasser, så man kan velge noe annet
          return null;
        }
        setGuestToken(slug, result.data.token);
        setGuestContact({ name: input.name.trim(), email: input.email.trim() });
        toast.success("Du er påmeldt. Takk for at du stiller!");
        router.refresh();
        return result.data.token;
      } finally {
        setBusyTaskId(null);
      }
    },
    [router, slug],
  );

  const cancel = useCallback(
    async (token: string, taskId: string): Promise<boolean> => {
      setBusyTaskId(taskId);
      try {
        const result = await cancelSignup({ token, taskId });
        if (!result.ok) {
          toast.error(result.error);
          router.refresh();
          return false;
        }
        toast.success("Du er meldt av. Plassen er ledig igjen.");
        router.refresh();
        return true;
      } finally {
        setBusyTaskId(null);
      }
    },
    [router],
  );

  return { busyTaskId, signUp, cancel };
}
