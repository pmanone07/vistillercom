import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { ReloadButton } from "./reload-button";

export const metadata: Metadata = { title: "Uten nett / Offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">Du er uten nett</h1>
      <p className="text-muted-foreground">
        ViStiller trenger nett for å vise ledige plasser og lagre påmeldinger. Prøv igjen når du er tilkoblet.
      </p>
      <div lang="en">
        <p className="font-semibold">You&apos;re offline</p>
        <p className="text-muted-foreground">
          ViStiller needs an internet connection to show open spots and save sign-ups. Try again when you&apos;re
          connected.
        </p>
      </div>
      <ReloadButton />
    </main>
  );
}
