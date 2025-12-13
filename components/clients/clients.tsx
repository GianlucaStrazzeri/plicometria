/**
 * components/clients/clients.tsx
 *
 * Componente cliente que renderiza una tabla de clientes con búsqueda,
 * persistencia local y CRUD básico mediante el modal `ClientModal`.
 *
 * Comportamiento y responsabilidades:
 * - Carga y guarda la lista de clientes en `localStorage` bajo la clave
 *   `plicometria_clients_v1`.
 * - Permite filtrar clientes por nombre, apellido, email o teléfono.
 * - Abre `ClientModal` para crear o editar clientes y usa confirmación
 *   antes de eliminar.
 * - Está diseñado como componente cliente (`"use client"`) porque usa
 *   hooks de React y acceso al `localStorage` del navegador.
 */

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ClientModal, { type Client } from "./ClientModal";
import ClientInfoModal from "./ClientInfoModal";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const STORAGE_KEY = "plicometria_clients_v1";

export default function ClientsTable() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as Client[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoClient, setInfoClient] = useState<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(false);

  // clients are initialized from localStorage via useState lazy initializer

  useEffect(() => {
    // Avoid writing to storage on first mount — first effect loads existing data.
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.warn("Failed to save clients to storage", e);
    }
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.telefono ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, clients]);

  const handleSave = (data: any) => {
    if (data.id) {
      setClients((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      return;
    }
    const newClient: Client = { id: makeId(), nombre: data.nombre || "", apellido: data.apellido || "", email: data.email, telefono: data.telefono, notas: data.notas };
    setClients((prev) => [newClient, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar cliente? Esta acción no se puede deshacer.")) return;
    setClients((prev) => prev.filter((p) => p.id !== id));
  };

  function handleExport() {
    try {
      const data = JSON.stringify(clients, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clients.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Export failed", e);
      alert("No se pudo exportar clientes.");
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
          alert("JSON inválido: se esperaba un array de clientes.");
          return;
        }
        const valid = parsed.filter((p: any) => p && typeof p.id === "string" && typeof p.nombre === "string");
        if (valid.length === 0) {
          alert("No se han encontrado clientes válidos en el archivo.");
          return;
        }
        setClients((prev) => {
          const map = new Map(prev.map((x) => [x.id, x]));
          for (const it of valid) map.set(it.id, it);
          return Array.from(map.values());
        });
        alert(`Importados ${valid.length} clientes (se han unido por id).`);
      } catch (err) {
        console.error(err);
        alert("Error leyendo archivo: " + err);
      }
    };
    reader.readAsText(f);
    e.currentTarget.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full max-w-lg">
          <Input
            aria-label="Buscar clientes"
            placeholder="Buscar clientes por nombre, apellido, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.dispatchEvent(new Event('open-homepage'))}>
            Vistas
          </Button>

          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Importar
          </Button>

          <Button variant="outline" onClick={handleExport}>
            Exportar
          </Button>

          <Button
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
          >
            Nuevo cliente
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} aria-label="Importar clientes" title="Importar clientes" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <button
                  className="text-left w-full"
                  onClick={() => {
                    setInfoClient(c);
                    setInfoOpen(true);
                  }}
                >
                  {c.nombre}
                </button>
              </TableCell>
              <TableCell>{c.apellido}</TableCell>
              <TableCell>{c.email ?? "—"}</TableCell>
              <TableCell>{c.telefono ?? "—"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(c);
                      setOpenModal(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                No hay clientes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ClientInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        client={infoClient}
        onSave={(updated) => {
          setClients((prev) => {
            const found = prev.find((p) => p.id === updated.id);
            if (found) return prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
            return [updated, ...prev];
          });
        }}
        onDelete={(id) => handleDelete(id)}
      />

      <ClientModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSave={(d) => handleSave(d)}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
