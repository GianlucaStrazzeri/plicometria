"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Payment, PaymentMethod } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
};

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddPaymentModal({ open, onClose }: Props) {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [note, setNote] = useState("");
  const toast = useToast();

  if (!open) return null;

  const handleSave = () => {
    const n = Number(amount.toString().replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return alert("Ingrese un monto válido");

    try {
      const raw = localStorage.getItem("cash_register_payments_v1");
      const list: Payment[] = raw ? JSON.parse(raw) : [];
      const p: Payment = {
        id: makeId(),
        client: client.trim() || undefined,
        amount: n,
        method,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
      };
      list.unshift(p);
      localStorage.setItem("cash_register_payments_v1", JSON.stringify(list));
      toast.push({ title: "Pago guardado", description: `Se registró ${p.amount}`, kind: "success" });
      onClose();
    } catch (e) {
      console.warn(e);
      toast.push({ title: "Error", description: "No se pudo guardar el pago", kind: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Registrar pago</h3>

        <div className="mt-3 grid gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cliente (opcional)</label>
            <Input value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Monto</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej. 1500" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Método</label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nota</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
