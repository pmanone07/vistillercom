import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/app/(auth)/auth-form";
import { LangSwitch } from "@/components/lang-switch";
import { AUTH_PATHS } from "@/lib/auth-i18n";

export const metadata: Metadata = {
  title: "Log in",
  alternates: { canonical: "/en/login", languages: { nb: "/login", en: "/en/login" } },
};

export default function EnglishLoginPage() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold">Log in</h1>
        <LangSwitch lang="nb" to={AUTH_PATHS.nb.login} />
      </div>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">For organizers. Participants don&apos;t need an account.</p>
      <Suspense>
        <AuthForm mode="login" lang="en" />
      </Suspense>
    </div>
  );
}
