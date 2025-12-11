"use client";

import { useEffect } from "react";

export default function RegisterPWA() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered:", reg);
        })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
    }

    const beforeInstallHandler = (e: any) => {
      // Save the event for triggering the install prompt later if desired
      (window as any).deferredPWAInstall = e;
      console.log("beforeinstallprompt captured");
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
    };
  }, []);

  return null;
}
