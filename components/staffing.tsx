import { CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** «3 av 5» med fremdriftslinje. Grønn når oppgaven er fylt, ellers gul. */
export function StaffingBar({ taken, capacity, className }: { taken: number; capacity: number; className?: string }) {
  const full = taken >= capacity;
  const percent = capacity > 0 ? Math.min((taken / capacity) * 100, 100) : 0;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
          <Users className="size-4 text-muted-foreground" aria-hidden />
          {taken} av {capacity}
        </span>
        <StaffingBadge taken={taken} capacity={capacity} />
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={Math.min(taken, capacity)}
        aria-label={`${taken} av ${capacity} plasser fylt`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all", full ? "bg-emerald-600" : "bg-amber-500")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function StaffingBadge({ taken, capacity }: { taken: number; capacity: number }) {
  const missing = Math.max(capacity - taken, 0);
  if (missing === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
        <CheckCircle2 className="size-3.5" aria-hidden /> Fullt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
      {missing} {missing === 1 ? "ledig plass" : "ledige plasser"}
    </span>
  );
}
