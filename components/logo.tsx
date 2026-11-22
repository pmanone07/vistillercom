import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** ViStiller-symbolet (personer over en V med hake) og navnet. Kilde: assets/vistiller-logo.png. */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-[#0c2857]", className)}
    >
      <Image src="/logo-mark.png" alt="" width={118} height={128} priority className="h-8 w-auto" />
      ViStiller
    </Link>
  );
}
