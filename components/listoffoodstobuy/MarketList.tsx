"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Item = {
  id: string;
  text: string;
  qty?: string;
  bought?: boolean;
};

const STORAGE_KEY = "market_list_v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MarketList({ open, onClose }: Props) {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as Item[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [text, setText] = useState("");
  const [qty, setQty] = useState("");
  const toast = useToast();

  // items are initialized from localStorage via the useState lazy initializer above

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save market list", e);
    }
  }, [items]);

  if (!open) return null;

  const addItem = () => {
    if (!text.trim()) return;
    const it: Item = { id: makeId(), text: text.trim(), qty: qty.trim() || undefined, bought: false };
    setItems((s) => [it, ...s]);
    setText("");
    setQty("");
    toast.push({ title: "Añadido", description: `${it.text} añadido a la lista`, kind: "success" });
  };

  const toggleBought = (id: string) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, bought: !it.bought } : it)));
  };

  const removeItem = (id: string) => {
    if (!confirm("¿Eliminar elemento?")) return;
    setItems((s) => s.filter((it) => it.id !== id));
    toast.push({ title: "Eliminado", description: "Elemento eliminado", kind: "info" });
  };

  const clearBought = () => {
    setItems((s) => s.filter((it) => !it.bought));
  };

  const clearAll = () => {
    if (!confirm("¿Borrar toda la lista?")) return;
    setItems([]);
    toast.push({ title: "Lista borrada", kind: "info" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Lista de compras</h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-muted-foreground">Artículo</label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej. Leche, Manzanas, Pan" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cantidad</label>
            <Input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Ej. 1L, 6" />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button onClick={addItem}>Añadir</Button>
          <Button variant="outline" onClick={clearBought}>Limpiar comprados</Button>
          <Button variant="destructive" onClick={clearAll}>Borrar todo</Button>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className={it.bought ? "line-through text-muted-foreground" : ""}>{it.text}</TableCell>
                  <TableCell>{it.qty ?? "—"}</TableCell>
                  <TableCell>{it.bought ? "Comprado" : "Pendiente"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleBought(it.id)}>
                        {it.bought ? "Desmarcar" : "Marcar"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeItem(it.id)}>Eliminar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="p-4 text-center text-sm text-muted-foreground">No hay artículos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
