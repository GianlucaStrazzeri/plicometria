"use client";

import React, { useState } from "react";
import { ExerciseType, MovementPattern } from "./types";
import type { RichExercise, MusclePortion } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (ex: RichExercise) => void;
};

export default function AddExerciseModal({ open, onClose, onCreate }: Props): React.ReactElement | null {
  const [newExercise, setNewExercise] = useState<RichExercise>({
    id: "",
    label: "",
    videoTitle: "",
    videoUrl: "",
    type: ExerciseType.BODYWEIGHT,
    description: "",
    movementPattern: MovementPattern.PULL,
    muscles: [],
  });

  function reset() {
    setNewExercise({
      id: "",
      label: "",
      videoTitle: "",
      videoUrl: "",
      type: ExerciseType.BODYWEIGHT,
      description: "",
      movementPattern: MovementPattern.PULL,
      muscles: [],
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Añadir ejercicio</h3>
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm">Id</label>
              <input className="w-full rounded border px-2 py-1" value={newExercise.id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({ ...newExercise, id: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Label</label>
              <input className="w-full rounded border px-2 py-1" value={newExercise.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({ ...newExercise, label: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm">Video Title</label>
            <input className="w-full rounded border px-2 py-1" value={newExercise.videoTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({ ...newExercise, videoTitle: e.target.value })} />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm">Video URL</label>
              <input className="w-full rounded border px-2 py-1" value={newExercise.videoUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({ ...newExercise, videoUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <select className="w-full rounded border px-2 py-1" value={newExercise.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewExercise({ ...newExercise, type: e.target.value as ExerciseType })}>
                <option value={ExerciseType.BODYWEIGHT}>Bodyweight</option>
                <option value={ExerciseType.STRENGTH}>Strength</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm">Movement Pattern</label>
              <select className="w-full rounded border px-2 py-1" value={newExercise.movementPattern} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewExercise({ ...newExercise, movementPattern: e.target.value as MovementPattern })}>
                <option value={MovementPattern.PULL}>Pull</option>
                <option value={MovementPattern.PUSH}>Push</option>
                <option value={MovementPattern.SQUAT}>Squat</option>
                <option value={MovementPattern.HINGE}>Hinge</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Description</label>
              <input className="w-full rounded border px-2 py-1" value={newExercise.description} onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm">Muscles (group + proportion)</label>
            <div className="space-y-2">
              {newExercise.muscles.map((m: MusclePortion, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input className="flex-1 rounded border px-2 py-1" placeholder="Grupo muscular" value={m.group} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const copy = [...newExercise.muscles];
                    copy[idx] = { ...copy[idx], group: e.target.value };
                    setNewExercise({ ...newExercise, muscles: copy });
                  }} />
                  <input type="number" className="w-28 rounded border px-2 py-1" placeholder="%" value={String(m.proportion)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const copy = [...newExercise.muscles];
                    const parsed = e.target.value === "" ? 0 : Number(e.target.value);
                    copy[idx] = { ...copy[idx], proportion: parsed };
                    setNewExercise({ ...newExercise, muscles: copy });
                  }} />
                  <button type="button" className="px-2" onClick={() => {
                    const copy = newExercise.muscles.filter((_, i) => i !== idx);
                    setNewExercise({ ...newExercise, muscles: copy });
                  }}>Eliminar</button>
                </div>
              ))}
              <button type="button" className="mt-2 rounded border px-3 py-1" onClick={() => setNewExercise({ ...newExercise, muscles: [...newExercise.muscles, { group: "", proportion: 0 }] })}>Añadir músculo</button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button className="rounded border px-3 py-1" onClick={() => { reset(); onClose(); }}>Cancelar</button>
            <button className="rounded bg-primary px-3 py-1 text-white" onClick={() => {
              if (!newExercise.id.trim() || !newExercise.label.trim()) return alert('Id y label son obligatorios');
              onCreate(newExercise);
              reset();
              onClose();
            }}>Crear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
