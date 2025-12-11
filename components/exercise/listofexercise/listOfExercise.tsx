"use client";

import React, { useState } from "react";
import type { RichExercise } from "../types";
import AddExerciseModal from "../AddExerciseModal";

type Props = {
  exercises: RichExercise[];
  onCreate?: (ex: RichExercise) => void;
  onEdit?: (ex: RichExercise) => void;
  onDelete?: (id: string) => void;
};

export default function ListOfExercise({ exercises, onCreate, onEdit, onDelete }: Props) {
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Ejercicios</h3>
        <button className="rounded bg-primary px-3 py-1 text-white" onClick={() => setOpenAdd(true)}>Añadir ejercicio</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-sm text-left">
              <th className="p-2">Id</th>
              <th className="p-2">Label</th>
              <th className="p-2">Type</th>
              <th className="p-2">Movement</th>
              <th className="p-2">Muscles</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.id} className="border-t">
                <td className="p-2 align-top text-sm">{ex.id}</td>
                <td className="p-2 align-top text-sm">{ex.label}</td>
                <td className="p-2 align-top text-sm">{ex.type}</td>
                <td className="p-2 align-top text-sm">{ex.movementPattern}</td>
                <td className="p-2 align-top text-sm">
                  {ex.muscles?.map((m) => `${m.group} (${m.proportion}%)`).join(", ")}
                </td>
                <td className="p-2 align-top text-sm">
                  <div className="flex gap-2">
                    {onEdit ? <button className="rounded border px-2 py-1" onClick={() => onEdit(ex)}>Editar</button> : null}
                    {onDelete ? <button className="rounded border px-2 py-1" onClick={() => onDelete(ex.id)}>Eliminar</button> : null}
                  </div>
                </td>
              </tr>
            ))}
            {exercises.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-sm text-muted-foreground">No hay ejercicios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddExerciseModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreate={(ex) => {
          onCreate?.(ex);
          setOpenAdd(false);
        }}
      />
    </div>
  );
}
