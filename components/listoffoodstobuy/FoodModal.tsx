/**
 * components/listoffoodstobuy/FoodModal.tsx
 *
 * Modal cliente para administrar la lista de alimentos usada en la
 * funcionalidad de "lista de compras". Permite crear, editar y eliminar
 * alimentos con campos nutricionales (proteínas, grasas, carbohidratos,
 * azúcares, calorías), duración, tags y notas de vitaminas.
 *
 * Props:
 * - `open`: controla la visibilidad del modal.
 * - `onClose`: callback para cerrar el modal.
 * - `foods`: lista inicial de alimentos (se copia en estado local).
 * - `onChange`: callback llamado con la lista actualizada al guardar.
 *
 * Comportamiento:
 * - Mantiene una copia local de los alimentos para edición en el modal.
 * - Soporta añadir y editar un alimento mediante un formulario inline,
 *   con parseo tolerante de números (coma/punto) y validaciones básicas.
 * - Al confirmar, llama a `onChange` con la lista actualizada.
 *
 * Nota: componente cliente (`"use client"`) porque usa hooks y manejo
 * de estado local/UX.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Food = {
  id: string;
  name: string;
  duration: string;
  proteins: number | null;
  fats: number | null;
  carbs: number | null;
  sugars: number | null;
  vitamins: string;
  caloriesPer100: number | null;
  tags?: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  foods: Food[];
  onChange: (foods: Food[]) => void;
};

export default function FoodModal({ open, onClose, foods: initialFoods, onChange }: Props) {
  const [localFoods, setLocalFoods] = useState<Food[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // form fields for add/edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugars, setSugars] = useState("");
  const [vitamins, setVitamins] = useState("");
  const [caloriesPer100, setCaloriesPer100] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    setLocalFoods(initialFoods ?? []);
  }, [initialFoods, open]);

  if (!open) return null;

  const parseNum = (v: string) => {
    const n = Number(v.toString().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDuration("");
    setProteins("");
    setFats("");
    setCarbs("");
    setSugars("");
    setVitamins("");
    setCaloriesPer100("");
    setTags("");
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleEdit = (f: Food) => {
    setEditingId(f.id);
    setName(f.name);
    setDuration(f.duration);
    setProteins(f.proteins != null ? String(f.proteins) : "");
    setFats(f.fats != null ? String(f.fats) : "");
    setCarbs(f.carbs != null ? String(f.carbs) : "");
    setSugars(f.sugars != null ? String(f.sugars) : "");
    setVitamins(f.vitamins);
    setCaloriesPer100(f.caloriesPer100 != null ? String(f.caloriesPer100) : "");
    setTags((f.tags || []).join(", "));
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("El nombre es obligatorio");
    const payload: Food = {
      id: editingId ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      duration: duration.trim(),
      proteins: parseNum(proteins),
      fats: parseNum(fats),
      carbs: parseNum(carbs),
      sugars: parseNum(sugars),
      vitamins: vitamins.trim(),
      caloriesPer100: parseNum(caloriesPer100),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setLocalFoods((prev) => {
      if (editingId) return prev.map((p) => (p.id === editingId ? payload : p));
      return [payload, ...prev];
    });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar alimento?")) return;
    setLocalFoods((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  };

  const handleSaveAll = () => {
    onChange(localFoods);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Administrar alimentos</h3>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handleStartAdd}>Agregar</Button>
          <Button onClick={resetForm}>Limpiar</Button>
        </div>

        {(isAdding || editingId) && (
          <div className="rounded border p-3 mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Duración</label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Proteínas (g/100g)</label>
                <Input value={proteins} onChange={(e) => setProteins(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Grasas (g/100g)</label>
                <Input value={fats} onChange={(e) => setFats(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Carbohidratos (g/100g)</label>
                <Input value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Azúcares (g/100g)</label>
                <Input value={sugars} onChange={(e) => setSugars(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Vitaminas / Notas</label>
                <Input value={vitamins} onChange={(e) => setVitamins(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Calorías /100g</label>
                <Input value={caloriesPer100} onChange={(e) => setCaloriesPer100(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tags (coma)</label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alimento</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Proteínas</TableHead>
                <TableHead>Grasas</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead>Azúcares</TableHead>
                <TableHead>Cal/100g</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Vitaminas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localFoods.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.duration || "—"}</TableCell>
                  <TableCell>{f.proteins ?? "—"}</TableCell>
                  <TableCell>{f.fats ?? "—"}</TableCell>
                  <TableCell>{f.carbs ?? "—"}</TableCell>
                  <TableCell>{f.sugars ?? "—"}</TableCell>
                  <TableCell>{f.caloriesPer100 ?? "—"}</TableCell>
                  <TableCell>{(f.tags || []).join(", ") || "—"}</TableCell>
                  <TableCell>{f.vitamins || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(f)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(f.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleSaveAll}>Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
