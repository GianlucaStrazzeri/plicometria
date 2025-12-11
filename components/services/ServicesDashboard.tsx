"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
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
import AddServiceModal, { type Service } from "./AddServiceModal";

const STORAGE_KEY = "plicometria_services_v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ServicesDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const isMountedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setServices(JSON.parse(raw));
      } else {
        // seed a default standard service on first load
        const seed = [
          {
            id: "svc-1",
            name: "Servicio 1",
            description: "Servicio estándar de ejemplo",
            price: 50,
            ivaPercent: 21,
            irpfPercent: 0,
            otherTaxesPercent: 0,
            durationMinutes: 60,
            notes: "Servicio creado automáticamente para demo",
          },
        ];
        setServices(seed);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      console.warn("Failed to read services from storage", e);
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.warn("Failed to save services to storage", e);
    }
  }, [services]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        (s.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, services]);

  const handleSave = (data: any) => {
    if (data.id) {
      setServices((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      return;
    }
    const newS: Service = {
      id: makeId(),
      name: data.name || "",
      description: data.description,
      price: Number(data.price) || 0,
      ivaPercent: data.ivaPercent != null ? Number(data.ivaPercent) : undefined,
      irpfPercent: data.irpfPercent != null ? Number(data.irpfPercent) : undefined,
      otherTaxesPercent: data.otherTaxesPercent != null ? Number(data.otherTaxesPercent) : undefined,
      durationMinutes: data.durationMinutes != null ? Number(data.durationMinutes) : undefined,
      notes: data.notes,
    };
    setServices((prev) => [newS, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar servicio?")) return;
    setServices((prev) => prev.filter((p) => p.id !== id));
  };

  function handleExport() {
    try {
      const data = JSON.stringify(services, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "services.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Export failed", e);
      alert("No se pudo exportar servicios.");
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
          alert("JSON inválido: se esperaba un array de servicios.");
          return;
        }
        const valid = parsed.filter((p: any) => p && typeof p.id === "string" && typeof p.name === "string");
        if (valid.length === 0) {
          alert("No se han encontrado servicios válidos en el archivo.");
          return;
        }
        setServices((prev) => {
          const map = new Map(prev.map((x) => [x.id, x]));
          for (const it of valid) map.set(it.id, it);
          return Array.from(map.values());
        });
        alert(`Importados ${valid.length} servicios (se han unido por id).`);
      } catch (err) {
        console.error(err);
        alert("Error leyendo archivo: " + err);
      }
    };
    reader.readAsText(f);
    e.currentTarget.value = "";
  }

  const computeTotal = (s: Service) => {
    const base = Number(s.price) || 0;
    const iva = ((s.ivaPercent || 0) * base) / 100;
    const irpf = ((s.irpfPercent || 0) * base) / 100;
    const other = ((s.otherTaxesPercent || 0) * base) / 100;
    return base + iva - irpf + other;
  };

  return (
    <div className="space-y-4 mx-auto w-full max-w-md p-4 sm:max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-lg">
          <Input
            aria-label="Buscar servicios"
            placeholder="Buscar por nombre, descripción o notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
          />
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Button className="w-full sm:w-auto" onClick={() => router.push('/')}>Vista</Button>
          <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setOpenModal(true); }}>Nuevo servicio</Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => document.getElementById("svc-import")?.click()}>Importar</Button>
          <input id="svc-import" type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          <Button className="w-full sm:w-auto" variant="outline" onClick={handleExport}>Exportar</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Precio base</TableHead>
            <TableHead>Duración (min)</TableHead>
            <TableHead>IVA %</TableHead>
            <TableHead>IRPF %</TableHead>
            <TableHead>Otros %</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="max-w-xs truncate">{s.name}</TableCell>
              <TableCell>{(Number(s.price) || 0).toFixed(2)}</TableCell>
              <TableCell>{s.durationMinutes ?? "—"}</TableCell>
              <TableCell>{s.ivaPercent ?? "—"}</TableCell>
              <TableCell>{s.irpfPercent ?? "—"}</TableCell>
              <TableCell>{s.otherTaxesPercent ?? "—"}</TableCell>
              <TableCell>{computeTotal(s).toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setOpenModal(true); }}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="p-4 text-center text-sm text-muted-foreground">No hay servicios.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddServiceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSave={(d) => handleSave(d)}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
