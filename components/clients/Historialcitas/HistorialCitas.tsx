"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Appointment = {
  id: string;
  clientId?: string;
  clienteNombre?: string;
  profesionalId?: string;
  servicioId?: string;
  fecha?: string; // ISO date or yyyy-mm-dd
  horaInicio?: string; // HH:MM
  horaFin?: string; // HH:MM
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  clientId?: string | null;
};

const STORAGE_KEY = "plicometria_appointments_v1";

export default function HistorialCitas({ open, onClose, clientId }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return [];
      return JSON.parse(raw) as Appointment[];
    } catch (e) {
      return [];
    }
  });

  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    if (!clientId) return appointments;
    return appointments.filter((a) => String(a.clientId) === String(clientId));
  }, [appointments, clientId]);

  const { past, future } = useMemo(() => {
    const p: Appointment[] = [];
    const f: Appointment[] = [];
    for (const a of filtered) {
      // build a comparable date-time if possible
      let dt: Date | null = null;
      try {
        if (a.fecha) {
          // combine fecha and horaInicio if provided
          const time = a.horaInicio ? `T${a.horaInicio}` : "T00:00";
          dt = new Date(a.fecha + time);
        }
      } catch (e) {
        dt = null;
      }
      if (!dt) {
        // if no fecha, treat as past (safe fallback)
        p.push(a);
      } else if (dt < now) {
        p.push(a);
      } else {
        f.push(a);
      }
    }
    // sort by date desc for past, asc for future
    p.sort((x, y) => {
      const dx = x.fecha ? new Date(x.fecha + (x.horaInicio ? `T${x.horaInicio}` : "T00:00")).getTime() : 0;
      const dy = y.fecha ? new Date(y.fecha + (y.horaInicio ? `T${y.horaInicio}` : "T00:00")).getTime() : 0;
      return dy - dx;
    });
    f.sort((x, y) => {
      const dx = x.fecha ? new Date(x.fecha + (x.horaInicio ? `T${x.horaInicio}` : "T00:00")).getTime() : 0;
      const dy = y.fecha ? new Date(y.fecha + (y.horaInicio ? `T${y.horaInicio}` : "T00:00")).getTime() : 0;
      return dx - dy;
    });
    return { past: p, future: f };
  }, [filtered, now]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Historial de citas</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        <div className="space-y-4">
          <section>
            <h4 className="font-semibold mb-2">Próximas citas ({future.length})</h4>
            {future.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay próximas citas.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora inicio</TableHead>
                    <TableHead>Hora fin</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {future.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.fecha ?? "—"}</TableCell>
                      <TableCell>{a.horaInicio ?? "—"}</TableCell>
                      <TableCell>{a.horaFin ?? "—"}</TableCell>
                      <TableCell>{a.profesionalId ?? "—"}</TableCell>
                      <TableCell>{a.servicioId ?? "—"}</TableCell>
                      <TableCell>{a.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section>
            <h4 className="font-semibold mb-2">Citas pasadas ({past.length})</h4>
            {past.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay citas pasadas.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora inicio</TableHead>
                    <TableHead>Hora fin</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {past.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.fecha ?? "—"}</TableCell>
                      <TableCell>{a.horaInicio ?? "—"}</TableCell>
                      <TableCell>{a.horaFin ?? "—"}</TableCell>
                      <TableCell>{a.profesionalId ?? "—"}</TableCell>
                      <TableCell>{a.servicioId ?? "—"}</TableCell>
                      <TableCell>{a.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
