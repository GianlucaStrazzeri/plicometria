"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Client } from "./ClientModal";

type Props = {
  client?: Client | null;
  onSavePart: (partial: any) => void;
};

export default function ClientHistorialClinico({ client = null, onSavePart }: Props) {
  const initial = (client?.clinicalHistory ?? {}) as any;

  const [tab, setTab] = useState<
    | "motivo"
    | "historia"
    | "sintomas"
    | "antecedentes"
    | "alergias"
    | "habitos"
    | "digestiva"
    | "urinaria"
    | "cardio"
    | "musculo"
    | "otros"
    | "psico"
    | "exploracion"
    | "pruebas"
    | "diagnostico"
  >("motivo");

  // Motivo / historia (existing)
  const [motivo, setMotivo] = useState(initial.motivo ?? "");
  const [desdeCuando, setDesdeCuando] = useState(initial.desdeCuando ?? "");
  const [descripcion, setDescripcion] = useState(initial.descripcion ?? "");
  const [inicioEvolucion, setInicioEvolucion] = useState(initial.inicioEvolucion ?? "");
  const [impacto, setImpacto] = useState(initial.impacto ?? "");
  const [factoresAgravantes, setFactoresAgravantes] = useState(initial.factoresAgravantes ?? "");
  const [factoresAtenuantes, setFactoresAtenuantes] = useState(initial.factoresAtenuantes ?? "");
  const [intensidad, setIntensidad] = useState(initial.intensidad ?? "");
  const [frecuencia, setFrecuencia] = useState(initial.frecuencia ?? "");
  const [localizacion, setLocalizacion] = useState(initial.localizacion ?? "");

  // Antecedentes y enfermedades
  const [antecedentesPersonales, setAntecedentesPersonales] = useState(initial.antecedentesPersonales ?? "");
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState(initial.enfermedadesCronicas ?? "");
  const [enfermedadesAgudas, setEnfermedadesAgudas] = useState(initial.enfermedadesAgudas ?? "");
  const [cirugiasPrevias, setCirugiasPrevias] = useState(initial.cirugiasPrevias ?? "");

  // Alergias
  const [alergiasMedicamentosas, setAlergiasMedicamentosas] = useState(initial.alergiasMedicamentosas ?? "");
  const [alergiasAlimentarias, setAlergiasAlimentarias] = useState(initial.alergiasAlimentarias ?? "");
  const [alergiasAmbientales, setAlergiasAmbientales] = useState(initial.alergiasAmbientales ?? "");

  // Habitos y estilo de vida
  const [alimentacion, setAlimentacion] = useState(initial.alimentacion ?? "");
  const [actividadFisica, setActividadFisica] = useState(initial.actividadFisica ?? "");
  const [consumoTabaco, setConsumoTabaco] = useState(initial.consumoTabaco ?? "");
  const [consumoAlcohol, setConsumoAlcohol] = useState(initial.consumoAlcohol ?? "");
  const [calidadSueno, setCalidadSueno] = useState(initial.calidadSueno ?? "");
  const [horasSueno, setHorasSueno] = useState(initial.horasSueno ?? "");
  const [nivelesEstres, setNivelesEstres] = useState(initial.nivelesEstres ?? "");

  // Función digestiva
  const [apetito, setApetito] = useState(initial.apetito ?? "No registrado");
  const [digestion, setDigestion] = useState(initial.digestion ?? "No registrado");
  const [evacuaciones, setEvacuaciones] = useState(initial.evacuaciones ?? "No registrado");
  const [frecuenciaEvac, setFrecuenciaEvac] = useState(initial.frecuenciaEvac ?? "No registrado");
  const [consistenciaEvac, setConsistenciaEvac] = useState(initial.consistenciaEvac ?? "No registrado");
  const [cambiosRecientesEvac, setCambiosRecientesEvac] = useState(initial.cambiosRecientesEvac ?? "No registrado");
  const [nauseasVomitos, setNauseasVomitos] = useState(initial.nauseasVomitos ?? "No registrado");
  const [reflujo, setReflujo] = useState(initial.reflujo ?? "No registrado");

  // Función urinaria
  const [frecuenciaUrinaria, setFrecuenciaUrinaria] = useState(initial.frecuenciaUrinaria ?? "No registrado");
  const [dolorAlOrinar, setDolorAlOrinar] = useState(initial.dolorAlOrinar ?? "No registrado");
  const [incontinencia, setIncontinencia] = useState(initial.incontinencia ?? "No registrado");
  const [cambiosColorUrinario, setCambiosColorUrinario] = useState(initial.cambiosColorUrinario ?? "No registrado");
  const [cambiosOlorUrinario, setCambiosOlorUrinario] = useState(initial.cambiosOlorUrinario ?? "No registrado");

  // Cardio / respiratorio
  const [palpitaciones, setPalpitaciones] = useState(initial.palpitaciones ?? "No registrado");
  const [disnea, setDisnea] = useState(initial.disnea ?? "No registrado");
  const [dolorToracico, setDolorToracico] = useState(initial.dolorToracico ?? "No registrado");
  const [tos, setTos] = useState(initial.tos ?? "No registrado");
  const [esputo, setEsputo] = useState(initial.esputo ?? "No registrado");

  // Musculoesquelético
  const [dolorArticular, setDolorArticular] = useState(initial.dolorArticular ?? "No registrado");
  const [dolorMuscular, setDolorMuscular] = useState(initial.dolorMuscular ?? "No registrado");
  const [limitacionesMovimiento, setLimitacionesMovimiento] = useState(initial.limitacionesMovimiento ?? "No registrado");
  const [debilidadFatiga, setDebilidadFatiga] = useState(initial.debilidadFatiga ?? "No registrado");

  // Otros sistemas / neurológico
  const [sistemaCutaneo, setSistemaCutaneo] = useState(initial.sistemaCutaneo ?? "No registrado");
  const [sistemaEndocrino, setSistemaEndocrino] = useState(initial.sistemaEndocrino ?? "No registrado");
  const [sistemaHematologico, setSistemaHematologico] = useState(initial.sistemaHematologico ?? "No registrado");
  const [mareos, setMareos] = useState(initial.mareos ?? "No registrado");
  const [cefaleas, setCefaleas] = useState(initial.cefaleas ?? "No registrado");
  const [perdidaSensibilidad, setPerdidaSensibilidad] = useState(initial.perdidaSensibilidad ?? "No registrado");
  const [perdidaFuerza, setPerdidaFuerza] = useState(initial.perdidaFuerza ?? "No registrado");
  const [alterVisuales, setAlterVisuales] = useState(initial.alterVisuales ?? "No registrado");
  const [alterAuditivas, setAlterAuditivas] = useState(initial.alterAuditivas ?? "No registrado");

  // Psicológico
  const [estadoAnimo, setEstadoAnimo] = useState(initial.estadoAnimo ?? "No registrado");
  const [ansiedad, setAnsiedad] = useState(initial.ansiedad ?? "No registrado");
  const [depresion, setDepresion] = useState(initial.depresion ?? "No registrado");
  const [cambiosConducta, setCambiosConducta] = useState(initial.cambiosConducta ?? "No registrado");
  const [trastornosSueno, setTrastornosSueno] = useState(initial.trastornosSueno ?? "No registrado");

  // Exploración física - signos vitales
  const [tensionArterial, setTensionArterial] = useState(initial.tensionArterial ?? "No registrado");
  const [fc, setFc] = useState(initial.fc ?? "No registrado");
  const [fr, setFr] = useState(initial.fr ?? "No registrado");
  const [temperatura, setTemperatura] = useState(initial.temperatura ?? "No registrado");
  const [satO2, setSatO2] = useState(initial.satO2 ?? "No registrado");

  // Antropometría
  const [peso, setPeso] = useState(initial.peso ?? "No registrado");
  const [talla, setTalla] = useState(initial.talla ?? "No registrado");
  const [imc, setImc] = useState(initial.imc ?? "");
  const [estadoNutricional, setEstadoNutricional] = useState(initial.estadoNutricional ?? "No calculado");
  const [observacionesExploracion, setObservacionesExploracion] = useState(initial.observacionesExploracion ?? "No registrado");

  // Pruebas complementarias y diagnóstico
  const [pruebasComplementarias, setPruebasComplementarias] = useState(initial.pruebasComplementarias ?? "No registrado");
  const [diagnostico, setDiagnostico] = useState(initial.diagnostico ?? "No registrado");
  const [medicacionPrescrita, setMedicacionPrescrita] = useState(initial.medicacionPrescrita ?? "No registrado");
  const [recomendaciones, setRecomendaciones] = useState(initial.recomendaciones ?? "No registrado");
  const [derivaciones, setDerivaciones] = useState(initial.derivaciones ?? "No registrado");
  const [planSeguimiento, setPlanSeguimiento] = useState(initial.planSeguimiento ?? "No registrado");
  const [observacionesAdicionales, setObservacionesAdicionales] = useState(initial.observacionesAdicionales ?? "No registrado");

  useEffect(() => {
    const t = setTimeout(() => {
      const i = (client?.clinicalHistory ?? {}) as any;
      // copy values safely from i to states
      setMotivo(i.motivo ?? "");
      setDesdeCuando(i.desdeCuando ?? "");
      setDescripcion(i.descripcion ?? "");
      setInicioEvolucion(i.inicioEvolucion ?? "");
      setImpacto(i.impacto ?? "");
      setFactoresAgravantes(i.factoresAgravantes ?? "");
      setFactoresAtenuantes(i.factoresAtenuantes ?? "");
      setIntensidad(i.intensidad ?? "");
      setFrecuencia(i.frecuencia ?? "");
      setLocalizacion(i.localizacion ?? "");

      setAntecedentesPersonales(i.antecedentesPersonales ?? "");
      setEnfermedadesCronicas(i.enfermedadesCronicas ?? "");
      setEnfermedadesAgudas(i.enfermedadesAgudas ?? "");
      setCirugiasPrevias(i.cirugiasPrevias ?? "");

      setAlergiasMedicamentosas(i.alergiasMedicamentosas ?? "");
      setAlergiasAlimentarias(i.alergiasAlimentarias ?? "");
      setAlergiasAmbientales(i.alergiasAmbientales ?? "");

      setAlimentacion(i.alimentacion ?? "");
      setActividadFisica(i.actividadFisica ?? "");
      setConsumoTabaco(i.consumoTabaco ?? "");
      setConsumoAlcohol(i.consumoAlcohol ?? "");
      setCalidadSueno(i.calidadSueno ?? "");
      setHorasSueno(i.horasSueno ?? "");
      setNivelesEstres(i.nivelesEstres ?? "");

      setApetito(i.apetito ?? "No registrado");
      setDigestion(i.digestion ?? "No registrado");
      setEvacuaciones(i.evacuaciones ?? "No registrado");
      setFrecuenciaEvac(i.frecuenciaEvac ?? "No registrado");
      setConsistenciaEvac(i.consistenciaEvac ?? "No registrado");
      setCambiosRecientesEvac(i.cambiosRecientesEvac ?? "No registrado");
      setNauseasVomitos(i.nauseasVomitos ?? "No registrado");
      setReflujo(i.reflujo ?? "No registrado");

      setFrecuenciaUrinaria(i.frecuenciaUrinaria ?? "No registrado");
      setDolorAlOrinar(i.dolorAlOrinar ?? "No registrado");
      setIncontinencia(i.incontinencia ?? "No registrado");
      setCambiosColorUrinario(i.cambiosColorUrinario ?? "No registrado");
      setCambiosOlorUrinario(i.cambiosOlorUrinario ?? "No registrado");

      setPalpitaciones(i.palpitaciones ?? "No registrado");
      setDisnea(i.disnea ?? "No registrado");
      setDolorToracico(i.dolorToracico ?? "No registrado");
      setTos(i.tos ?? "No registrado");
      setEsputo(i.esputo ?? "No registrado");

      setDolorArticular(i.dolorArticular ?? "No registrado");
      setDolorMuscular(i.dolorMuscular ?? "No registrado");
      setLimitacionesMovimiento(i.limitacionesMovimiento ?? "No registrado");
      setDebilidadFatiga(i.debilidadFatiga ?? "No registrado");

      setSistemaCutaneo(i.sistemaCutaneo ?? "No registrado");
      setSistemaEndocrino(i.sistemaEndocrino ?? "No registrado");
      setSistemaHematologico(i.sistemaHematologico ?? "No registrado");
      setMareos(i.mareos ?? "No registrado");
      setCefaleas(i.cefaleas ?? "No registrado");
      setPerdidaSensibilidad(i.perdidaSensibilidad ?? "No registrado");
      setPerdidaFuerza(i.perdidaFuerza ?? "No registrado");
      setAlterVisuales(i.alterVisuales ?? "No registrado");
      setAlterAuditivas(i.alterAuditivas ?? "No registrado");

      setEstadoAnimo(i.estadoAnimo ?? "No registrado");
      setAnsiedad(i.ansiedad ?? "No registrado");
      setDepresion(i.depresion ?? "No registrado");
      setCambiosConducta(i.cambiosConducta ?? "No registrado");
      setTrastornosSueno(i.trastornosSueno ?? "No registrado");

      setTensionArterial(i.tensionArterial ?? "No registrado");
      setFc(i.fc ?? "No registrado");
      setFr(i.fr ?? "No registrado");
      setTemperatura(i.temperatura ?? "No registrado");
      setSatO2(i.satO2 ?? "No registrado");

      setPeso(i.peso ?? "No registrado");
      setTalla(i.talla ?? "No registrado");
      setImc(i.imc ?? "");
      setEstadoNutricional(i.estadoNutricional ?? "No calculado");
      setObservacionesExploracion(i.observacionesExploracion ?? "No registrado");

      setPruebasComplementarias(i.pruebasComplementarias ?? "No registrado");
      setDiagnostico(i.diagnostico ?? "No registrado");
      setMedicacionPrescrita(i.medicacionPrescrita ?? "No registrado");
      setRecomendaciones(i.recomendaciones ?? "No registrado");
      setDerivaciones(i.derivaciones ?? "No registrado");
      setPlanSeguimiento(i.planSeguimiento ?? "No registrado");
      setObservacionesAdicionales(i.observacionesAdicionales ?? "No registrado");
    }, 0);
    return () => clearTimeout(t);
  }, [client]);

  // Save handlers: each one passes a partial object up via onSavePart
  function saveMotivo() {
    onSavePart({ motivo, desdeCuando });
  }
  function saveHistoria() {
    onSavePart({ descripcion, inicioEvolucion });
  }
  function saveSintomas() {
    onSavePart({ impacto, factoresAgravantes, factoresAtenuantes, intensidad, frecuencia, localizacion });
  }

  function saveAntecedentes() {
    onSavePart({ antecedentesPersonales, enfermedadesCronicas, enfermedadesAgudas, cirugiasPrevias });
  }
  function saveAlergias() {
    onSavePart({ alergiasMedicamentosas, alergiasAlimentarias, alergiasAmbientales });
  }
  function saveHabitos() {
    onSavePart({ alimentacion, actividadFisica, consumoTabaco, consumoAlcohol, calidadSueno, horasSueno, nivelesEstres });
  }
  function saveDigestiva() {
    onSavePart({ apetito, digestion, evacuaciones, frecuenciaEvac, consistenciaEvac, cambiosRecientesEvac, nauseasVomitos, reflujo } as any);
  }
  function saveUrinaria() {
    onSavePart({ frecuenciaUrinaria, dolorAlOrinar, incontinencia, cambiosColorUrinario, cambiosOlorUrinario });
  }
  function saveCardio() {
    onSavePart({ palpitaciones, disnea, dolorToracico, tos, esputo });
  }
  function saveMusculo() {
    onSavePart({ dolorArticular, dolorMuscular, limitacionesMovimiento, debilidadFatiga });
  }
  function saveOtros() {
    onSavePart({ sistemaCutaneo, sistemaEndocrino, sistemaHematologico, mareos, cefaleas, perdidaSensibilidad, perdidaFuerza, alterVisuales, alterAuditivas });
  }
  function savePsico() {
    onSavePart({ estadoAnimo, ansiedad, depresion, cambiosConducta, trastornosSueno });
  }
  function saveExploracion() {
    onSavePart({ tensionArterial, fc, fr, temperatura, satO2, peso, talla, imc, estadoNutricional, observacionesExploracion });
  }
  function savePruebas() {
    onSavePart({ pruebasComplementarias });
  }
  function saveDiagnostico() {
    onSavePart({ diagnostico, medicacionPrescrita, recomendaciones, derivaciones, planSeguimiento, observacionesAdicionales });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "motivo",
          "historia",
          "sintomas",
          "antecedentes",
          "alergias",
          "habitos",
          "digestiva",
          "urinaria",
          "cardio",
          "musculo",
          "otros",
          "psico",
          "exploracion",
          "pruebas",
          "diagnostico",
        ].map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded ${tab === t ? "bg-primary text-white" : "border"}`}
            onClick={() => setTab(t as any)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "motivo" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Motivo de la consulta</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Desde cuando presenta el problema</Label>
            <Input value={desdeCuando} onChange={(e) => setDesdeCuando(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveMotivo}>Guardar Motivo</Button>
          </div>
        </div>
      )}

      {tab === "historia" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Descripción detallada del problema</Label>
            <textarea aria-label="Descripción detallada del problema" className="w-full rounded border px-2 py-1" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Inicio y evolución</Label>
            <textarea aria-label="Inicio y evolución" className="w-full rounded border px-2 py-1" value={inicioEvolucion} onChange={(e) => setInicioEvolucion(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveHistoria}>Guardar Historia</Button>
          </div>
        </div>
      )}

      {tab === "sintomas" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Impacto en la vida diaria</Label>
            <textarea aria-label="Impacto en la vida diaria" className="w-full rounded border px-2 py-1" value={impacto} onChange={(e) => setImpacto(e.target.value)} />
          </div>

          <div>
            <Label className="block mb-1">Factores agravantes</Label>
            <textarea aria-label="Factores agravantes" className="w-full rounded border px-2 py-1" value={factoresAgravantes} onChange={(e) => setFactoresAgravantes(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Factores atenuantes</Label>
            <textarea aria-label="Factores atenuantes" className="w-full rounded border px-2 py-1" value={factoresAtenuantes} onChange={(e) => setFactoresAtenuantes(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="block mb-1">Intensidad</Label>
              <Input value={intensidad} onChange={(e) => setIntensidad(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Frecuencia</Label>
              <Input value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Localización</Label>
              <Input value={localizacion} onChange={(e) => setLocalizacion(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSintomas}>Guardar Impacto / Factores / Síntomas</Button>
          </div>
        </div>
      )}

      {tab === "antecedentes" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Antecedentes Personales</Label>
            <textarea aria-label="Antecedentes personales" className="w-full rounded border px-2 py-1" value={antecedentesPersonales} onChange={(e) => setAntecedentesPersonales(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Enfermedades crónicas</Label>
            <textarea aria-label="Enfermedades crónicas" className="w-full rounded border px-2 py-1" value={enfermedadesCronicas} onChange={(e) => setEnfermedadesCronicas(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Enfermedades agudas importantes</Label>
            <textarea aria-label="Enfermedades agudas importantes" className="w-full rounded border px-2 py-1" value={enfermedadesAgudas} onChange={(e) => setEnfermedadesAgudas(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Cirugías previas</Label>
            <textarea aria-label="Cirugías previas" className="w-full rounded border px-2 py-1" value={cirugiasPrevias} onChange={(e) => setCirugiasPrevias(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveAntecedentes}>Guardar Antecedentes</Button>
          </div>
        </div>
      )}

      {tab === "alergias" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Alergias - Medicamentosas</Label>
            <textarea aria-label="Alergias medicamentosas" className="w-full rounded border px-2 py-1" value={alergiasMedicamentosas} onChange={(e) => setAlergiasMedicamentosas(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Alergias - Alimentarias</Label>
            <textarea aria-label="Alergias alimentarias" className="w-full rounded border px-2 py-1" value={alergiasAlimentarias} onChange={(e) => setAlergiasAlimentarias(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Alergias - Ambientales</Label>
            <textarea aria-label="Alergias ambientales" className="w-full rounded border px-2 py-1" value={alergiasAmbientales} onChange={(e) => setAlergiasAmbientales(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveAlergias}>Guardar Alergias</Button>
          </div>
        </div>
      )}

      {tab === "habitos" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Alimentación</Label>
            <textarea aria-label="Alimentación" className="w-full rounded border px-2 py-1" value={alimentacion} onChange={(e) => setAlimentacion(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Actividad física</Label>
            <Input value={actividadFisica} onChange={(e) => setActividadFisica(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="block mb-1">Consumo de tabaco</Label>
              <Input value={consumoTabaco} onChange={(e) => setConsumoTabaco(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Consumo de alcohol</Label>
              <Input value={consumoAlcohol} onChange={(e) => setConsumoAlcohol(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Niveles de estrés</Label>
              <Input value={nivelesEstres} onChange={(e) => setNivelesEstres(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <div>
              <Label className="block mb-1">Calidad del sueño</Label>
              <Input value={calidadSueno} onChange={(e) => setCalidadSueno(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Horas de sueño</Label>
              <Input value={horasSueno} onChange={(e) => setHorasSueno(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveHabitos}>Guardar Hábitos</Button>
          </div>
        </div>
      )}

      {tab === "digestiva" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Apetito</Label>
            <Input value={apetito} onChange={(e) => setApetito(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Digestión</Label>
            <Input value={digestion ?? ""} onChange={(e) => setDigestion(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Evacuaciones</Label>
            <Input value={evacuaciones} onChange={(e) => setEvacuaciones(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="block mb-1">Frecuencia</Label>
              <Input value={frecuenciaEvac} onChange={(e) => setFrecuenciaEvac(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Consistencia</Label>
              <Input value={consistenciaEvac} onChange={(e) => setConsistenciaEvac(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="block mb-1">Cambios recientes</Label>
            <Input value={cambiosRecientesEvac} onChange={(e) => setCambiosRecientesEvac(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="block mb-1">Náuseas/Vómitos</Label>
              <Input value={nauseasVomitos} onChange={(e) => setNauseasVomitos(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Reflujo</Label>
              <Input value={reflujo} onChange={(e) => setReflujo(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveDigestiva}>Guardar Función Digestiva</Button>
          </div>
        </div>
      )}

      {tab === "urinaria" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Frecuencia urinaria</Label>
            <Input value={frecuenciaUrinaria} onChange={(e) => setFrecuenciaUrinaria(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Dolor al orinar</Label>
            <Input value={dolorAlOrinar} onChange={(e) => setDolorAlOrinar(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Incontinencia</Label>
            <Input value={incontinencia} onChange={(e) => setIncontinencia(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="block mb-1">Cambios en color</Label>
              <Input value={cambiosColorUrinario} onChange={(e) => setCambiosColorUrinario(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Cambios en olor</Label>
              <Input value={cambiosOlorUrinario} onChange={(e) => setCambiosOlorUrinario(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveUrinaria}>Guardar Función Urinaria</Button>
          </div>
        </div>
      )}

      {tab === "cardio" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Palpitaciones</Label>
            <Input value={palpitaciones} onChange={(e) => setPalpitaciones(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Disnea (falta de aire)</Label>
            <Input value={disnea} onChange={(e) => setDisnea(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="block mb-1">Dolor torácico</Label>
              <Input value={dolorToracico} onChange={(e) => setDolorToracico(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Tos / Esputo</Label>
              <Input value={tos} onChange={(e) => setTos(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveCardio}>Guardar Cardio/Respiratorio</Button>
          </div>
        </div>
      )}

      {tab === "musculo" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Dolor articular</Label>
            <Input value={dolorArticular} onChange={(e) => setDolorArticular(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Dolor muscular</Label>
            <Input value={dolorMuscular} onChange={(e) => setDolorMuscular(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Limitaciones de movimiento</Label>
            <Input value={limitacionesMovimiento} onChange={(e) => setLimitacionesMovimiento(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveMusculo}>Guardar Musculoesquelético</Button>
          </div>
        </div>
      )}

      {tab === "otros" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Sistema cutáneo</Label>
            <Input value={sistemaCutaneo} onChange={(e) => setSistemaCutaneo(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Sistema endocrino</Label>
            <Input value={sistemaEndocrino} onChange={(e) => setSistemaEndocrino(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Sistema hematológico</Label>
            <Input value={sistemaHematologico} onChange={(e) => setSistemaHematologico(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveOtros}>Guardar Otros Sistemas</Button>
          </div>
        </div>
      )}

      {tab === "psico" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Estado de ánimo</Label>
            <Input value={estadoAnimo} onChange={(e) => setEstadoAnimo(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Ansiedad</Label>
            <Input value={ansiedad} onChange={(e) => setAnsiedad(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Depresión</Label>
            <Input value={depresion} onChange={(e) => setDepresion(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={savePsico}>Guardar Psicológico</Button>
          </div>
        </div>
      )}

      {tab === "exploracion" && (
        <div className="space-y-2">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="block mb-1">Tensión Arterial</Label>
              <Input value={tensionArterial} onChange={(e) => setTensionArterial(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">FC (lpm)</Label>
              <Input value={fc} onChange={(e) => setFc(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">FR (rpm)</Label>
              <Input value={fr} onChange={(e) => setFr(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <div>
              <Label className="block mb-1">Temperatura (°C)</Label>
              <Input value={temperatura} onChange={(e) => setTemperatura(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">SatO2 (%)</Label>
              <Input value={satO2} onChange={(e) => setSatO2(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">IMC (calculado)</Label>
              <Input value={imc} onChange={(e) => setImc(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <div>
              <Label className="block mb-1">Peso (kg)</Label>
              <Input value={peso} onChange={(e) => setPeso(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Talla (cm)</Label>
              <Input value={talla} onChange={(e) => setTalla(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="block mb-1">Observaciones de la exploración física</Label>
            <textarea aria-label="Observaciones de la exploración física" className="w-full rounded border px-2 py-1" value={observacionesExploracion} onChange={(e) => setObservacionesExploracion(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveExploracion}>Guardar Exploración</Button>
          </div>
        </div>
      )}

      {tab === "pruebas" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Pruebas complementarias</Label>
            <textarea aria-label="Pruebas complementarias" className="w-full rounded border px-2 py-1" value={pruebasComplementarias} onChange={(e) => setPruebasComplementarias(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={savePruebas}>Guardar Pruebas</Button>
          </div>
        </div>
      )}

      {tab === "diagnostico" && (
        <div className="space-y-2">
          <div>
            <Label className="block mb-1">Diagnóstico</Label>
            <textarea aria-label="Diagnóstico" className="w-full rounded border px-2 py-1" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Medicación prescrita</Label>
            <textarea aria-label="Medicación prescrita" className="w-full rounded border px-2 py-1" value={medicacionPrescrita} onChange={(e) => setMedicacionPrescrita(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Recomendaciones</Label>
            <textarea aria-label="Recomendaciones" className="w-full rounded border px-2 py-1" value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Derivaciones</Label>
            <textarea aria-label="Derivaciones" className="w-full rounded border px-2 py-1" value={derivaciones} onChange={(e) => setDerivaciones(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Plan de seguimiento</Label>
            <textarea aria-label="Plan de seguimiento" className="w-full rounded border px-2 py-1" value={planSeguimiento} onChange={(e) => setPlanSeguimiento(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Observaciones adicionales</Label>
            <textarea aria-label="Observaciones adicionales" className="w-full rounded border px-2 py-1" value={observacionesAdicionales} onChange={(e) => setObservacionesAdicionales(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveDiagnostico}>Guardar Diagnóstico / Plan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
