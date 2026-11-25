"use client";

import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

/** Etikett + felt + valgfri hjelpetekst, med lik avstand overalt. */
export function Field({
  label,
  htmlFor,
  hint,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">{t.common.optional}</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Felles størrelse for felt som skal være lette å treffe på mobil. */
export const bigInput = "h-11 text-base";
