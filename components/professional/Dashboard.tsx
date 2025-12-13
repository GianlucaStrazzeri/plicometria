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
import AddProfessional, { type Professional } from "./AddProfessional";

const STORAGE_KEY = "plicometria_professionals_v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProfessionalDashboard() {
  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as Professional[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const isMountedRef = useRef(false);
  const router = useRouter();

  // professionals are initialized from localStorage via the useState lazy initializer above

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
    } catch (e) {
      console.warn("Failed to save professionals to storage", e);
    }
  }, [professionals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return professionals;
    return professionals.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.apellido ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.telefono ?? "").toLowerCase().includes(q) ||
        (p.especialidad ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, professionals]);

  const handleSave = (data: any) => {
    if (data.id) {
      setProfessionals((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      return;
    }
    const newP: Professional = { id: makeId(), nombre: data.nombre || "", apellido: data.apellido, email: data.email, telefono: data.telefono, especialidad: data.especialidad, notas: data.notas };
    setProfessionals((prev) => [newP, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar profesional?")) return;
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
  };

  function handleExport() {
    try {
      const data = JSON.stringify(professionals, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "professionals.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Export failed", e);
      alert("No se pudo exportar profesionales.");
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
          alert("JSON inválido: se esperaba un array de profesionales.");
          return;
        }
        const valid = parsed.filter((p: any) => p && typeof p.id === "string" && typeof p.nombre === "string");
        if (valid.length === 0) {
          alert("No se han encontrado profesionales válidos en el archivo.");
          return;
        }
        setProfessionals((prev) => {
          const map = new Map(prev.map((x) => [x.id, x]));
          for (const it of valid) map.set(it.id, it);
          return Array.from(map.values());
        });
        alert(`Importados ${valid.length} profesionales (se han unido por id).`);
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
            aria-label="Buscar profesionales"
            placeholder="Buscar por nombre, apellido, email, teléfono o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
          />
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Button className="w-full sm:w-auto" onClick={() => router.push('/')}>Vista</Button>
          <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setOpenModal(true); }}>Nuevo profesional</Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => document.getElementById("prof-import")?.click()}>Importar</Button>
          <input id="prof-import" type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          <Button className="w-full sm:w-auto" variant="outline" onClick={handleExport}>Exportar</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>{p.apellido ?? "—"}</TableCell>
              <TableCell>{p.email ?? "—"}</TableCell>
              <TableCell>{p.telefono ?? "—"}</TableCell>
              <TableCell>{p.especialidad ?? "—"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setOpenModal(true); }}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="p-4 text-center text-sm text-muted-foreground">No hay profesionales.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddProfessional
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSave={(d) => handleSave(d)}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
