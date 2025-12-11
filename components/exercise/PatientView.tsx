"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EXERCISES } from "./exercisesData";
import type { Exercise as ExerciseData } from "./exercisesData";

type Client = { id: string; nombre: string; apellido?: string; email?: string };

const CLIENTS_KEY = "plicometria_clients_v1";
const ASSIGN_KEY = "plicometria_assigned_exercises_v1";

type Props = {
  initialClientId?: string | null;
};

export default function PatientView({ initialClientId }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId ?? null);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setClients(parsed);
      if (parsed.length > 0 && !selectedClientId) {
        setSelectedClientId(parsed[0].id);
      }
    } catch (e) {
      console.warn("Failed to load clients for PatientView", e);
    }

    try {
      const rawA = localStorage.getItem(ASSIGN_KEY);
      const parsedA = rawA ? JSON.parse(rawA) : {};
      setAssignments(parsedA);
    } catch (e) {
      console.warn("Failed to load assignments", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ASSIGN_KEY, JSON.stringify(assignments));
    } catch (e) {
      // ignore
    }
  }, [assignments]);

  const client = useMemo(() => clients.find((c) => c.id === selectedClientId) || null, [clients, selectedClientId]);

  const assignedExercises: ExerciseData[] = useMemo(() => {
    if (!selectedClientId) return [];
    const ids = assignments[selectedClientId] || [];
    return ids.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean) as ExerciseData[];
  }, [assignments, selectedClientId]);

  function assignExercise(exId: string) {
    if (!selectedClientId) return;
    setAssignments((prev) => {
      const prevList = prev[selectedClientId] || [];
      if (prevList.includes(exId)) return prev;
      const next = { ...prev, [selectedClientId]: [exId, ...prevList] };
      return next;
    });
  }

  function removeAssignment(exId: string) {
    if (!selectedClientId) return;
    setAssignments((prev) => {
      const prevList = prev[selectedClientId] || [];
      const nextList = prevList.filter((x) => x !== exId);
      return { ...prev, [selectedClientId]: nextList };
    });
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-medium">Ejercicios asignados</h2>
        <p className="mt-2 text-sm text-muted-foreground">No hay clientes. Añade clientes desde la sección "Clientes" para asignarles ejercicios.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-lg font-medium mb-2">Ejercicios por paciente</h2>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="text-sm text-muted-foreground">Selecciona paciente</label>
        <select
          value={selectedClientId ?? undefined}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido ?? ''}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium">Asignar ejercicio</h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => assignExercise(ex.id)}
              className="text-sm px-2 py-1 rounded border bg-white hover:shadow-sm"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium">Ejercicios asignados a {client ? `${client.nombre} ${client.apellido ?? ''}` : "-"}</h3>
        <div className="mt-3 space-y-2">
          {assignedExercises.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay ejercicios asignados.</div>
          ) : (
            assignedExercises.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">{ex.primaryMuscles.join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeAssignment(ex.id)} className="text-xs px-2 py-1 rounded border bg-rose-50 text-rose-700">Quitar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
