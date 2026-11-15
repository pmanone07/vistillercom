import { TriangleAlert } from "lucide-react";

/** Vises når miljøvariablene for Supabase mangler, i stedet for at siden krasjer. */
export function SetupNotice() {
  return (
    <div className="mx-auto my-10 flex max-w-md gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">Supabase er ikke satt opp</p>
        <p className="mt-1">
          Legg inn <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> og{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> i{" "}
          <code className="font-mono">.env.local</code>, og start på nytt. Se README.
        </p>
      </div>
    </div>
  );
}
