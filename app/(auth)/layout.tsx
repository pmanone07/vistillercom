import { Logo } from "@/components/logo";
import { LegalLinks } from "@/components/legal-links";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Logo className="mb-6 text-xl" />
      {children}
      <LegalLinks className="mt-8 text-sm text-muted-foreground" />
    </main>
  );
}
