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
  const FILTERS_KEY = "plicometria_calendar_filters_v1";

  const [selectedProfessional, setSelectedProfessional] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.selectedProfessional ?? "todos";
      }
    } catch (e) {
      // ignore
    }
    return "todos";
  });

  const [selectedStatus, setSelectedStatus] = useState<CalendarEventStatus | "todos">(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.selectedStatus ?? "todos";
      }
    } catch (e) {
      // ignore
    }
    return "todos";
  });
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Cargamos eventos desde la API de appointments (server-side)
  const APPTS_STORAGE = "plicometria_appointments_v1";
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(APPTS_STORAGE) : null;
      if (raw) return JSON.parse(raw) as CalendarEvent[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [loading, setLoading] = useState(events.length === 0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const BILLS_STORAGE = "plicometria_bills_v1";
  const SERVICES_STORAGE = "plicometria_services_v1";
  const isEventsMounted = useRef(false);

  // Seed demo data on first load: a professional, a client, a sample appointment and a demo chat
  useEffect(() => {
    try {
      // professionals
      const profKey = "plicometria_professionals_v1";
      const rawProf = localStorage.getItem(profKey);
      if (!rawProf) {
        const profs = [
          {
            id: "prof-1",
            nombre: "Profesional 1",
            apellido: "",
            email: "profesional1@example.com",
            telefono: "",
            especialidad: "Fisioterapia",
            notas: "Profesional de ejemplo",
          },
        ];
        localStorage.setItem(profKey, JSON.stringify(profs));
      }

      // clients
      const clientsKey = "plicometria_clients_v1";
      const rawClients = localStorage.getItem(clientsKey);
      if (!rawClients) {
        const clients = [
          {
            id: "client-1",
            nombre: "Juan",
            apellido: "Pérez",
            email: "juan.perez@example.com",
            telefono: "+34600000000",
            notas: "Cliente de ejemplo",
          },
        ];
        localStorage.setItem(clientsKey, JSON.stringify(clients));
      }

      // appointments
      const rawAppts = localStorage.getItem(APPTS_STORAGE);
      if (!rawAppts) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const fecha = `${y}-${m}-${d}`;
        const appts: CalendarEvent[] = [
          {
            id: 1,
            fecha,
            horaInicio: "10:00",
            horaFin: "11:00",
            paciente: "Juan Pérez",
            profesional: "Profesional 1",
            tipo: "Cita de ejemplo",
            estado: "pendiente",
            nota: "Primera cita de ejemplo",
          },
        ];
        localStorage.setItem(APPTS_STORAGE, JSON.stringify(appts));
        // events state is initialized from localStorage; no immediate setState here
      }

      // demo chat conversation
      const chatKey = "plicometria_chat_v1";
      const rawChat = localStorage.getItem(chatKey);
      if (!rawChat) {
        const chat = [
          { id: "sys-1", role: "system", text: "Eres un asistente que conoce la aplicación Plicometria: clientes, servicios, facturas y citas. Responde de forma concisa y útil." },
          { id: "u-1", role: "user", text: "Hola, muéstrame la cita de ejemplo." },
          { id: "a-1", role: "assistant", text: "Hay una cita de ejemplo hoy a las 10:00 para Juan Pérez con Profesional 1. ACTION_JSON: {\"action\":\"navigate\",\"path\":\"/calendar\"}" },
        ];
        localStorage.setItem(chatKey, JSON.stringify(chat));
      }
      
      // services demo
      const servicesKey = "plicometria_services_v1";
      const rawServices = localStorage.getItem(servicesKey);
      if (!rawServices) {
        const services = [
          {
            id: "svc-1",
            name: "Servicio 1",
            price: 50,
            ivaPercent: 21,
            irpfPercent: 0,
            otherTaxesPercent: 0,
            durationMinutes: 60,
            description: "Servicio de ejemplo",
          },
        ];
        localStorage.setItem(servicesKey, JSON.stringify(services));
      }

      // bills demo
      const billsKey = "plicometria_bills_v1";
      const rawBills = localStorage.getItem(billsKey);
      if (!rawBills) {
        try {
          const svcBase = 50;
          const ivaPercent = 21;
          const irpfPercent = 0;
          const otrosPercent = 0;
          const ivaAmt = (svcBase * ivaPercent) / 100;
          const irpfAmt = (svcBase * irpfPercent) / 100;
          const otrosAmt = (svcBase * otrosPercent) / 100;
          const total = svcBase + ivaAmt - irpfAmt + otrosAmt;
          const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
          const bill = {
            id: makeId(),
            numero: `F-${Date.now().toString(36).toUpperCase().slice(-6)}`,
            fecha: (new Date()).toISOString().slice(0,10),
            clientId: "client-1",
            clientName: "Juan Pérez",
            descripcion: "Servicio 1 - sesión de ejemplo",
            base: svcBase,
            ivaPercent,
            irpfPercent,
            otrosPercent,
            total,
            estado: 'pendiente',
          };
          localStorage.setItem(billsKey, JSON.stringify([bill]));
        } catch (e) {
          console.warn('Failed to seed demo bill', e);
        }
      }
    } catch (e) {
      console.warn("Failed to seed demo data", e);
    }
  }, []);

  // Load events from localStorage, fallback to server API
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    let t: number | undefined;
    try {
      const raw = localStorage.getItem(APPTS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as CalendarEvent[];
        t = window.setTimeout(() => {
          if (mounted) setEvents(parsed);
          if (mounted) setLoading(false);
        }, 0);
        return () => {
          mounted = false;
          if (t) clearTimeout(t);
        };
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

    return () => { mounted = false; if (t) clearTimeout(t); };
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
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'timeGridThreeDay'>('timeGridWeek');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetFilters = () => {
    setSelectedProfessional("todos");
    setSelectedStatus("todos");
    setSearch("");
  };

  // Persist filters so selects keep their value on mobile / after reload
  useEffect(() => {
    try {
      const payload = { selectedProfessional, selectedStatus };
      localStorage.setItem(FILTERS_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [selectedProfessional, selectedStatus]);

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
        {/* New appointment modal (render only after mounted to avoid server/client branching) */}
        {mounted && (
          <React.Suspense fallback={null}>
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
        )}

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
                  variant={currentView === 'timeGridThreeDay' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('timeGridThreeDay');
                    calendarRef.current?.getApi().changeView('timeGridThreeDay');
                  }}
                >
                  3 días
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
                  views={{
                    timeGridThreeDay: { type: 'timeGrid', duration: { days: 3 }, buttonText: '3 días' },
                  }}
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
