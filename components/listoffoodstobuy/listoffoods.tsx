/**
 * components/listoffoodstobuy/listoffoods.tsx
 *
 * Componente cliente que muestra y administra la lista de alimentos para
 * la funcionalidad de "lista de compras". Proporciona una tabla con
 * búsquedas básicas, persistencia en `localStorage` (clave
 * `shop_foods_v1`) y operaciones CRUD (añadir, editar, eliminar) tanto
 * inline como mediante el `FoodModal` cuando corresponde.
 *
 * Comportamiento y responsabilidades:
 * - Carga y guarda la lista de alimentos en `localStorage`.
 * - Permite filtrar por nombre/tags y editar elementos inline.
 * - Normaliza la entrada numérica (coma/punto) y maneja campos
 *   nutricionales (proteínas, grasas, carbohidratos, calorías, etc.).
 * - Está diseñado como componente del lado cliente (`"use client"`) ya
 *   que usa hooks, `localStorage` y UX interactiva.
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import FoodModal from "./FoodModal";

type Food = {
  id: string;
  name: string;
  duration: string; // e.g. "7 days", "2 weeks", "6 months"
  proteins: number | null; // g per 100g
  fats: number | null; // g per 100g
  carbs: number | null; // g per 100g
  sugars: number | null; // g per 100g
  vitamins: string; // free text
  caloriesPer100: number | null; // kcal per 100g
  tags?: string[]; // apto para
};

const STORAGE_KEY = "shop_foods_v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ListOfFoods() {
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // form fields
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFoods(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to read foods from storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
    } catch (e) {
      console.warn("Failed to save foods to storage", e);
    }
  }, [foods]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => {
      return (
        f.name.toLowerCase().includes(q) ||
        f.vitamins.toLowerCase().includes(q) ||
        (f.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, foods]);

  const clearForm = () => {
    setName("");
    setDuration("");
    setProteins("");
    setFats("");
    setCarbs("");
    setSugars("");
    setVitamins("");
    setCaloriesPer100("");
    setTags("");
    setEditing(null);
  };

  const openNew = () => {
    clearForm();
    setShowForm(true);
  };

  const openEdit = (f: Food) => {
    setEditing(f);
    setName(f.name);
    setDuration(f.duration);
    setProteins(f.proteins != null ? String(f.proteins) : "");
    setFats(f.fats != null ? String(f.fats) : "");
    setCarbs(f.carbs != null ? String(f.carbs) : "");
    setSugars(f.sugars != null ? String(f.sugars) : "");
    setVitamins(f.vitamins);
    setCaloriesPer100(f.caloriesPer100 != null ? String(f.caloriesPer100) : "");
    setTags((f.tags || []).join(", "));
    setShowForm(true);
  };

  const parseNum = (v: string) => {
    const n = Number(v.toString().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = () => {
    if (!name.trim()) return alert("El nombre es obligatorio");
    const payload: Food = {
      id: editing ? editing.id : makeId(),
      name: name.trim(),
      duration: duration.trim() || "",
      proteins: parseNum(proteins),
      fats: parseNum(fats),
      carbs: parseNum(carbs),
      sugars: parseNum(sugars),
      vitamins: vitamins.trim(),
      caloriesPer100: parseNum(caloriesPer100),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (editing) {
      setFoods((prev) => prev.map((p) => (p.id === editing.id ? payload : p)));
    } else {
      setFoods((prev) => [payload, ...prev]);
    }

    setShowForm(false);
    clearForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar alimento?")) return;
    setFoods((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4 mx-auto w-full max-w-md p-4 sm:max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full">
          <Input
            aria-label="Buscar alimentos"
            placeholder="Buscar por nombre, vitaminas o tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-300"
          />
        </div>

        <div className="w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full sm:w-auto" onClick={openNew}>Agregar</Button>
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setShowModal(true)}>Administrar (modal)</Button>
            <Button className="w-full sm:w-auto" variant="ghost" onClick={() => router.push('/')}>Vistas</Button>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="rounded border p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Duración / conservación</label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej. 7 días / 1 semana" />
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
              <label className="text-xs font-medium text-muted-foreground">Vitaminas / Observaciones</label>
              <Input value={vitamins} onChange={(e) => setVitamins(e.target.value)} placeholder="Ej. Vitamina C, B12; útil para tiroides" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Calorías por 100g (kcal)</label>
              <Input value={caloriesPer100} onChange={(e) => setCaloriesPer100(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Apto para (tags, separado por coma)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ej. mejorar tiroides, bajo en sodio" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); clearForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alimento</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Proteínas (g)</TableHead>
            <TableHead>Grasas (g)</TableHead>
            <TableHead>Carbs (g)</TableHead>
            <TableHead>Azúcares (g)</TableHead>
            <TableHead>Calorías/100g</TableHead>
            <TableHead>Apto para</TableHead>
            <TableHead>Vitaminas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((f) => (
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
                  <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(f.id)}>
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="p-4 text-center text-sm text-muted-foreground">
                No hay alimentos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <FoodModal open={showModal} onClose={() => setShowModal(false)} foods={foods} onChange={(f) => setFoods(f)} />
    </div>
  );
}
