/**
 * components/plicometria/dashboard.tsx
 *
 * Panel principal para gestionar registros de plicometría en la sesión.
 * - Muestra `PlicometriaForm` para crear un nuevo registro y `PlicometriaTable`
 *   para visualizar el historial de registros de la sesión (estado local,
 *   sin persistencia automática).
 * - Proporciona controles de navegación (Calendario, Clientes, Vistas)
 *   y una acción para limpiar los registros de la sesión.
 *
 * Este es un componente del lado cliente (`"use client"`) ya que usa hooks
 * y la navegación del cliente (`useRouter`).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlicometriaForm } from "./form";
import { PlicometriaTable } from "./table";

export type PlicometriaRegistro = {
  id: number;
  pacienteNombre: string;
  pacienteApellido: string;
  fecha: string;
  triceps: number | null;
  subescapular: number | null;
  suprailiaco: number | null;
  abdominal: number | null;
  muslo: number | null;
  porcentajeGrasaEstimado: number | null;
  porcentajeAgua?: number | null;
  porcentajeHueso?: number | null;
  porcentajeGrasa?: number | null;
  porcentajeMusculo?: number | null;
  caloriasMantenimiento?: number | null;
};

export function PlicometriaDashboard() {
  const [registros, setRegistros] = useState<PlicometriaRegistro[]>([]);
  const router = useRouter();

  const handleAddRegistro = (nuevo: Omit<PlicometriaRegistro, "id">) => {
    setRegistros((prev) => [
      ...prev,
      {
        ...nuevo,
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
      },
    ]);
  };

  const handleReset = () => {
    setRegistros([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-md sm:max-w-5xl space-y-6 p-4 sm:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Plicometría de Pacientes
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra pliegues cutáneos y obtén una estimación rápida del porcentaje de grasa.
            </p>
          </div>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
            <Button className="w-full sm:w-auto" onClick={() => router.push('/listoffoods')}>Lista de alimentos</Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/')}>Vistas</Button>
          </div>
        </header>

        <Separator />

        <div className="grid gap-6 md:grid-cols-[1.2fr,1.5fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Nuevo registro de plicometría</CardTitle>
            </CardHeader>
            <CardContent>
              <PlicometriaForm onSubmitRegistro={handleAddRegistro} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Historial en esta sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <PlicometriaTable registros={registros} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
