"use client";

import { useEffect } from "react";

/** Registrerer service workeren (bare i produksjon, så den ikke forstyrrer utvikling). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Uten service worker fungerer alt som før, bare uten frakoblet-siden.
    });
  }, []);
  return null;
}
