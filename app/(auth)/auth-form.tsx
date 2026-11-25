"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, bigInput } from "@/components/field";
import { AUTH_PATHS, AUTH_TEXT, type AuthLang } from "@/lib/auth-i18n";
import { signIn, signUp, type AuthState } from "./actions";

const initial: AuthState = {};

export function AuthForm({ mode, lang = "nb" }: { mode: "login" | "register"; lang?: AuthLang }) {
  const isLogin = mode === "login";
  const t = AUTH_TEXT[lang];
  const paths = AUTH_PATHS[lang];
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
      <input type="hidden" name="lang" value={lang} />
      <Field label={t.email} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className={bigInput} />
      </Field>
      <Field label={t.password} htmlFor="password" hint={isLogin ? undefined : t.passwordHint}>
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
        {isLogin ? t.login : t.register}
      </Button>
      {!isLogin && (
        <p className="text-center text-xs text-muted-foreground">
          {t.acceptPrefix}
          <Link href="/vilkar" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.terms}
          </Link>
          {t.readAlso}
          <Link href="/personvern" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.privacy}
          </Link>
          .
        </p>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? t.noAccount : t.haveAccount}
        <Link
          href={(isLogin ? paths.register : paths.login) + (next ? `?next=${encodeURIComponent(next)}` : "")}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? t.register : t.login}
        </Link>
      </p>
    </form>
  );
}
