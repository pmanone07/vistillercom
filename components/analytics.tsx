"use client";

import { Analytics as VercelAnalytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Anonym besøksstatistikk (Vercel Web Analytics, uten cookies).
// Fjerner spørrestrenger og den personlige tilgangskoden i /b/<kode> før noe sendes.
function redact(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/^\/b\/[^/]+/, "/b/[token]");
  return { ...event, url: url.toString() };
}

export function Analytics() {
  return <VercelAnalytics beforeSend={redact} />;
}
