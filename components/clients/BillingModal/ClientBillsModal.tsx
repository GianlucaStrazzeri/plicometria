"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AddBillModal, { type Bill } from "@/components/billing/AddBillModal";
import type { Client } from "../ClientModal";

type Props = {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
};

const STORAGE_KEY = "plicometria_bills_v1";

export default function ClientBillsModal({ open, onClose, client = null }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // filter by client id or name when client provided
      const filtered = parsed.filter((b: any) => {
        if (!client) return true;
        if (client.id && b.clientId) return b.clientId === client.id;
        return (b.clientName || "").toLowerCase().includes(((client.nombre ?? "") + " " + (client.apellido ?? "")).trim().toLowerCase());
      });
      setBills(filtered);
    } catch (e) {
      console.warn("Failed to load bills", e);
      setBills([]);
    }
  }, [open, client]);

  function saveBill(payload: any) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      let updated: any[] = [];
      if (payload.id) {
        updated = parsed.map((p: any) => (p.id === payload.id ? { ...p, ...payload } : p));
      } else {
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const newB = { ...payload, id };
        updated = [newB, ...parsed];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // refresh local list filtered for this client
      const filtered = updated.filter((b: any) => {
        if (!client) return true;
        if (client.id && b.clientId) return b.clientId === client.id;
        return (b.clientName || "").toLowerCase().includes(((client.nombre ?? "") + " " + (client.apellido ?? "")).trim().toLowerCase());
      });
      setBills(filtered);
      setOpenEdit(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la factura");
    }
  }

  function deleteBill(id: string) {
    if (!confirm("Eliminar factura?")) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const updated = parsed.filter((p: any) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.warn(e);
    }
  }

  if (!open) return null;

  const clientLabel = client ? `${client.nombre ?? ""} ${client.apellido ?? ""}`.trim() : "Todos";

  const filtered = bills.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.numero || "").toLowerCase().includes(q) ||
      (b.clientName || "").toLowerCase().includes(q) ||
      (b.descripcion || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold">Facturas — {clientLabel}</h3>

        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <input className="flex-1 rounded border px-2 py-1" placeholder="Buscar factura..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button onClick={() => { setEditing(null); setOpenEdit(true); }}>Nueva</Button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay facturas.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => (
                <div key={b.id} className="rounded border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{b.numero}</div>
                      <div className="text-xs text-muted-foreground">{b.fecha} — {b.clientName ?? '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{(Number(b.total) || 0).toFixed(2)} €</div>
                      <div className="text-xs text-muted-foreground">{b.estado}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(b); setOpenEdit(true); }}>Ver / Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteBill(b.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      <AddBillModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        initial={editing ?? undefined}
        onSave={(d) => saveBill(d)}
        onDelete={(id) => { deleteBill(id); setOpenEdit(false); }}
      />
    </div>
  );
}
