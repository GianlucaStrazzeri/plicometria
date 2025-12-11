"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import AddBillModal, { type Bill } from "./AddBillModal";
import { useRouter } from 'next/navigation';

const STORAGE_KEY = "plicometria_bills_v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BillingDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const isMountedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBills(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to read bills from storage", e);
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    } catch (e) {
      console.warn("Failed to save bills to storage", e);
    }
  }, [bills]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => {
      return (
        b.numero.toLowerCase().includes(q) ||
        (b.clientName ?? "").toLowerCase().includes(q) ||
        (b.descripcion ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, bills]);

  const handleSave = (data: any) => {
    if (data.id) {
      setBills((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      return;
    }
    const newB: Bill = {
      id: makeId(),
      numero: data.numero || `F-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      fecha: data.fecha || new Date().toISOString().slice(0,10),
      clientId: data.clientId,
      clientName: data.clientName,
      descripcion: data.descripcion,
      base: Number(data.base) || 0,
      ivaPercent: data.ivaPercent != null ? Number(data.ivaPercent) : undefined,
      irpfPercent: data.irpfPercent != null ? Number(data.irpfPercent) : undefined,
      otrosPercent: data.otrosPercent != null ? Number(data.otrosPercent) : undefined,
      total: Number(data.total) || 0,
      estado: data.estado || 'pendiente',
    };
    setBills((prev) => [newB, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar factura?")) return;
    setBills((prev) => prev.filter((p) => p.id !== id));
  };

  function handleExport() {
    try {
      const data = JSON.stringify(bills, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bills.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Export failed", e);
      alert("No se pudo exportar facturas.");
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) {
          alert("JSON inválido: se esperaba un array de facturas.");
          return;
        }
        const valid = parsed.filter((p: any) => p && typeof p.id === "string" && typeof p.numero === "string");
        if (valid.length === 0) {
          alert("No se han encontrado facturas válidas en el archivo.");
          return;
        }
        setBills((prev) => {
          const map = new Map(prev.map((x) => [x.id, x]));
          for (const it of valid) map.set(it.id, it);
          return Array.from(map.values());
        });
        alert(`Importadas ${valid.length} facturas (se han unido por id).`);
      } catch (err) {
        console.error(err);
        alert("Error leyendo archivo: " + err);
      }
    };
    reader.readAsText(f);
    e.currentTarget.value = "";
  }

  return (
    <div className="space-y-4 mx-auto w-full max-w-md p-4 sm:max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-lg">
          <Input
            aria-label="Buscar facturas"
            placeholder="Buscar por número, cliente o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
          />
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Button className="w-full sm:w-auto" onClick={() => router.push('/')}>Vista</Button>
          <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setOpenModal(true); }}>Nueva factura</Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => document.getElementById("bills-import")?.click()}>Importar</Button>
          <input id="bills-import" type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          <Button className="w-full sm:w-auto" variant="outline" onClick={handleExport}>Exportar</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Base</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{b.numero}</TableCell>
              <TableCell>{b.fecha}</TableCell>
              <TableCell className="max-w-xs truncate">{b.clientName ?? b.clientId ?? '—'}</TableCell>
              <TableCell>{(Number(b.base) || 0).toFixed(2)}</TableCell>
              <TableCell>{(Number(b.total) || 0).toFixed(2)}</TableCell>
              <TableCell>{b.estado}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setOpenModal(true); }}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(b.id)}>Eliminar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="p-4 text-center text-sm text-muted-foreground">No hay facturas.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddBillModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSave={(d) => handleSave(d)}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
