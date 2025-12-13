"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Payment } from "./types";

export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cash_register_payments_v1") : null;
      if (raw) return JSON.parse(raw) as Payment[];
    } catch (e) {
      console.warn(e);
    }
    return [];
  });
  const toast = useToast();

  const remove = (id: string) => {
    if (!confirm("Eliminar pago?")) return;
    const next = payments.filter((p) => p.id !== id);
    setPayments(next);
    try { localStorage.setItem("cash_register_payments_v1", JSON.stringify(next)); } catch {}
    toast.push({ title: "Pago eliminado", kind: "info" });
  };

  return (
    <div className="w-full basis-full flex-shrink-0">
      <h4 className="text-sm font-medium">Pagos recientes</h4>
      <div className="mt-2 w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{new Date(p.date).toISOString().replace('T', ' ').slice(0, 19)}</TableCell>
              <TableCell>{p.client ?? "—"}</TableCell>
              <TableCell>{Number(p.amount).toFixed(2)} €</TableCell>
              <TableCell>{p.method}</TableCell>
              <TableCell>{p.note ?? "—"}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="p-4 text-center text-sm text-muted-foreground">No hay pagos.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
