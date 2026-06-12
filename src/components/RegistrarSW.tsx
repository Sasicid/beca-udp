"use client";

import { useEffect } from "react";

/** Registra el service worker de la PWA (caché básico offline). */
export default function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin SW la app sigue funcionando; solo se pierde el offline.
      });
    }
  }, []);
  return null;
}
