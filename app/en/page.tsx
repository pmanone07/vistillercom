import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: { absolute: "ViStiller – less organizing, more community" },
  description:
    "Plan volunteer work and events, share out the tasks and get people to show up. Participants sign up without an account.",
  alternates: { canonical: "/en", languages: { nb: "/", en: "/en" } },
};

export default function EnglishHome() {
  return <LandingPage lang="en" />;
}
