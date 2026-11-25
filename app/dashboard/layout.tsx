import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { LangProvider } from "@/components/i18n-provider";
import { getLang } from "@/lib/i18n-server";
import { DashboardNav } from "./dashboard-nav";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: { default: lang === "en" ? "Dashboard" : "Dashbord", template: "%s – ViStiller" },
    robots: { index: false, follow: false },
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      {/* Språket leses fra en informasjonskapsel, så rammen må ligge i en Suspense-grense. */}
      <Suspense fallback={<Header />}>
        <Shell>{children}</Shell>
      </Suspense>
    </div>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <LangProvider lang={lang}>
      <Header>
        {/* Menyen leser adressen (aktiv knapp), så den må ligge i en Suspense-grense. */}
        <Suspense fallback={<div className="h-9 w-48" aria-hidden />}>
          <DashboardNav />
        </Suspense>
      </Header>
      <main lang={lang === "en" ? "en" : undefined} className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-safe-bar">
        {children}
      </main>
    </LangProvider>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 pt-safe backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
        <Logo href="/dashboard" />
        {children ?? <div className="h-9 w-48" aria-hidden />}
      </div>
    </header>
  );
}
