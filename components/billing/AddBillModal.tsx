"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Client = {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
};

export type Bill = {
  id: string;
  numero: string;
  fecha: string; // YYYY-MM-DD
  clientId?: string;
  clientName?: string;
  descripcion?: string;
  base: number;
  ivaPercent?: number;
  irpfPercent?: number;
  otrosPercent?: number;
  total: number;
  estado?: "pendiente" | "pagada" | "anulada";
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Bill> | null;
  onSave: (b: Bill | Omit<Bill, "id">) => void;
  onDelete?: (id: string) => void;
};

function parseNum(v: string) {
  const n = Number(String(v || "").replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function AddBillModal({ open, onClose, initial = null, onSave, onDelete }: Props) {
  const CLIENTS_KEY = "plicometria_clients_v1";
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(CLIENTS_KEY) : null;
      if (raw) return JSON.parse(raw) as Client[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [clientQuery, setClientQuery] = useState("");

  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [base, setBase] = useState("");
  const [iva, setIva] = useState("");
  const [irpf, setIrpf] = useState("");
  const [otros, setOtros] = useState("");
  const [estado, setEstado] = useState<Bill["estado"]>("pendiente");

  // clients loaded lazily from localStorage above; keep state in sync when modal opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(CLIENTS_KEY);
        if (raw) setClients(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // initialize input state when modal opens; run async to avoid synchronous setState-in-effect warnings
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setNumero(initial?.numero ?? `F-${Date.now().toString(36).toUpperCase().slice(-6)}`);
      setFecha(initial?.fecha ?? new Date().toISOString().slice(0, 10));
      setClientId(initial?.clientId ?? initial?.clientId);
      setClientName(initial?.clientName ?? "");
      setDescripcion(initial?.descripcion ?? "");
      setBase(initial?.base != null ? String(initial.base) : "");
      setIva(initial?.ivaPercent != null ? String(initial.ivaPercent) : "21");
      setIrpf(initial?.irpfPercent != null ? String(initial.irpfPercent) : "0");
      setOtros(initial?.otrosPercent != null ? String(initial.otrosPercent) : "0");
      setEstado((initial?.estado as Bill["estado"]) ?? "pendiente");
    }, 0);
    return () => clearTimeout(t);
  }, [open, initial]);

  if (!open) return null;

  const filteredClients = clients.filter((c) => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.apellido ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  const b = parseNum(base);
  const ivaAmt = (b * parseNum(iva)) / 100;
  const irpfAmt = (b * parseNum(irpf)) / 100;
  const otrosAmt = (b * parseNum(otros)) / 100;
  const total = b + ivaAmt - irpfAmt + otrosAmt;

  const handleSave = () => {
    if (!numero.trim()) return alert("Número requerido");
    if (!fecha) return alert("Fecha requerida");
    if (!clientName && !clientId) return alert("Selecciona un cliente o añade el nombre");

    const payload: any = {
      numero: numero.trim(),
      fecha,
      clientId,
      clientName: clientName || undefined,
      descripcion: descripcion || undefined,
      base: b,
      ivaPercent: parseNum(iva) || undefined,
      irpfPercent: parseNum(irpf) || undefined,
      otrosPercent: parseNum(otros) || undefined,
      total,
      estado,
    };
    if (initial && (initial as any).id) payload.id = (initial as any).id;
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{initial ? "Editar factura" : "Nueva factura"}</h3>

        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="num">Número</Label>
            <Input id="num" value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          <div>
            <Label>Cliente (buscar)</Label>
            <Input placeholder="Buscar cliente..." value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} />
            <div className="max-h-40 overflow-auto rounded border px-2 py-1 mt-2">
              {filteredClients.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">No hay clientes.</div>
              ) : (
                filteredClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium">{c.nombre} {c.apellido ?? ""}</div>
                      <div className="text-xs text-muted-foreground">{c.email ?? ""}</div>
                    </div>
                    <div>
                      <button type="button" className="px-2 py-1 rounded bg-accent/10" onClick={() => { setClientId(c.id); setClientName(`${c.nombre} ${c.apellido ?? ""}`.trim()); }}>
                        Seleccionar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="clientName">Nombre cliente (opcional)</Label>
            <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" />
          </div>

          <div>
            <Label htmlFor="desc">Descripción</Label>
            <Input id="desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="base">Base</Label>
              <Input id="base" value={base} onChange={(e) => setBase(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="iva">IVA %</Label>
              <Input id="iva" value={iva} onChange={(e) => setIva(e.target.value)} placeholder="21" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="irpf">IRPF %</Label>
              <Input id="irpf" value={irpf} onChange={(e) => setIrpf(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label htmlFor="otros">Otros %</Label>
              <Input id="otros" value={otros} onChange={(e) => setOtros(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="rounded border p-3 text-sm bg-gray-50">
            <div>Base: {b.toFixed(2)}</div>
            <div>IVA: {ivaAmt.toFixed(2)}</div>
            <div>IRPF: {irpfAmt.toFixed(2)}</div>
            <div>Otros: {otrosAmt.toFixed(2)}</div>
            <div className="font-medium">Total: {total.toFixed(2)}</div>
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <select id="estado" className="w-full rounded border px-2 py-1" value={estado} onChange={(e) => setEstado(e.target.value as any)}>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <div>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          </div>
          <div className="flex items-center gap-2">
            {initial && onDelete ? (
              <Button variant="destructive" onClick={() => { if ((initial as any).id) { void (onDelete as (id: string) => void)((initial as any).id); onClose(); } }} type="button">Eliminar</Button>
            ) : null}
            <Button onClick={handleSave} type="button">{initial ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
