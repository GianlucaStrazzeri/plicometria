"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Professional = {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  notas?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Professional> | null;
  onSave: (p: Professional | Omit<Professional, "id">) => void;
  onDelete?: (id: string) => void;
};

export default function AddProfessional({ open, onClose, initial = null, onSave, onDelete }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(initial?.nombre ?? "");
    setApellido(initial?.apellido ?? "");
    setEmail(initial?.email ?? "");
    setTelefono(initial?.telefono ?? "");
    setEspecialidad(initial?.especialidad ?? "");
    setNotas(initial?.notas ?? "");
  }, [open, initial]);

  if (!open) return null;

  const isEditing = Boolean(initial && (initial as any).id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{isEditing ? "Editar profesional" : "Nuevo profesional"}</h3>

        <div className="mt-4 grid gap-3">
          <div>
            <Label htmlFor="prof-nombre">Nombre</Label>
            <Input id="prof-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="prof-apellido">Apellido</Label>
            <Input id="prof-apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="prof-email">Email</Label>
            <Input id="prof-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="prof-tel">Teléfono</Label>
            <Input id="prof-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="prof-especialidad">Especialidad</Label>
            <Input id="prof-especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej. Fisioterapia" />
          </div>

          <div>
            <Label htmlFor="prof-notas">Notas</Label>
            <input id="prof-notas" className="w-full rounded border px-2 py-1" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <div>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => {
                  if ((initial as any).id) {
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
                  apellido: apellido.trim() || undefined,
                  email: email.trim() || undefined,
                  telefono: telefono.trim() || undefined,
                  especialidad: especialidad.trim() || undefined,
                  notas: notas.trim() || undefined,
                };
                if (isEditing && (initial as any).id) payload.id = (initial as any).id;
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
