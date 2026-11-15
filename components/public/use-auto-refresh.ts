"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Henter ferske tall med jevne mellomrom, så ledige plasser stemmer uten at man laster siden på nytt. */
export function useAutoRefresh(intervalMs: number, enabled: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs, enabled]);
}
