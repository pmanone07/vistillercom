import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { LegalLinks } from "@/components/legal-links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ramme for offentlige informasjonssider (personvern, kontosletting). Krever ikke innlogging. */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/95 pt-safe backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <Logo />
          <Link href="/start" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
            <ArrowLeft /> Til ViStiller
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <article className="legal rounded-2xl bg-background p-5 ring-1 ring-foreground/10 sm:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance">{title}</h1>
          {updated && <p className="mt-1 text-sm text-muted-foreground">Sist oppdatert {updated}</p>}
          {intro && <div className="mt-4 text-lg text-pretty text-muted-foreground">{intro}</div>}
          <div className="mt-6">{children}</div>
        </article>
      </main>

      <footer className="px-4 py-6 pb-safe-bar text-center text-sm text-muted-foreground">
        <LegalLinks />
        <p className="mt-2">© ViStiller · vistiller.com</p>
      </footer>
    </div>
  );
}

/** Nummerert seksjon med anker, så det går an å lenke rett til den. */
export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-tittel`} className="scroll-mt-20 border-t py-6 first:border-t-0 first:pt-0">
      <h2 id={`${id}-tittel`} className="text-xl font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
