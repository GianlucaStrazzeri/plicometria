/**
 * components/calendar/CalendarDashboard.tsx
 *
 * Componente cliente que muestra un panel de calendario de citas.
 * - Renderiza un calendario (FullCalendar) con vistas Día/Semana/Mes.
 * - Recupera eventos desde la API `/api/appointments` y los mapea
 *   al tipo interno `CalendarEvent` usado por la UI.
 * - Proporciona filtros por profesional, estado y búsqueda, y controles
 *   para cambiar la vista del calendario y restablecer filtros.
 * - Utiliza componentes reutilizables del proyecto (Card, Button, Select,
 *   Table, etc.).
 *
 * Nota: es un componente del lado cliente (`use client`) porque usa hooks
 * y realiza fetch en el navegador.
 */

"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import NewAppointmentModal from "./NewAppointmentModal";

// Tipos de cita (luego esto lo podemos alinear con tu hoja "Citas")
export type CalendarEventStatus = "pendiente" | "confirmada" | "realizada" | "cancelada";

export type CalendarEvent = {
  id: number;
  fecha: string; // "2025-12-08"
  horaInicio: string; // "10:30"
  horaFin: string; // "11:15"
  paciente: string;
  profesional: string; // email o nombre
  tipo: string; // Ej: "Fisioterapia a domicilio"
  estado: CalendarEventStatus;
  nota?: string;
};

// Eventos se cargan desde la API `/api/appointments` en vez de usar mocks.

export function CalendarDashboard() {
  const [apptOpen, setApptOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<CalendarEventStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Cargamos eventos desde la API de appointments (server-side)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const APPTS_STORAGE = "plicometria_appointments_v1";
  const BILLS_STORAGE = "plicometria_bills_v1";
  const SERVICES_STORAGE = "plicometria_services_v1";
  const isEventsMounted = useRef(false);

  // Load events from localStorage, fallback to server API
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    try {
      const raw = localStorage.getItem(APPTS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as CalendarEvent[];
        if (mounted) setEvents(parsed);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to read appointments from storage', e);
    }

    // fallback to API
    fetch('/api/appointments')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch appointments');
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const data = json.data || [];
        const mapped: CalendarEvent[] = data.map((a: any, idx: number) => {
          const start = new Date(a.start);
          const end = new Date(a.end);
          const fecha = start.toISOString().slice(0, 10); // YYYY-MM-DD
          const horaInicio = start.toTimeString().slice(0,5);
          const horaFin = end.toTimeString().slice(0,5);
          return {
            id: idx + 1,
            fecha,
            horaInicio,
            horaFin,
            paciente: a.patientName ?? a.title ?? 'Paciente',
            profesional: a.professionalEmail ?? 'unknown',
            tipo: a.sessionType ?? a.title ?? '',
            estado: (a.status || 'pendiente').toLowerCase() as CalendarEventStatus,
            nota: a.notes ?? a.diagnosis ?? '',
          };
        });
        setEvents(mapped);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching appointments', err);
        if (mounted) setError(String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  // persist events to localStorage when they change (skip initial load)
  useEffect(() => {
    if (!isEventsMounted.current) {
      isEventsMounted.current = true;
      return;
    }
    try {
      localStorage.setItem(APPTS_STORAGE, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save appointments', e);
    }
  }, [events]);

  const professionals = useMemo(() => {
    const set = new Set(events.map((e) => e.profesional));
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedProfessional !== "todos" && event.profesional !== selectedProfessional) {
        return false;
      }
      if (selectedStatus !== "todos" && event.estado !== selectedStatus) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          event.paciente.toLowerCase().includes(q) ||
          event.tipo.toLowerCase().includes(q) ||
          event.profesional.toLowerCase().includes(q) ||
          event.nota?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [events, selectedProfessional, selectedStatus, search]);

  // Map internal events to FullCalendar event objects
  const fcEvents = useMemo(() => {
    return filteredEvents.map((e) => ({
      id: String(e.id),
      title: `${e.paciente} — ${e.tipo}`,
      start: `${e.fecha}T${e.horaInicio}`,
      end: `${e.fecha}T${e.horaFin}`,
      extendedProps: {
        profesional: e.profesional,
        estado: e.estado,
        nota: e.nota,
      },
    }));
  }, [filteredEvents]);

  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetFilters = () => {
    setSelectedProfessional("todos");
    setSelectedStatus("todos");
    setSearch("");
  };

  if (!mounted) {
    // Avoid rendering browser-only widgets during SSR/hydration mismatch
    return <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6" />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Calendario de citas
            </h1>
            <p className="text-sm text-muted-foreground">
              Vista tipo agenda para tus sesiones de fisioterapia a domicilio.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <Button onClick={() => router.push('/')} className="w-full md:w-auto mt-2 md:mt-0">
              Home
            </Button>

            <Button onClick={() => setApptOpen(true)} className="w-full md:w-auto mt-2 md:mt-0">
              Nueva cita
            </Button>

            <Button variant="outline" onClick={() => router.push('/')} className="w-full md:w-auto mt-2 md:mt-0">
              Vistas
            </Button>

            <Button variant="outline" onClick={handleResetFilters} className="w-full md:w-auto mt-2 md:mt-0">
              Restablecer filtros
            </Button>

            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters((s) => !s)} className="w-full md:w-auto mt-2 md:mt-0">
              Filtros
            </Button>
          </div>
        </header>

        {/* New appointment modal */}
        {typeof window !== "undefined" ? (
          // Lazy import to avoid SSR issues — import component dynamically via client
          // but we can render it directly since this is a client component file.
          <React.Suspense fallback={null}>
            {/* Import locally */}
            <NewAppointmentModal
              open={apptOpen}
              onClose={() => setApptOpen(false)}
              onCreate={(data) => {
                // assign an id safely (max id + 1)
                const nextId = events.length === 0 ? 1 : Math.max(...events.map((e) => e.id)) + 1;
                const newEvent: CalendarEvent = { id: nextId, ...data } as CalendarEvent;
                setEvents((prev) => [newEvent, ...prev]);
                // create a bill automatically
                try {
                  // load services to calculate price
                  const rawS = localStorage.getItem(SERVICES_STORAGE);
                  const services = rawS ? JSON.parse(rawS) : [];
                  const svc = (data as any).servicioId ? services.find((s: any) => s.id === (data as any).servicioId) : null;
                  const base = svc ? Number(svc.price) || 0 : 0;
                  const ivaPercent = svc?.ivaPercent != null ? Number(svc.ivaPercent) : undefined;
                  const irpfPercent = svc?.irpfPercent != null ? Number(svc.irpfPercent) : undefined;
                  const otrosPercent = svc?.otherTaxesPercent != null ? Number(svc.otherTaxesPercent) : undefined;
                  const ivaAmt = (base * (ivaPercent || 0)) / 100;
                  const irpfAmt = (base * (irpfPercent || 0)) / 100;
                  const otrosAmt = (base * (otrosPercent || 0)) / 100;
                  const total = base + ivaAmt - irpfAmt + otrosAmt;

                  const rawB = localStorage.getItem(BILLS_STORAGE);
                  const bills = rawB ? JSON.parse(rawB) : [];
                  const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
                  const newBill = {
                    id: makeId(),
                    numero: `F-${Date.now().toString(36).toUpperCase().slice(-6)}`,
                    fecha: data.fecha,
                    clientId: undefined,
                    clientName: data.paciente,
                    descripcion: svc ? svc.name : data.tipo || 'Cita',
                    base,
                    ivaPercent,
                    irpfPercent,
                    otrosPercent,
                    total,
                    estado: 'pendiente',
                  };
                  bills.unshift(newBill);
                  localStorage.setItem(BILLS_STORAGE, JSON.stringify(bills));
                } catch (err) {
                  console.warn('Failed to create bill for appointment', err);
                }

                setApptOpen(false);
              }}
            />
          </React.Suspense>
        ) : null}

        <Separator />

        {/* Filtros (oculto por defecto, toggle desde botón) */}
        {showFilters ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1.1fr,1.1fr,1.4fr]">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Profesional</span>
                  <Select value={selectedProfessional} onValueChange={(value) => setSelectedProfessional(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {professionals.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as CalendarEventStatus | "todos")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Búsqueda</span>
                  <Input placeholder="Paciente, tipo de sesión, nota..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Calendario (FullCalendar) */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Calendario</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('timeGridDay');
                    calendarRef.current?.getApi().changeView('timeGridDay');
                  }}
                >
                  Día
                </Button>
                <Button
                  variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('timeGridWeek');
                    calendarRef.current?.getApi().changeView('timeGridWeek');
                  }}
                >
                  Semana
                </Button>
                <Button
                  variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('dayGridMonth');
                    calendarRef.current?.getApi().changeView('dayGridMonth');
                  }}
                >
                  Mes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {fcEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay citas que coincidan con los filtros actuales.</p>
            ) : (
              <div>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={currentView}
                  headerToolbar={false}
                  events={fcEvents}
                  height={600}
                  allDaySlot={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function EstadoPill({ estado }: { estado: CalendarEventStatus }) {
  const labelMap: Record<CalendarEventStatus, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    realizada: "Realizada",
    cancelada: "Cancelada",
  };

  const colorMap: Record<CalendarEventStatus, string> = {
    pendiente: "bg-amber-100 text-amber-800 border-amber-200",
    confirmada: "bg-emerald-100 text-emerald-800 border-emerald-200",
    realizada: "bg-sky-100 text-sky-800 border-sky-200",
    cancelada: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${colorMap[estado]}`}
    >
      {labelMap[estado]}
    </span>
  );
}
