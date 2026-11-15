import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorker } from "@/components/service-worker";
import { siteUrl } from "@/lib/supabase/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ViStiller – mindre organisering, mer fellesskap", template: "%s · ViStiller" },
  description:
    "Planlegg dugnader og arrangementer, fordel oppgaver og få folk til å stille opp – helt enkelt.",
  applicationName: "ViStiller",
  // iOS: åpnes som egen app fra hjemskjermen, uten Safari-rammen.
  appleWebApp: { capable: true, title: "ViStiller", statusBarStyle: "default" },
  // Hindrer at iOS gjør datoer og tall om til lenker.
  formatDetection: { telephone: false, date: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lar siden gå helt ut til kantene; safe-area-reglene i globals.css holder
  // innholdet unna hakk, kamerahull og hjemmelinje.
  viewportFit: "cover",
  // Tastaturet krymper siden i stedet for å legge seg over knapper nederst (Android/Chrome).
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nb" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster theme="light" position="top-center" />
        <ServiceWorker />
      </body>
    </html>
  );
}
