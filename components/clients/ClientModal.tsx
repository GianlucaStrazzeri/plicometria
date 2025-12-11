/**
 * components/clients/ClientModal.tsx
 *
 * Modal cliente controlado para crear, editar y eliminar clientes desde la
 * interfaz. Proporciona un formulario con los campos básicos de un cliente
 * (nombre, apellido, email, teléfono y notas) y callbacks para guardar o
 * eliminar el registro.
 *
 * Props principales:
 * - `open`: controla si el modal está visible.
 * - `onClose`: cierra el modal.
 * - `initial`: valores iniciales para editar un cliente (opcional).
 * - `onSave`: callback llamado con el objeto cliente al crear/guardar.
 * - `onDelete`: callback opcional llamado con el `id` para eliminar.
 *
 * Nota: es un componente del lado cliente (`"use client"`) porque usa
 * hooks (`useState`, `useEffect`) y maneja interacción del usuario.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Client = {
  id: string;
  nombre: string;
  apellido: string;
  // Extended optional fields kept here so all client components share the shape
  nif?: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  notasMedicas?: string;
  tipoCliente?: string;
  avatarUrl?: string;
  clinicalHistory?: {
    motivo?: string;
    desdeCuando?: string;
    descripcion?: string;
    inicioEvolucion?: string;
    impacto?: string;
    factoresAgravantes?: string;
    factoresAtenuantes?: string;
    intensidad?: string;
    frecuencia?: string;
    localizacion?: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Client> | null;
  onSave: (client: Omit<Client, "id"> | Client) => void;
  onDelete?: (id: string) => void;
};

export default function ClientModal({ open, onClose, initial = null, onSave, onDelete }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(initial?.nombre ?? "");
    setApellido(initial?.apellido ?? "");
    setEmail(initial?.email ?? "");
    setTelefono(initial?.telefono ?? "");
    setNotas(initial?.notas ?? "");
  }, [open, initial]);

  if (!open) return null;

  const isEditing = Boolean(initial && (initial as any).id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{isEditing ? "Editar cliente" : "Nuevo cliente"}</h3>

        <div className="mt-4 grid gap-3">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <input
              id="notas"
              className="w-full rounded border px-2 py-1"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <div>
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => {
                  if (initial && (initial as any).id) {
                    void (onDelete as (id: string) => void)((initial as any).id);
                    onClose();
                  }
                }}
                type="button"
              >
                Eliminar
              </Button>
            ) : null}

            <Button
              onClick={() => {
                const payload: any = {
                  nombre: nombre.trim(),
                  apellido: apellido.trim(),
                  email: email.trim() || undefined,
                  telefono: telefono.trim() || undefined,
                  notas: notas.trim() || undefined,
                };
                if (isEditing && initial && (initial as any).id) payload.id = (initial as any).id;
                onSave(payload);
                onClose();
              }}
              type="button"
            >
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Client };
