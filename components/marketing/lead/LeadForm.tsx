"use client";

import { useState } from "react";
import leadStorage, { Lead } from "./leadStorage";

type Props = {
  source?: string | null;
  onClose: () => void;
};

export default function LeadForm({ source, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hasClinic, setHasClinic] = useState(false);
  const [usersCount, setUsersCount] = useState(1);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const lead: Lead = {
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      hasClinic,
      usersCount: Number(usersCount) || 0,
      source: source || "homepage",
      createdAt: new Date().toISOString(),
    };

    leadStorage.saveLead(lead);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative z-10 w-full max-w-md bg-white rounded p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Dejar mis datos</h3>
          <button type="button" className="px-2 py-1 text-sm rounded border" onClick={onClose}>Cerrar</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border rounded px-2 py-1" />
          <input required placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border rounded px-2 py-1" />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} className="border rounded px-2 py-1" />
          <input placeholder="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-2 py-1" />
        </div>

        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hasClinic} onChange={(e) => setHasClinic(e.target.checked)} />
            <span className="text-sm">Tengo una clínica</span>
          </label>

          <label className="flex items-center gap-2 ml-auto">
            <span className="text-sm">Usuarios</span>
            <input type="number" min={0} value={usersCount} onChange={(e) => setUsersCount(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 rounded border">Cancelar</button>
          <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">Enviar</button>
        </div>
      </form>
    </div>
  );
}
