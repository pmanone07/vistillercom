import Link from "next/link";
import { cn } from "@/lib/utils";

/** Lenkene til personvern og kontosletting, brukt i alle bunntekster. */
export function LegalLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const link = cn("underline-offset-4 hover:underline", linkClassName);
  return (
    <nav aria-label="Vilkår og personvern" className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", className)}>
      <Link href="/vilkar" className={link}>
        Vilkår
      </Link>
      <Link href="/personvern" className={link}>
        Personvern
      </Link>
      <Link href="/slett-konto" className={link}>
        Slett konto
      </Link>
    </nav>
  );
}
