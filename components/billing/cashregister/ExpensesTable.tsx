"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Expense } from "./types";

export default function ExpensesTable() {
  const [items, setItems] = useState<Expense[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cash_register_expenses_v1") : null;
      if (raw) return JSON.parse(raw) as Expense[];
    } catch (e) {
      console.warn(e);
    }
    return [];
  });
  const toast = useToast();

  const remove = (id: string) => {
    if (!confirm("Eliminar gasto?")) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    try { localStorage.setItem("cash_register_expenses_v1", JSON.stringify(next)); } catch {}
    toast.push({ title: "Gasto eliminado", kind: "info" });
  };

  return (
    <div className="w-full basis-full flex-shrink-0">
      <h4 className="text-sm font-medium">Gastos recientes</h4>
      <div className="mt-2 w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => (
            <TableRow key={i.id}>
              <TableCell>{new Date(i.date).toISOString().replace('T', ' ').slice(0, 19)}</TableCell>
              <TableCell>{i.description}</TableCell>
              <TableCell>{Number(i.amount).toFixed(2)} €</TableCell>
              <TableCell>{i.note ?? "—"}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => remove(i.id)}>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="p-4 text-center text-sm text-muted-foreground">No hay gastos.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
