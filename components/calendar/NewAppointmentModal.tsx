"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ClientModal, { type Client } from "@/components/clients/ClientModal";

import type { CalendarEventStatus } from "./CalendarDashboard";
import type { CalendarEvent } from "./CalendarDashboard";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Omit<CalendarEvent, "id">) => void;
};

export default function NewAppointmentModal({ open, onClose, onCreate }: Props) {
  const CLIENTS_STORAGE = "plicometria_clients_v1";
  const SERVICES_STORAGE = "plicometria_services_v1";
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(CLIENTS_STORAGE);
      return raw ? (JSON.parse(raw) as Client[]) : [];
    } catch (e) {
      return [];
    }
  });
  const [services, setServices] = useState<any[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(SERVICES_STORAGE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientEditing, setClientEditing] = useState<Client | null>(null);
  const [tab, setTab] = useState<"buscar" | "nuevo">("buscar");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [paciente, setPaciente] = useState("");
  const [profesional, setProfesional] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState<CalendarEventStatus>("pendiente");
  const [nota, setNota] = useState("");

  useEffect(() => {
    // reset form when opened (defer state updates to avoid sync setState in effect)
    if (!open) return;
    const t = setTimeout(() => {
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setPaciente("");
      setProfesional("");
      setTipo("");
      setEstado("pendiente");
      setNota("");
      // attempt to reload persisted lists in case they changed elsewhere
      try {
        const raw = localStorage.getItem(CLIENTS_STORAGE);
        if (raw) setClients(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load clients", e);
      }
      try {
        const rawS = localStorage.getItem(SERVICES_STORAGE);
        if (rawS) setServices(JSON.parse(rawS));
      } catch (e) {
        console.warn("Failed to load services", e);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  const handleCreate = () => {
    if (!fecha || !horaInicio || !horaFin || !paciente) {
      alert("Fecha, hora inicio, hora fin y paciente son obligatorios");
      return;
    }

    const payload: Omit<CalendarEvent, "id"> = {
      fecha,
      horaInicio,
      horaFin,
      paciente: paciente.trim(),
      profesional: profesional.trim() || "unknown",
      tipo: tipo.trim() || "",
      servicioId: selectedServiceId || undefined,
      estado,
      nota: nota.trim() || undefined,
    } as any;

    onCreate(payload);
    onClose();
  };

  const computeHoraFinFrom = (start: string, minutes?: number) => {
    if (!start) return "";
    const [hh, mm] = start.split(":").map((v) => Number(v) || 0);
    const base = new Date();
    base.setHours(hh, mm, 0, 0);
    if (!minutes) return start;
    base.setMinutes(base.getMinutes() + minutes);
    const h = base.getHours().toString().padStart(2, "0");
    const m = base.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  useEffect(() => {
    // when horaInicio or selected service changes, update horaFin
    const svc = services.find((s) => s.id === selectedServiceId);
    const minutes = svc && svc.durationMinutes ? Number(svc.durationMinutes) : undefined;
    if (horaInicio && minutes) {
      const hf = computeHoraFinFrom(horaInicio, minutes);
      setHoraFin(hf);
    }
  }, [horaInicio, selectedServiceId, services]);

  const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const saveClient = (data: any) => {
    try {
      let updated: Client;
      if ((data as any).id) {
        updated = data as Client;
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        updated = { ...(data as Client), id: makeId() } as Client;
        setClients((prev) => [updated, ...prev]);
      }
      // persist
      try {
        localStorage.setItem(CLIENTS_STORAGE, JSON.stringify((clients && clients.length) ? clients.map((c)=>c.id===updated.id?updated:c) : [updated, ...clients]));
      } catch (err) {
        console.warn("Failed to save clients", err);
      }

      // select as paciente
      setPaciente(`${updated.nombre} ${updated.apellido}`.trim());
      setClientModalOpen(false);
      setClientEditing(null);
      setTab("buscar");
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el cliente");
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.telefono ?? "").toLowerCase().includes(q)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Nueva cita</h3>

        <div className="mt-4 grid gap-3">
          {/* Client search / create tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-3 py-1 rounded ${tab === 'buscar' ? 'bg-primary text-white' : 'bg-transparent border'}`}
              onClick={() => setTab('buscar')}
            >
              Buscar cliente
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${tab === 'nuevo' ? 'bg-primary text-white' : 'bg-transparent border'}`}
              onClick={() => { setTab('nuevo'); setClientEditing(null); setClientModalOpen(true); }}
            >
              Nuevo cliente
            </button>
          </div>

          {tab === 'buscar' ? (
            <div className="space-y-2">
              <Input
                aria-label="Buscar cliente"
                placeholder="Buscar cliente por nombre, apellido, email o teléfono"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
              />

              <div className="max-h-36 overflow-auto rounded border px-2 py-1">
                {filteredClients.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No hay clientes.</div>
                ) : (
                  filteredClients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 py-1">
                      <div className="text-sm">
                        <div className="font-medium">{c.nombre} {c.apellido}</div>
                        <div className="text-xs text-muted-foreground">{c.email ?? c.telefono ?? ""}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm rounded bg-accent/10"
                          onClick={() => {
                            setPaciente(`${c.nombre} ${c.apellido}`.trim());
                          }}
                        >
                          Seleccionar
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm rounded border"
                          onClick={() => { setClientEditing(c); setClientModalOpen(true); setTab('nuevo'); }}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Client modal for create/edit */}
          <ClientModal
            open={clientModalOpen}
            onClose={() => { setClientModalOpen(false); setClientEditing(null); setTab('buscar'); }}
            initial={clientEditing}
            onSave={(d) => saveClient(d)}
            onDelete={(id) => {
              if (!confirm('Eliminar cliente?')) return;
              setClients((prev) => prev.filter((c) => c.id !== id));
              try { localStorage.setItem(CLIENTS_STORAGE, JSON.stringify(clients.filter((c)=>c.id!==id))); } catch (e) {}
              setClientModalOpen(false);
            }}
          />
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="horaInicio">Hora inicio</Label>
              <Input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="horaFin">Hora fin</Label>
              <Input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="paciente">Paciente</Label>
            <Input id="paciente" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente" />
          </div>

          <div>
            <Label htmlFor="profesional">Profesional</Label>
            <Input id="profesional" value={profesional} onChange={(e) => setProfesional(e.target.value)} placeholder="Email o nombre" />
          </div>

          <div>
            <Label htmlFor="servicio">Servicio (opcional)</Label>
            <Select value={selectedServiceId ?? "__none__"} onValueChange={(v) => {
              if (v === "__none__") {
                setSelectedServiceId(null);
                return;
              }
              setSelectedServiceId(v || null);
              const svc = services.find((s) => s.id === v);
              if (svc) {
                // optionally pre-fill tipo with service name
                setTipo(svc.name || "");
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">-- Ninguno --</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{`${s.name} ${s.durationMinutes ? `(${s.durationMinutes} min)` : ""}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de sesión</Label>
            <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ej. Fisioterapia a domicilio" />
          </div>

          <div>
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as CalendarEventStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nota">Nota</Label>
            <input id="nota" className="w-full rounded border px-2 py-1" value={nota} onChange={(e) => setNota(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button onClick={handleCreate} type="button">Crear cita</Button>
        </div>
      </div>
    </div>
  );
}
