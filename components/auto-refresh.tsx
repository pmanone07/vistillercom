"use client";

import { useAutoRefresh } from "@/components/public/use-auto-refresh";

/** Legges i en serverside for å hente ferske tall jevnlig, uten at siden lastes på nytt. */
export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  useAutoRefresh(intervalMs, true);
  return null;
}
