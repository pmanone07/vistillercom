import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: { default: "Dashbord", template: "%s – ViStiller" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/95 pt-safe backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <Logo href="/dashboard" />
          {/* Menyen leser adressen (aktiv knapp), så den må ligge i en Suspense-grense. */}
          <Suspense fallback={<div className="h-9 w-48" aria-hidden />}>
            <DashboardNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-safe-bar">{children}</main>
    </div>
  );
}
