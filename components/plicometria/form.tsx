/**
 * components/plicometria/form.tsx
 *
 * Formulario cliente para registrar un nuevo `PlicometriaRegistro`.
 * - Recoge datos del paciente (nombre, apellido, fecha) y los pliegues
 *   cutáneos (tríceps, subescapular, suprailiaco, abdominal, muslo).
 * - Opcionalmente permite abrir el modal `ComposiciónCorporal` para
 *   completar porcentajes corporales y pliegues; los valores del modal
 *   pueden rellenar automáticamente los campos de pliegues del formulario.
 * - Calcula una estimación rápida y simplificada del porcentaje de grasa
 *   a partir de la suma de pliegues (placeholder que puedes reemplazar
 *   por la fórmula que prefieras) y pasa el registro al callback
 *   `onSubmitRegistro` proporcionado por el padre.
 *
 * Props:
 * - `onSubmitRegistro`: callback que recibe un registro (sin `id`) cuando
 *   el usuario guarda el formulario.
 *
 * Nota: componente cliente (`"use client"`) porque usa hooks, `localState`
 * y maneja interacción del usuario.
 */

"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlicometriaRegistro } from "./dashboard";
import ComposiciónCorporal from "./ComposiciónCorporal";
import type { Client } from "@/components/clients/ClientModal";

type Props = {
  onSubmitRegistro: (registro: Omit<PlicometriaRegistro, "id">) => void;
};

export function PlicometriaForm({ onSubmitRegistro }: Props) {
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [pacienteApellido, setPacienteApellido] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Composición corporal (opcional via modal)
  const [composicion, setComposicion] = useState<{
    porcentajeAgua?: number | null;
    porcentajeHueso?: number | null;
    porcentajeGrasa?: number | null;
    porcentajeMusculo?: number | null;
    caloriasMantenimiento?: number | null;
    triceps?: number | null;
    subescapular?: number | null;
    suprailiaco?: number | null;
    abdominal?: number | null;
    muslo?: number | null;
    bmi?: number | null;
  } | null>(null);
  const [openComposicion, setOpenComposicion] = useState(false);

  // Clientes cargados desde localStorage para búsqueda/selección
  const STORAGE_KEY = "plicometria_clients_v1";
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as Client[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [clientQuery, setClientQuery] = useState("");

  // clients are initialized lazily above; keep in sync if needed later

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return [] as Client[];
    return clients.filter((c) => {
      return (
        c.nombre.toLowerCase().includes(q) ||
        (c.apellido ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.telefono ?? "").toLowerCase().includes(q)
      );
    });
  }, [clientQuery, clients]);

  const [triceps, setTriceps] = useState("");
  const [subescapular, setSubescapular] = useState("");
  const [suprailiaco, setSuprailiaco] = useState("");
  const [abdominal, setAbdominal] = useState("");
  const [muslo, setMuslo] = useState("");

  const [porcentaje, setPorcentaje] = useState<number | null>(null);

  const parseNumberOrNull = (value: string): number | null => {
    if (!value.trim()) return null;
    const n = Number(value.replace(",", "."));
    return isNaN(n) ? null : n;
  };

  const calcularPorcentajeGrasa = () => {
    const valores = [
      parseNumberOrNull(triceps),
      parseNumberOrNull(subescapular),
      parseNumberOrNull(suprailiaco),
      parseNumberOrNull(abdominal),
      parseNumberOrNull(muslo),
    ].filter((v): v is number => v !== null);

    if (!valores.length) return null;

    const suma = valores.reduce((acc, v) => acc + v, 0);
    // ⚠️ Fórmula muy simplificada a modo de placeholder.
    // Luego la cambiamos por la ecuación que tú quieras usar (Durnin-Womersley, Jackson & Pollock, etc.)
    const estimacion = Number((suma * 0.25).toFixed(1));
    return estimacion;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const porcentajeEstimado = calcularPorcentajeGrasa();
    setPorcentaje(porcentajeEstimado);

    onSubmitRegistro({
      pacienteNombre,
      pacienteApellido,
      fecha,
      triceps: parseNumberOrNull(triceps),
      subescapular: parseNumberOrNull(subescapular),
      suprailiaco: parseNumberOrNull(suprailiaco),
      abdominal: parseNumberOrNull(abdominal),
      muslo: parseNumberOrNull(muslo),
      porcentajeGrasaEstimado: porcentajeEstimado,
      porcentajeAgua: composicion?.porcentajeAgua ?? null,
      porcentajeHueso: composicion?.porcentajeHueso ?? null,
      porcentajeGrasa: composicion?.porcentajeGrasa ?? null,
      porcentajeMusculo: composicion?.porcentajeMusculo ?? null,
      caloriasMantenimiento: composicion?.caloriasMantenimiento ?? null,
    });

    // limpiar solo los pliegues, mantener datos del paciente
    setTriceps("");
    setSubescapular("");
    setSuprailiaco("");
    setAbdominal("");
    setMuslo("");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Buscar / seleccionar paciente existente */}
      <div className="space-y-2">
        <Label htmlFor="buscar-paciente">Buscar paciente existente</Label>
        <Input
          id="buscar-paciente"
          placeholder="Buscar por nombre, apellido, email o teléfono..."
          value={clientQuery}
          onChange={(e) => setClientQuery(e.target.value)}
        />

        {filteredClients.length > 0 && (
          <ul className="max-h-40 overflow-auto rounded border bg-white">
            {filteredClients.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={() => {
                    setPacienteNombre(c.nombre ?? "");
                    setPacienteApellido(c.apellido ?? "");
                    setClientQuery("");
                    // try to hydrate composition if present on client
                    // support a couple of possible shapes: client.clinicalHistory.composicion or client.composicion
                    const anyc = c as any;
                    const maybe = anyc.clinicalHistory?.composicion ?? anyc.composicion ?? anyc.composition;
                    if (maybe && typeof maybe === "object") {
                      setComposicion({
                        porcentajeAgua: maybe.porcentajeAgua ?? maybe.porcentajeAguaPercent ?? null,
                        porcentajeHueso: maybe.porcentajeHueso ?? null,
                        porcentajeGrasa: maybe.porcentajeGrasa ?? maybe.porcentajeFat ?? null,
                        porcentajeMusculo: maybe.porcentajeMusculo ?? null,
                        caloriasMantenimiento: maybe.caloriasMantenimiento ?? maybe.calories ?? null,
                        triceps: maybe.triceps ?? null,
                        subescapular: maybe.subescapular ?? null,
                        suprailiaco: maybe.suprailiaco ?? null,
                        abdominal: maybe.abdominal ?? null,
                        muslo: maybe.muslo ?? null,
                        bmi: maybe.bmi ?? null,
                      });
                    }
                  }}
                >
                  {c.nombre} {c.apellido ? " " + c.apellido : ""} {c.email ? `· ${c.email}` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Datos del paciente */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={pacienteNombre}
            onChange={(e) => setPacienteNombre(e.target.value)}
            placeholder="Ej. Laura"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            value={pacienteApellido}
            onChange={(e) => setPacienteApellido(e.target.value)}
            placeholder="Ej. García"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
      </div>

      <hr className="my-2" />

      {/* Composición corporal: abrimos un modal en lugar de los pliegues */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="text-sm text-muted-foreground">Composición corporal (opcional)</div>
          <div>
            <button
              type="button"
              className="inline-flex items-center rounded border px-3 py-1 text-sm"
              onClick={() => setOpenComposicion(true)}
            >
              Composición Corporal
            </button>
          </div>
        </div>

        {composicion ? (
          <div className="rounded border p-3 text-sm">
            <div>Agua: {composicion.porcentajeAgua ?? "—"}%</div>
            <div>Hueso: {composicion.porcentajeHueso ?? "—"}%</div>
            <div>Grasa: {composicion.porcentajeGrasa ?? "—"}%</div>
            <div>Músculo: {composicion.porcentajeMusculo ?? "—"}%</div>
            <div>Calorías estimadas: {composicion.caloriasMantenimiento ?? "—"} kcal/d</div>
            <div>IMC: {composicion.bmi ?? "—"} kg/m²</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hay composición guardada.</div>
        )}

        <ComposiciónCorporal
          open={openComposicion}
          onClose={() => setOpenComposicion(false)}
          initialNombre={pacienteNombre}
          initialApellido={pacienteApellido}
          initialFecha={fecha}
          onSave={(data) => {
            setComposicion(data);
            // populate pliegues inputs if provided by the modal
            setTriceps(data.triceps != null ? String(data.triceps) : "");
            setSubescapular(data.subescapular != null ? String(data.subescapular) : "");
            setSuprailiaco(data.suprailiaco != null ? String(data.suprailiaco) : "");
            setAbdominal(data.abdominal != null ? String(data.abdominal) : "");
            setMuslo(data.muslo != null ? String(data.muslo) : "");
          }}
        />
      </div>

      {porcentaje !== null && (
        <p className="text-sm text-muted-foreground">
          Estimación rápida de % grasa (solo orientativa):{" "}
          <span className="font-semibold">{porcentaje}%</span>
        </p>
      )}

      <Button type="submit" className="w-full">
        Guardar registro
      </Button>
    </form>
  );
}

type CampoPliegueProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
};

function CampoPliegue({ id, label, value, onChange }: CampoPliegueProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej. 12.5"
      />
    </div>
  );
}
