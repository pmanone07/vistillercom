import type { MetadataRoute } from "next";

// Gjør at ViStiller kan legges til på hjemskjermen (Android: «Installer app»,
// iOS: Del → «Legg til på Hjem-skjerm») og åpnes uten nettleserramme.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ViStiller",
    short_name: "ViStiller",
    description: "Planlegg dugnader og arrangementer, fordel oppgaver og få folk til å stille opp.",
    lang: "nb",
    start_url: "/start",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["productivity", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
