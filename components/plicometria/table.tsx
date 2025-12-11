/**
 * components/plicometria/table.tsx
 *
 * Componente cliente que renderiza una tabla con los registros de
 * plicometría generados en la sesión. Muestra el nombre del paciente,
 * la fecha, la suma de pliegues (mm) y una estimación rápida del
 * porcentaje de grasa cuando esté disponible.
 *
 * Detalles:
 * - Recibe `registros` como prop (array de `PlicometriaRegistro`).
 * - Si no hay registros muestra un mensaje informativo.
 * - Calcula la suma de pliegues ignorando valores `null` y muestra
 *   guiones cuando no hay datos disponibles.
 *
 * Nota: es un componente del lado cliente (`"use client"`) porque usa
 * hooks/estado del navegador en el flujo de la UI (aunque aquí no
 * mantiene estado propio, forma parte del flujo cliente de la app).
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlicometriaRegistro } from "./dashboard";

type Props = {
  registros: PlicometriaRegistro[];
};

export function PlicometriaTable({ registros }: Props) {
  if (!registros.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay registros en esta sesión. Añade el primero con el formulario de la izquierda.
      </p>
    );
  }

  return (
    <div className="max-h-[420px] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Σ pliegues (mm)</TableHead>
            <TableHead className="text-right">% grasa (est.)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.map((r) => {
            const pliegues = [
              r.triceps,
              r.subescapular,
              r.suprailiaco,
              r.abdominal,
              r.muslo,
            ].filter((v): v is number => v !== null);

            const suma = pliegues.reduce((acc, v) => acc + v, 0);

            return (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {r.pacienteNombre} {r.pacienteApellido}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{r.fecha}</TableCell>
                <TableCell className="text-right">
                  {pliegues.length ? suma : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {r.porcentajeGrasaEstimado !== null
                    ? `${r.porcentajeGrasaEstimado}%`
                    : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
