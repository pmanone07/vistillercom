"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Check, Copy, Download, Printer, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";
import { copyToClipboard, cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  slug: string;
  siteUrl: string;
}

export function ShareDialog({ open, onOpenChange, title, slug, siteUrl }: Props) {
  const t = useT().shareDialog;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{t.title}</DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>
        {open && <ShareBody title={title} slug={slug} siteUrl={siteUrl} />}
      </DialogContent>
    </Dialog>
  );
}

// Rendres bare i nettleseren (dialogen er åpen), så window er tilgjengelig.
function ShareBody({ title, slug, siteUrl }: Omit<Props, "open" | "onOpenChange">) {
  const messages = useT();
  const t = messages.shareDialog;
  const origin = typeof window === "undefined" ? siteUrl : window.location.origin;
  const url = `${origin}/e/${slug}`;
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => active && setQr(dataUrl))
      .catch(() => active && setQr(null));
    return () => {
      active = false;
    };
  }, [url]);

  async function copy() {
    if (await copyToClipboard(url)) {
      setCopied(true);
      toast.success(messages.common.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(messages.common.copyFailed);
    }
  }

  async function share() {
    try {
      await navigator.share({ title, text: t.shareText(title), url });
    } catch {
      // Brukeren lukket delingsmenyen.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={t.linkLabel}
          className="h-11 font-mono text-xs"
        />
        <Button variant="outline" onClick={copy} className="h-11 shrink-0 px-3" aria-label={t.copyLink}>
          {copied ? <Check /> : <Copy />} {messages.common.copy}
        </Button>
      </div>

      {canShare && (
        <Button onClick={share} className="h-12 w-full text-base">
          <Share2 /> {t.shareVia}
        </Button>
      )}

      <div className="rounded-xl bg-muted/60 p-4 text-center">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- lokal data-URL, ikke noe å optimalisere
          <img src={qr} alt={t.qrAlt(title)} className="mx-auto size-48 rounded-lg bg-white" />
        ) : (
          <div className="mx-auto size-48 animate-pulse rounded-lg bg-muted" />
        )}
        <p className="mt-2 text-sm text-muted-foreground">{t.qrHint}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={qr ?? undefined}
            download={`vistiller-${slug}.png`}
            aria-disabled={!qr}
            className={cn(buttonVariants({ variant: "outline" }), "h-11", !qr && "pointer-events-none opacity-50")}
          >
            <Download /> {t.download}
          </a>
          <a
            href={`/e/${slug}/plakat`}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ variant: "outline" }), "h-11")}
          >
            <Printer /> {t.poster}
          </a>
        </div>
      </div>
    </div>
  );
}
