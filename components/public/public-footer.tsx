import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="px-4 py-6 pb-safe-bar text-center text-xs text-muted-foreground">
      Laget med{" "}
      <Link href="/" className="font-semibold text-foreground underline-offset-4 hover:underline">
        ViStiller
      </Link>{" "}
      – mindre organisering, mer fellesskap.
    </footer>
  );
}
