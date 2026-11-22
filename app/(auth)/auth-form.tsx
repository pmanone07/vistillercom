"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, bigInput } from "@/components/field";
import { signIn, signUp, type AuthState } from "./actions";

const initial: AuthState = {};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? signIn : signUp, initial);
  const next = useSearchParams().get("next") ?? "";

  if (state.message) {
    return (
      <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950 ring-1 ring-emerald-200">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="E-post" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className={bigInput} />
      </Field>
      <Field label="Passord" htmlFor="password" hint={isLogin ? undefined : "Minst 8 tegn."}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={8}
          required
          className={bigInput}
        />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending && <Loader2 className="animate-spin" />}
        {isLogin ? "Logg inn" : "Opprett konto"}
      </Button>
      {!isLogin && (
        <p className="text-center text-xs text-muted-foreground">
          Ved å opprette konto godtar du{" "}
          <Link href="/vilkar" className="font-medium text-primary underline-offset-4 hover:underline">
            brukervilkårene
          </Link>
          . Les også{" "}
          <Link href="/personvern" className="font-medium text-primary underline-offset-4 hover:underline">
            personvernerklæringen
          </Link>
          .
        </p>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Har du ikke konto? " : "Har du konto fra før? "}
        <Link
          href={(isLogin ? "/registrer" : "/login") + (next ? `?next=${encodeURIComponent(next)}` : "")}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? "Opprett konto" : "Logg inn"}
        </Link>
      </p>
    </form>
  );
}
