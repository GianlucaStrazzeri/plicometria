/**
 * Página: /calendar
 *
 * Propósito:
 * - Proveer la página que muestra el calendario de citas de la app.
 * - Exporta `metadata` para el título y la descripción de la página.
 * - Renderiza el componente `CalendarDashboard` (cliente) que contiene
 *   la lógica de filtros y la integración con FullCalendar.
 *
 * Notas:
 * - El componente `CalendarDashboard` es un componente cliente (`use client`).
 * - Esta página sirve como punto de entrada para la ruta `/calendar`.
 */
import type { Metadata } from "next";
import { CalendarDashboard } from "@/components/calendar/CalendarDashboard";

export const metadata: Metadata = {
  title: "Calendario de citas",
  description: "Vista de agenda para las citas de fisioterapia a domicilio.",
};

export default function CalendarPage() {
  return <CalendarDashboard />;
}
