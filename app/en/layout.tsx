import { Logo } from "@/components/logo";
import { LegalLinks } from "@/components/legal-links";

// Engelsk innlogging og registrering. Samme utseende som app/(auth)/layout.tsx.
export default function EnglishAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main lang="en" className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Logo className="mb-6 text-xl" />
      {children}
      <LegalLinks lang="en" className="mt-8 text-sm text-muted-foreground" />
    </main>
  );
}
