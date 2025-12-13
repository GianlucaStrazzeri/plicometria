"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
	{ label: "Docs (Documentación)", path: "/docs" },
	{ label: "Leads (Marketing)", path: "/leads" },
	{ label: "Connections", path: "/connections" },
];

export default function Homepage() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(true);
	const [open, setOpen] = useState(false);

	// actualizar listener existente para también manejar "try it"
	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			const target = e.target as Element | null;
			if (!target) return;
			const btn = target.closest("button");
			if (!btn) return;
			const text = (btn.textContent || "").trim().toLowerCase();

			// abrir panel si el botón dice "vista"
			if (text === "vista") {
				e.preventDefault();
				setOpen(true);
				return;
			}

			// nuevo: si el botón contiene "try it" y estamos en "/", navegar a /clients
			if (/^try\s*it$/i.test(text) && window.location.pathname === "/") {
				e.preventDefault();
				router.push("/clients");
			}
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		const onOpenEvent = () => setOpen(true);

		document.addEventListener("click", onClick);
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("open-homepage", onOpenEvent);

		return () => {
			document.removeEventListener("click", onClick);
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("open-homepage", onOpenEvent);
		};
	}, [router]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return ROUTES;
		return ROUTES.filter(
			(r) => r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
		);
	}, [query]);

	// drag-to-scroll refs/state
	const listRef = useRef<HTMLUListElement | null>(null);
	const draggingRef = useRef(false);
	const startYRef = useRef(0);
	const startScrollRef = useRef(0);

	const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
		const el = listRef.current;
		if (!el) return;
		draggingRef.current = true;
		startYRef.current = e.clientY;
		startScrollRef.current = el.scrollTop;
		try {
			(e.target as Element).setPointerCapture?.(e.pointerId);
		} catch {}
		el.style.cursor = "grabbing";
	};

	const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
		if (!draggingRef.current) return;
		const el = listRef.current;
		if (!el) return;
		const dy = e.clientY - startYRef.current;
		el.scrollTop = startScrollRef.current - dy;
	};

	const endDrag = (e?: React.PointerEvent<HTMLUListElement>) => {
		draggingRef.current = false;
		const el = listRef.current;
		if (el) el.style.cursor = "grab";
		if (e) {
			try {
				(e.target as Element).releasePointerCapture?.(e.pointerId);
			} catch {}
		}
	};

	// keep component mounted (listeners active) but hide UI when !open
	if (!open) return null;

	return (
		/* overlay centrado en pantalla */
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="w-full max-w-xs md:max-w-md rounded bg-white p-3 shadow-lg">
				{/* header con cerrar */}
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-sm font-semibold">Navegación rápida</h2>
					<button
						aria-label="Cerrar buscador"
						onClick={() => setOpen(false)}
						className="text-xs px-2 py-1 rounded hover:bg-slate-100"
					>
						Cerrar
					</button>
				</div>

				<label className="block text-xs font-medium mb-1">Buscar</label>
				<input
					aria-label="Buscar rutas"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setShowSuggestions(true);
					}}
					onFocus={() => setShowSuggestions(true)}
					onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
					className="w-full rounded border px-2 py-1 text-sm mb-2"
					placeholder="Ej: clientes, calendario..."
				/>

				{showSuggestions && (
					<div>
							<ul
								id="route-suggest-list"
								ref={listRef}
								className="homepage-suggestions rounded border bg-white"
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={endDrag}
							onPointerCancel={endDrag}
							onPointerLeave={endDrag}
						>
							{(query ? filtered : ROUTES).map((r) => (
								<li
									key={r.path}
									onMouseDown={() => {
										router.push(r.path);
										setOpen(false);
									}}
									className="px-2 py-1 hover:bg-slate-50 cursor-pointer"
								>
									<div className="text-sm font-medium">{r.label}</div>
									<div className="text-xs text-muted-foreground">{r.path}</div>
								</li>
							))}
							{filtered.length === 0 && (
								<li className="px-2 py-1 text-sm text-muted-foreground">
									No hay sugerencias
								</li>
							)}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
