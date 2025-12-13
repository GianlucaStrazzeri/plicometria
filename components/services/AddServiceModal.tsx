"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Service = {
  id: string;
  name: string;
  description?: string;
  price: number; // base price (without taxes)
  ivaPercent?: number; // e.g. 21
  irpfPercent?: number; // e.g. 15
  otherTaxesPercent?: number; // any other taxes as percent
  durationMinutes?: number; // duration in minutes
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Service> | null;
  onSave: (s: Service | Omit<Service, "id">) => void;
  onDelete?: (id: string) => void;
};

function parseNum(v: string) {
  const n = Number(String(v || "").replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function AddServiceModal({ open, onClose, initial = null, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [iva, setIva] = useState("");
  const [irpf, setIrpf] = useState("");
  const [other, setOther] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setPrice(initial?.price != null ? String(initial.price) : "");
      setIva(initial?.ivaPercent != null ? String(initial.ivaPercent) : "");
      setIrpf(initial?.irpfPercent != null ? String(initial.irpfPercent) : "");
      setOther(initial?.otherTaxesPercent != null ? String(initial.otherTaxesPercent) : "");
      setDuration(initial?.durationMinutes != null ? String(initial.durationMinutes) : "");
      setNotes(initial?.notes ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, [open, initial]);

  if (!open) return null;

  const isEditing = Boolean(initial && (initial as any).id);

  const base = parseNum(price);
  const ivaPct = parseNum(iva);
  const irpfPct = parseNum(irpf);
  const otherPct = parseNum(other);

  const ivaAmount = (base * ivaPct) / 100;
  const irpfAmount = (base * irpfPct) / 100;
  const otherAmount = (base * otherPct) / 100;
  const total = base + ivaAmount - irpfAmount + otherAmount;

  const handleSave = () => {
    if (!name.trim()) return alert("El nombre del servicio es obligatorio");
    const payload: any = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: base,
      ivaPercent: ivaPct || undefined,
      irpfPercent: irpfPct || undefined,
      otherTaxesPercent: otherPct || undefined,
      durationMinutes: duration ? Number(duration) : undefined,
      notes: notes.trim() || undefined,
    };
    if (isEditing && (initial as any).id) payload.id = (initial as any).id;
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{isEditing ? "Editar servicio" : "Nuevo servicio"}</h3>

        <div className="mt-4 grid gap-3">
          <div>
            <Label htmlFor="svc-name">Nombre</Label>
            <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="svc-desc">Descripción</Label>
            <Input id="svc-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="svc-price">Precio base</Label>
              <Input id="svc-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <Label htmlFor="svc-iva">IVA (%)</Label>
              <Input id="svc-iva" value={iva} onChange={(e) => setIva(e.target.value)} placeholder="21" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="svc-irpf">IRPF (%)</Label>
              <Input id="svc-irpf" value={irpf} onChange={(e) => setIrpf(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label htmlFor="svc-other">Otros impuestos (%)</Label>
              <Input id="svc-other" value={other} onChange={(e) => setOther(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div>
            <Label htmlFor="svc-duration">Duración (minutos)</Label>
            <Input id="svc-duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej. 30" />
          </div>

          <div>
            <Label htmlFor="svc-notes">Notas</Label>
            <Input id="svc-notes" className="w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="rounded border p-3 text-sm bg-gray-50">
            <div>Resumen:</div>
            <div>Base: {base.toFixed(2)}</div>
            <div>IVA: {ivaAmount.toFixed(2)}</div>
            <div>IRPF: {irpfAmount.toFixed(2)}</div>
            <div>Otros: {otherAmount.toFixed(2)}</div>
            <div className="font-medium">Total: {total.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <div>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && onDelete ? (
              <Button variant="destructive" onClick={() => { if ((initial as any).id) { void (onDelete as (id:string)=>void)((initial as any).id); onClose(); } }} type="button">Eliminar</Button>
            ) : null}

            <Button onClick={handleSave} type="button">{isEditing ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
