"use client";

import React, { useEffect, useState } from "react";

type Props = {
  message?: string;
  onChange?: (consent: boolean) => void;
  localStorageKey?: string;
};

export default function ConsentPopup({
  message,
  onChange,
  localStorageKey = "marketing_consent",
}: Props) {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved === null) {
        setVisible(true);
      } else {
        setConsent(saved === "true");
      }
    } catch (err) {
      // localStorage may throw in some environments; just hide popup
      setVisible(false);
    }
  }, [localStorageKey]);

  const accept = () => {
    try {
      localStorage.setItem(localStorageKey, "true");
    } catch (e) {}
    setConsent(true);
    setVisible(false);
    onChange?.(true);
  };

  const decline = () => {
    try {
      localStorage.setItem(localStorageKey, "false");
    } catch (e) {}
    setConsent(false);
    setVisible(false);
    onChange?.(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de marketing"
      style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, maxWidth: 380 }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>Consentimiento para uso de datos</div>
        <div style={{ fontSize: 14, color: "#333" }}>
          {message ??
            "Usamos algunos datos para mejorar la experiencia y enviar información relevante. ¿Aceptas que registremos tus datos para marketing y mejoras?"}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={decline}
            style={{
              background: "transparent",
              border: "1px solid #ccc",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            style={{
              background: "#0070f3",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
