import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { nb: "/", en: "/en" } },
};

// Tekstene ligger i components/landing-page.tsx (norsk og engelsk).
export default function Home() {
  return <LandingPage lang="nb" />;
}
