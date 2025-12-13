"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  createdAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
};

export default function LeadsListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketing/leads", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data && data.ok) {
        setLeads(data.leads || []);
      } else {
        console.error("Leads fetch failed", { status: res.status, body: data });
        setError("No se pudieron cargar los leads");
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadLeads();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Leads registrados</h3>
          <div className="flex gap-2">
            <button className="rounded-md bg-slate-100 px-3 py-1 text-sm" onClick={loadLeads}>Refrescar</button>
            <button className="rounded-md bg-slate-100 px-3 py-1 text-sm" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (!leads || leads.length === 0) ? (
          <div className="text-sm text-slate-600">No hay leads todavía.</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-auto">
            {leads.map((l) => (
              <div key={l.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{l.name || l.email || "—"}</div>
                  <div className="text-xs text-slate-500">{l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{l.email}</div>
                <div className="mt-1 text-xs text-slate-600">{l.phone}</div>
                <div className="mt-1 text-xs text-slate-600">{l.company}</div>
                {l.message ? <div className="mt-2 text-sm text-slate-700">{l.message}</div> : null}
                {l.source ? <div className="mt-2 text-xs text-slate-500">Fuente: {l.source}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
