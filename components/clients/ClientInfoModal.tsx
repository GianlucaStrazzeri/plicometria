"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Client } from "./ClientModal";
import ClientHistorialClinico from "./ClientHistorialClinico";
import ClientBillsModal from "./BillingModal/ClientBillsModal";

type Props = {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (client: Client) => void;
  onDelete?: (id: string) => void;
};

export default function ClientInfoModal({ open, onClose, client = null, onSave, onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(client?.avatarUrl);
  const [nombre, setNombre] = useState(client?.nombre ?? "");
  const [apellido, setApellido] = useState(client?.apellido ?? "");
  const [nif, setNif] = useState(client?.nif ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(client?.fechaNacimiento ?? "");
  const [genero, setGenero] = useState(client?.genero ?? "");
  const [direccion, setDireccion] = useState(client?.direccion ?? "");
  const [codigoPostal, setCodigoPostal] = useState(client?.codigoPostal ?? "");
  const [ciudad, setCiudad] = useState(client?.ciudad ?? "");
  const [provincia, setProvincia] = useState(client?.provincia ?? "");
  const [pais, setPais] = useState(client?.pais ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [telefono, setTelefono] = useState(client?.telefono ?? "");
  const [notasMedicas, setNotasMedicas] = useState(client?.notasMedicas ?? "");
  const [tipoCliente, setTipoCliente] = useState(client?.tipoCliente ?? "");

  useEffect(() => {
    if (!open) return;
    setAvatarUrl(client?.avatarUrl);
    setNombre(client?.nombre ?? "");
    setApellido(client?.apellido ?? "");
    setNif(client?.nif ?? "");
    setFechaNacimiento(client?.fechaNacimiento ?? "");
    setGenero(client?.genero ?? "");
    setDireccion(client?.direccion ?? "");
    setCodigoPostal(client?.codigoPostal ?? "");
    setCiudad(client?.ciudad ?? "");
    setProvincia(client?.provincia ?? "");
    setPais(client?.pais ?? "");
    setEmail(client?.email ?? "");
    setTelefono(client?.telefono ?? "");
    setNotasMedicas(client?.notasMedicas ?? "");
    setTipoCliente(client?.tipoCliente ?? "");
    setPage(0);
  }, [open, client]);

  const [section, setSection] = useState<'datos' | 'historial'>('datos');
  const [billsOpen, setBillsOpen] = useState(false);

  if (!open) return null;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(f);
    e.currentTarget.value = "";
  }

  function saveAndClose() {
    const id = client?.id ?? `c_${Date.now()}`;
    const updated: Client = {
      id,
      nombre,
      apellido,
      nif,
      fechaNacimiento,
      genero,
      direccion,
      codigoPostal,
      ciudad,
      provincia,
      pais,
      email,
      telefono,
      notas: client?.notas ?? undefined,
      notasMedicas,
      tipoCliente,
      avatarUrl,
    } as Client;
    onSave(updated);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Información cliente</h3>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${section === 'datos' ? 'bg-primary text-white' : 'border'}`} onClick={() => setSection('datos')}>Datos</button>
              <button className={`px-3 py-1 rounded ${section === 'historial' ? 'bg-primary text-white' : 'border'}`} onClick={() => setSection('historial')}>Historial Clínico</button>
              <button className={`px-3 py-1 rounded border`} onClick={() => { setBillsOpen(true); }}>
                Facturas
              </button>
            </div>
            <div className="text-sm text-muted-foreground">Página {page + 1} de 2</div>
          </div>

          {section === 'datos' ? (
            <>
              {page === 0 ? (
                <div className="grid gap-6 md:grid-cols-2 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Label className="mb-1">Avatar</Label>
                    <div className="w-28 h-28 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm text-muted-foreground">Sin avatar</div>
                      )}
                    </div>
                    <input className="mt-2" type="file" accept="image/*" onChange={handleFile} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="block mb-1">Nombre</Label>
                      <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Apellido</Label>
                      <Input value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">NIF / CIF</Label>
                      <Input value={nif} onChange={(e) => setNif(e.target.value)} className="w-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label className="block mb-1">Fecha de Nacimiento</Label>
                      <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Género</Label>
                      <Input value={genero} onChange={(e) => setGenero(e.target.value)} className="w-full" />
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-1">Dirección</Label>
                    <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <Label className="block mb-1">Código Postal</Label>
                      <Input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Ciudad</Label>
                      <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Provincia</Label>
                      <Input value={provincia} onChange={(e) => setProvincia(e.target.value)} className="w-full" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="block mb-1">País</Label>
                      <Input value={pais} onChange={(e) => setPais(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="block mb-1">Teléfono</Label>
                      <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <Label className="block mb-1">Tipo de Cliente</Label>
                      <Input value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className="w-full" />
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label className="block mb-1">Notas Médicas</Label>
                    <textarea className="w-full rounded border px-2 py-1" value={notasMedicas} onChange={(e) => setNotasMedicas(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              {section === 'historial' ? (
                <ClientHistorialClinico
                  client={client}
                  onSavePart={(partial) => {
                    // merge partial clinical history into client and persist via onSave
                    const id = client?.id ?? `c_${Date.now()}`;
                    const updated: Client = {
                      id,
                      nombre: client?.nombre ?? "",
                      apellido: client?.apellido ?? "",
                      email: client?.email,
                      telefono: client?.telefono,
                      notas: client?.notas,
                      clinicalHistory: { ...(client?.clinicalHistory ?? {}), ...(partial as any) },
                    } as Client;
                    onSave(updated);
                  }}
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {client && onDelete ? (
              <Button variant="destructive" onClick={() => { if (client?.id) onDelete(client.id); onClose(); }}>
                Eliminar
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (page > 0 ? setPage(page - 1) : onClose())}>
              {page > 0 ? "Atrás" : "Cancelar"}
            </Button>
            {page < 1 ? (
              <Button onClick={() => setPage(page + 1)}>Siguiente</Button>
            ) : (
              <Button onClick={saveAndClose}>Guardar</Button>
            )}
          </div>
        </div>
      </div>

      <ClientBillsModal open={billsOpen} onClose={() => setBillsOpen(false)} client={client} />
    </div>
  );
}
