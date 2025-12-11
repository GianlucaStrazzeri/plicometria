/**
 * components/plicometria/ComposiciónCorporal.tsx
 *
 * Modal cliente multi-paso para registrar la composición corporal de un
 * paciente. Recopila porcentajes corporales (agua, hueso, grasa, músculo),
 * peso y altura (para calcular IMC), y una segunda página para introducir
 * pliegues cutáneos en mm (tríceps, subescapular, suprailiaco, abdominal,
 * muslo). Calcula una estimación sencilla de calorías de mantenimiento
 * basada en la masa magra y devuelve los datos mediante `onSave`.
 *
 * Props:
 * - `open`: muestra/oculta el modal.
 * - `onClose`: cierra el modal.
 * - `initialNombre`, `initialApellido`, `initialFecha`: valores de
 *   referencia mostrados en la cabecera del modal (opcionales).
 * - `onSave`: callback que recibe un objeto con porcentajes, pliegues
 *   y `bmi` (IMC) calculado.
 *
 * Nota: componente cliente (`"use client"`) porque usa hooks y maneja
 * estado y eventos del usuario en el navegador.
 */

"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  initialNombre?: string;
  initialApellido?: string;
  initialFecha?: string;
  onSave: (data: {
    porcentajeAgua: number | null;
    porcentajeHueso: number | null;
    porcentajeGrasa: number | null;
    porcentajeMusculo: number | null;
    caloriasMantenimiento: number | null;
    triceps?: number | null;
    subescapular?: number | null;
    suprailiaco?: number | null;
    abdominal?: number | null;
    muslo?: number | null;
    bmi?: number | null;
  }) => void;
};

// Simple modal without external dependencies. Calculates maintenance calories
// using a lean-mass based approximation (placeholder).
export default function ComposiciónCorporal({
  open,
  onClose,
  initialNombre = "",
  initialApellido = "",
  initialFecha = new Date().toISOString().slice(0, 10),
  onSave,
}: Props) {
  const [porcAgua, setPorcAgua] = useState<string>("");
  const [porcHueso, setPorcHueso] = useState<string>("");
  const [porcGrasa, setPorcGrasa] = useState<string>("");
  const [porcMusculo, setPorcMusculo] = useState<string>("");
  // Peso y altura para cálculo de IMC
  const [pesoKg, setPesoKg] = useState<string>("");
  const [alturaCm, setAlturaCm] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);

  // Pliegues (mm)
  const [triceps, setTriceps] = useState<string>("");
  const [subescapular, setSubescapular] = useState<string>("");
  const [suprailiaco, setSuprailiaco] = useState<string>("");
  const [abdominal, setAbdominal] = useState<string>("");
  const [muslo, setMuslo] = useState<string>("");

  // When modal opens prefill nothing; keep values when reopened.
  useEffect(() => {
    if (!open) return;
  }, [open]);

  const parse = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const parsedAgua = useMemo(() => parse(porcAgua), [porcAgua]);
  const parsedHueso = useMemo(() => parse(porcHueso), [porcHueso]);
  const parsedGrasa = useMemo(() => parse(porcGrasa), [porcGrasa]);
  const parsedMusculo = useMemo(() => parse(porcMusculo), [porcMusculo]);
  const parsedPeso = useMemo(() => parse(pesoKg), [pesoKg]);
  const parsedAltura = useMemo(() => parse(alturaCm), [alturaCm]);

  const parseMm = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  // Estimate maintenance calories using lean mass approximation.
  // We don't have weight/height/age, so we assume a default weight of 70kg
  // and estimate BMR from lean mass: BMR ~= 370 + 21.6 * leanMassKg
  // TDEE ~= BMR * 1.55 (moderate activity). This is a placeholder.
  const caloriasEstimadas = useMemo(() => {
    const fat = parsedGrasa ?? 0;
    const muscle = parsedMusculo ?? 0;
    const weightKg = Number.isFinite(parsedPeso) && (parsedPeso ?? 0) > 0 ? (parsedPeso ?? 0) : 70; // default 70kg if not provided
    const leanMassKg = (muscle / 100) * weightKg;
    if (!Number.isFinite(leanMassKg) || leanMassKg <= 0) return null;
    const bmr = 370 + 21.6 * leanMassKg;
    const tdee = Math.round(bmr * 1.55);
    return tdee;
  }, [parsedGrasa, parsedMusculo, parsedPeso]);

  const imc = useMemo(() => {
    if (!Number.isFinite(parsedPeso) || !Number.isFinite(parsedAltura)) return null;
    const h = (parsedAltura ?? 0) / 100;
    if (h <= 0) return null;
    const v = (parsedPeso ?? 0) / (h * h);
    return Number.isFinite(v) ? Math.round(v * 10) / 10 : null;
  }, [parsedPeso, parsedAltura]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Composición Corporal</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Nombre: {initialNombre} {initialApellido} — Fecha: {initialFecha}
        </p>

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Porcentaje de Agua (%)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={porcAgua}
                onChange={(e) => setPorcAgua(e.target.value)}
                placeholder="Ej. 55"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Porcentaje de Hueso (%)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={porcHueso}
                onChange={(e) => setPorcHueso(e.target.value)}
                placeholder="Ej. 15"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Porcentaje de Grasa (%)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={porcGrasa}
                onChange={(e) => setPorcGrasa(e.target.value)}
                placeholder="Ej. 20"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Porcentaje de Músculo (%)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={porcMusculo}
                onChange={(e) => setPorcMusculo(e.target.value)}
                placeholder="Ej. 35"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Peso (kg)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value)}
                placeholder="Ej. 70"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Altura (cm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={alturaCm}
                onChange={(e) => setAlturaCm(e.target.value)}
                placeholder="Ej. 175"
                inputMode="decimal"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tríceps (mm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={triceps}
                onChange={(e) => setTriceps(e.target.value)}
                placeholder="Ej. 12.5"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subescapular (mm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={subescapular}
                onChange={(e) => setSubescapular(e.target.value)}
                placeholder="Ej. 10"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Suprailiaco (mm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={suprailiaco}
                onChange={(e) => setSuprailiaco(e.target.value)}
                placeholder="Ej. 8"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Abdominal (mm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={abdominal}
                onChange={(e) => setAbdominal(e.target.value)}
                placeholder="Ej. 15"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Muslo (mm)</label>
              <input
                className="w-full rounded border px-2 py-1"
                value={muslo}
                onChange={(e) => setMuslo(e.target.value)}
                placeholder="Ej. 18"
                inputMode="decimal"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">Calorías estimadas (mantenimiento)</label>
          <div className="mt-1 text-lg font-semibold">
            {caloriasEstimadas ? `${caloriasEstimadas} kcal/día` : "—"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">IMC: {imc != null ? `${imc} kg/m²` : "—"}</div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="rounded bg-gray-100 px-3 py-1 text-sm"
              onClick={() => {
                if (step === 2) setStep(1);
                else onClose();
              }}
              type="button"
            >
              {step === 2 ? "Volver" : "Cancelar"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => setStep(2)}
                type="button"
              >
                Siguiente: Pliegues
              </button>
            ) : null}

            <button
              className="rounded bg-primary px-3 py-1 text-sm text-white"
              onClick={() => {
                // prepare values
                const t = parseMm(triceps);
                const s = parseMm(subescapular);
                const su = parseMm(suprailiaco);
                const a = parseMm(abdominal);
                const m = parseMm(muslo);

                onSave({
                  porcentajeAgua: parsedAgua,
                  porcentajeHueso: parsedHueso,
                  porcentajeGrasa: parsedGrasa,
                  porcentajeMusculo: parsedMusculo,
                  caloriasMantenimiento: caloriasEstimadas ?? null,
                  bmi: imc ?? null,
                  triceps: t,
                  subescapular: s,
                  suprailiaco: su,
                  abdominal: a,
                  muslo: m,
                });
                onClose();
              }}
              type="button"
            >
              Guardar composición
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
