"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Service = {
  id: string;
  name: string;
  durationMinutes?: number;
  price?: number;
  description?: string;
};

type Mapping = {
  professionalId: string;
  serviceIds: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  professionalId?: string | null;
  onChange?: (serviceIds: string[]) => void;
};

const SERVICES_KEY = "plicometria_services_v1";
const MAPPING_KEY = "plicometria_professional_services_v1";

export default function ServicesSelectModal({ open, onClose, professionalId, onChange }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(SERVICES_KEY);
      const rawMap = localStorage.getItem(MAPPING_KEY);
      const svc = raw ? (JSON.parse(raw) as Service[]) : [];
      setServices(svc);

      const map = rawMap ? (JSON.parse(rawMap) as Mapping[]) : [];
      const existing = professionalId ? map.find((m) => String(m.professionalId) === String(professionalId)) : undefined;
      const ids = existing ? existing.serviceIds || [] : [];
      const sel: Record<string, boolean> = {};
      for (const s of svc) sel[s.id] = ids.includes(s.id);
      setSelected(sel);
    } catch (e) {
      console.warn("Failed to load services mapping", e);
      setServices([]);
      setSelected({});
    }
  }, [open, professionalId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
  }, [services, query]);

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    if (!professionalId) return alert("Falta professionalId");
    try {
      const rawMap = localStorage.getItem(MAPPING_KEY);
      const map = rawMap ? (JSON.parse(rawMap) as Mapping[]) : [];
      const serviceIds = Object.keys(selected).filter((k) => selected[k]);
      const nextMap = map.filter((m) => String(m.professionalId) !== String(professionalId));
      nextMap.push({ professionalId: String(professionalId), serviceIds });
      localStorage.setItem(MAPPING_KEY, JSON.stringify(nextMap));
      onChange?.(serviceIds);
      onClose();
    } catch (e) {
      console.warn("Failed to save mapping", e);
      alert("No se pudo guardar");
    }
  };

  const handleSelectAll = () => {
    const sel: Record<string, boolean> = {};
    for (const s of services) sel[s.id] = true;
    setSelected(sel);
  };

  const handleClearAll = () => {
    const sel: Record<string, boolean> = {};
    for (const s of services) sel[s.id] = false;
    setSelected(sel);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Servicios ofrecidos</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        <div className="mb-3">
          <Input placeholder="Buscar servicios..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="mb-3 flex gap-2">
          <Button variant="outline" onClick={handleSelectAll}>Seleccionar todo</Button>
          <Button variant="ghost" onClick={handleClearAll}>Limpiar</Button>
        </div>

        <div className="max-h-72 overflow-y-auto border rounded p-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay servicios.</div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((s) => (
                <li key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={!!selected[s.id]} onChange={() => toggle(s.id)} />
                    <div className="text-sm">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.durationMinutes ? `${s.durationMinutes} min` : ""} {s.price ? `• $${s.price}` : ""}</div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
