import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Logg inn" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-bold">Logg inn</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">For deg som arrangerer. Deltakere trenger ikke konto.</p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </>
  );
}
