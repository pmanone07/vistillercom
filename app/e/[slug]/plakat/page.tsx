import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import QRCode from "qrcode";
import { formatEventWhen } from "@/lib/format";
import { getOrigin, getPublicEvent } from "@/lib/public-data";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Plakat", robots: { index: false, follow: false } };

// Utskriftsvennlig plakat med QR-kode, til oppslagstavla eller ranselposten.
export default function PosterPage({ params }: PageProps<"/e/[slug]/plakat">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 py-10 text-center">
      <Suspense fallback={<p className="text-muted-foreground">Lager plakat …</p>}>
        <Poster params={params} />
      </Suspense>
    </main>
  );
}

async function Poster({ params }: Pick<PageProps<"/e/[slug]/plakat">, "params">) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();

  const url = `${await getOrigin()}/e/${event.slug}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

  return (
    <>
      <PrintButton />
      <p className="text-lg font-medium text-primary">{event.organization_name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{event.title}</h1>
      <p className="mt-3 text-xl text-muted-foreground">{formatEventWhen(event.starts_at, event.ends_at)}</p>
      {event.location && <p className="text-xl text-muted-foreground">{event.location}</p>}

      <p className="mt-10 text-2xl font-semibold">Kan du hjelpe til?</p>
      <p className="mt-1 text-lg text-muted-foreground">Skann koden med mobilkameraet og velg en oppgave.</p>

      {/* SVG-en lages av QR-biblioteket på serveren fra vår egen lenke. */}
      <div
        role="img"
        aria-label="QR-kode til påmeldingen"
        className="mt-6 w-72 max-w-full [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-4 font-mono text-sm break-all text-muted-foreground">{url}</p>
    </>
  );
}
