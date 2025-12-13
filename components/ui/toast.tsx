"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: string; title?: string; description?: string; kind?: ToastKind };

const ToastContext = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null);

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = makeId();
    setToasts((s) => [{ id, ...t }, ...s]);
    // auto remove
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-50 right-4 top-4 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full rounded border p-3 shadow-sm bg-white ${t.kind === 'success' ? 'border-green-300' : t.kind === 'error' ? 'border-red-300' : 'border-slate-300'}`}>
            {t.title ? <div className="font-semibold text-sm">{t.title}</div> : null}
            {t.description ? <div className="text-sm text-muted-foreground">{t.description}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: (t: Omit<ToastItem, 'id'>) => console.warn('ToastProvider missing', t) };
  }
  return ctx;
}

export default ToastProvider;
