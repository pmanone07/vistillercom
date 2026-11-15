import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Plus, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { signOut } from "../(auth)/actions";

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
          <div className="flex items-center gap-1">
            <Link href="/dashboard/events/new" className={buttonVariants({ size: "lg" })}>
              <Plus /> <span className="max-sm:sr-only">Nytt arrangement</span>
            </Link>
            <Link
              href="/dashboard/innstillinger"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
              aria-label="Innstillinger"
            >
              <Settings /> <span className="max-md:sr-only">Innstillinger</span>
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="lg" aria-label="Logg ut">
                <LogOut /> <span className="max-sm:sr-only">Logg ut</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-safe-bar">{children}</main>
    </div>
  );
}
