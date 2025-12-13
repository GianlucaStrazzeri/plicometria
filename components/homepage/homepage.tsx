"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ROUTES: { label: string; path: string }[] = [
  { label: "Inicio", path: "/" },
  { label: "Professionals", path: "/professionals" },
  { label: "Training Planner", path: "/training-planner" },
  { label: "Exercise", path: "/exercise" },
  { label: "Plicometría", path: "/plicometria" },
  { label: "List of Foods", path: "/listoffoods" },
  { label: "Services", path: "/services" },
  { label: "Clients", path: "/clients" },
  { label: "Chat", path: "/chat" },
  { label: "Calendar", path: "/calendar" },
  { label: "Billing", path: "/billing" },
];

export default function Homepage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // initial suggestions (most common targets)
  const initialSuggestions = useMemo(() => {
    return ROUTES.filter((r) => ["/clients", "/calendar", "/plicometria"].includes(r.path));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROUTES;
    return ROUTES.filter(
      (r) => r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    // when selected changes, navigate
    if (selected) {
      router.push(selected);
      setSelected("");
    }
  }, [selected, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">¿A dónde quieres ir?</h1>
        <p className="text-sm text-muted-foreground mb-4">Busca o selecciona una ruta para navegar rápidamente por la aplicación.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Buscar</label>
          <input
            aria-label="Buscar rutas"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full rounded border px-3 py-2"
            placeholder="Ej: clientes, calendario, plicometría..."
          />
          {showSuggestions && (
            <ul className="mt-2 max-h-40 overflow-auto rounded border bg-white">
              {(query ? filtered : initialSuggestions).map((r) => (
                <li
                  key={r.path}
                  onMouseDown={() => router.push(r.path)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-xs text-muted-foreground">{r.path}</div>
                </li>
              ))}
              {(!query && initialSuggestions.length === 0) && (
                <li className="px-3 py-2 text-sm text-muted-foreground">No hay sugerencias</li>
              )}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Seleccionar ruta</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">-- Elige una ruta --</option>
            {ROUTES.map((r) => (
              <option key={r.path} value={r.path}>
                {r.label} — {r.path}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
