"use client";

import { useEffect } from "react";

export default function RegisterPWA() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isProduction = process.env.NODE_ENV === "production";

    if (!("serviceWorker" in navigator)) return;

    if (isProduction) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered:", reg);
        })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
    } else {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => {
          r.unregister().then((ok) => {
            if (ok) console.log("Unregistered service worker:", r.scope);
          });
        });
      });

      if (typeof caches !== "undefined") {
        caches.keys().then((keys) =>
          Promise.all(keys.map((k) => caches.delete(k))).then(() =>
            console.log("Cleared all caches")
          )
        );
      }
    }

    const beforeInstallHandler = (e: any) => {
      (window as any).deferredPWAInstall = e;
      console.log("beforeinstallprompt captured");
    };

    window.addEventListener(
      "beforeinstallprompt",
      beforeInstallHandler as EventListener
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstallHandler as EventListener
      );
    };
  }, []);

  return null;
}
