import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/supabase/env";

// /robots.txt. Arrangements- og påmeldingssidene (/e, /b) er ikke blokkert her,
// fordi de selv sier «noindex», og det må søkemotorene kunne lese.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/auth/", "/sprak", "/start", "/offline"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
