import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import QRCode from "qrcode";
import { formatEventWhen } from "@/lib/format";
import { getMessages, type Lang } from "@/lib/i18n";
import { getChosenLang } from "@/lib/i18n-server";
import { getOrigin, getPublicEvent } from "@/lib/public-data";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Plakat / Poster", robots: { index: false, follow: false } };

// Utskriftsvennlig plakat med QR-kode, til oppslagstavla eller ranselposten.
export default function PosterPage({ params }: PageProps<"/e/[slug]/plakat">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 py-10 text-center">
      <Suspense fallback={<p className="text-muted-foreground">…</p>}>
        <Poster params={params} />
      </Suspense>
    </main>
  );
}

async function Poster({ params }: Pick<PageProps<"/e/[slug]/plakat">, "params">) {
  const { slug } = await params;
  await connection();
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  // Plakaten er for deltakerne, så den følger språket arrangementet er laget på.
  const lang: Lang = event.language ?? (await getChosenLang()) ?? "nb";
  const t = getMessages(lang).poster;

  const url = `${await getOrigin()}/e/${event.slug}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

  return (
    <div lang={lang === "en" ? "en" : undefined} className="contents">
      <PrintButton label={t.print} />
      <p className="text-lg font-medium text-primary">{event.organization_name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{event.title}</h1>
      <p className="mt-3 text-xl text-muted-foreground">{formatEventWhen(event.starts_at, event.ends_at, lang)}</p>
      {event.location && <p className="text-xl text-muted-foreground">{event.location}</p>}

      <p className="mt-10 text-2xl font-semibold">{t.canYouHelp}</p>
      <p className="mt-1 text-lg text-muted-foreground">{t.scan}</p>

      {/* SVG-en lages av QR-biblioteket på serveren fra vår egen lenke. */}
      <div
        role="img"
        aria-label={t.qrLabel}
        className="mt-6 w-72 max-w-full [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-4 font-mono text-sm break-all text-muted-foreground">{url}</p>
    </div>
  );
}
