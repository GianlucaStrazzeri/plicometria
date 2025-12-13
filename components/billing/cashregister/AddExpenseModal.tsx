"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Expense } from "./types";

type Props = { open: boolean; onClose: () => void };

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddExpenseModal({ open, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const toast = useToast();

  if (!open) return null;

  const handleSave = () => {
    const n = Number(amount.toString().replace(",", "."));
    if (!description.trim()) return alert("Descripción requerida");
    if (!Number.isFinite(n) || n <= 0) return alert("Monto inválido");

    try {
      const raw = localStorage.getItem("cash_register_expenses_v1");
      const list: Expense[] = raw ? JSON.parse(raw) : [];
      const e: Expense = {
        id: makeId(),
        description: description.trim(),
        amount: n,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
      };
      list.unshift(e);
      localStorage.setItem("cash_register_expenses_v1", JSON.stringify(list));
      toast.push({ title: "Gasto guardado", description: `${e.description} ${e.amount}`, kind: "success" });
      onClose();
    } catch (err) {
      console.warn(err);
      toast.push({ title: "Error", description: "No se pudo guardar el gasto", kind: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Registrar gasto</h3>

        <div className="mt-3 grid gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Monto</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
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
