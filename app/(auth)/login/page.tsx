import type { Metadata } from "next";
import { Suspense } from "react";
import { LangSwitch } from "@/components/lang-switch";
import { AUTH_PATHS } from "@/lib/auth-i18n";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Logg inn" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold">Logg inn</h1>
        <LangSwitch lang="en" to={AUTH_PATHS.en.login} />
      </div>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">For deg som arrangerer. Deltakere trenger ikke konto.</p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
