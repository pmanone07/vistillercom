import type { MetadataRoute } from "next";
import { PATHS } from "@/lib/i18n";
import { siteUrl } from "@/lib/supabase/env";

// /sitemap.xml – de offentlige sidene, med norsk og engelsk versjon koblet sammen.
// Arrangementer (/e) og påmeldingslenker (/b) er med vilje ikke med: de skal ikke være søkbare.
const PAGES = [
  { key: "home", priority: 1, changeFrequency: "weekly" },
  { key: "register", priority: 0.8, changeFrequency: "monthly" },
  { key: "login", priority: 0.5, changeFrequency: "yearly" },
  { key: "privacy", priority: 0.3, changeFrequency: "yearly" },
  { key: "terms", priority: 0.3, changeFrequency: "yearly" },
  { key: "deleteAccount", priority: 0.3, changeFrequency: "yearly" },
] as const;

const url = (path: string) => `${siteUrl}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ key, priority, changeFrequency }) => {
    const languages = { nb: url(PATHS.nb[key]), en: url(PATHS.en[key]) };
    return (["nb", "en"] as const).map((lang) => ({
      url: url(PATHS[lang][key]),
      changeFrequency,
      priority: lang === "nb" ? priority : Math.round(priority * 9) / 10,
      alternates: { languages },
    }));
  });
}
