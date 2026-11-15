import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Opprett konto" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-xl font-bold">Opprett konto</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">Gratis å komme i gang. Første arrangement er klart på få minutter.</p>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </>
  );
}
