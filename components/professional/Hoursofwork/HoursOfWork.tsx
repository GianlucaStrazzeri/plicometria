"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HourEntry = {
	id: string;
	professionalId?: string | null;
	day: string; // e.g. 'monday'
	start: string; // HH:MM
	end: string; // HH:MM
	notes?: string;
};

type Props = {
	open: boolean;
	onClose: () => void;
	professionalId?: string | null;
};

const STORAGE_KEY = "plicometria_professional_hours_v1";

function makeId() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function HoursOfWork({ open, onClose, professionalId }: Props) {
	const [entries, setEntries] = useState<HourEntry[]>(() => {
		try {
			const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
			if (!raw) return [];
			return JSON.parse(raw) as HourEntry[];
		} catch (e) {
			return [];
		}
	});
	const [day, setDay] = useState("monday");
	const [start, setStart] = useState("09:00");
	const [end, setEnd] = useState("17:00");
	const [notes, setNotes] = useState("");

	// entries initialized from localStorage via useState lazy initializer above

	const saveToStorage = (next: HourEntry[]) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch (e) {
			console.warn("Failed to save hours", e);
		}
	};

	const handleAdd = () => {
		if (!start || !end) return alert("Seleccione hora de inicio y fin");
		if (end <= start) return alert("La hora de fin debe ser posterior a la de inicio");
		const entry: HourEntry = {
			id: makeId(),
			professionalId: professionalId ?? null,
			day,
			start,
			end,
			notes: notes.trim() || undefined,
		};
		const next = [entry, ...entries];
		setEntries(next);
		saveToStorage(next);
		setNotes("");
	};

	const handleDelete = (id: string) => {
		if (!confirm("Eliminar horario?")) return;
		const next = entries.filter((e) => e.id !== id);
		setEntries(next);
		saveToStorage(next);
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="relative z-10 w-full max-w-2xl rounded bg-white p-4 shadow-lg">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium">Horarios de trabajo</h3>
					<div className="flex gap-2">
						<Button variant="outline" onClick={onClose}>Cerrar</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 mb-4">
					<div className="flex gap-2">
						<select aria-label="Día" title="Día" value={day} onChange={(e) => setDay(e.target.value)} className="rounded border px-2 py-1">
							<option value="monday">Lunes</option>
							<option value="tuesday">Martes</option>
							<option value="wednesday">Miércoles</option>
							<option value="thursday">Jueves</option>
							<option value="friday">Viernes</option>
							<option value="saturday">Sábado</option>
							<option value="sunday">Domingo</option>
						</select>

						<label className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Inicio</span>
							<Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
						</label>

						<label className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Fin</span>
							<Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
						</label>
					</div>

					<div>
						<Input placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
					</div>

					<div className="flex justify-end">
						<Button onClick={handleAdd}>Agregar horario</Button>
					</div>
				</div>

				<div>
					<h4 className="font-semibold mb-2">Horarios guardados</h4>
					{entries.length === 0 ? (
						<div className="text-sm text-muted-foreground">No hay horarios definidos.</div>
					) : (
						<div className="space-y-2">
							{entries
								.filter((e) => (professionalId ? String(e.professionalId) === String(professionalId) : true))
								.map((e) => (
									<div key={e.id} className="flex items-center justify-between rounded border p-2">
										<div>
											<div className="font-medium">{e.day} — {e.start} → {e.end}</div>
											<div className="text-sm text-muted-foreground">{e.notes ?? ""}</div>
										</div>
										<div className="flex gap-2">
											<Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>Eliminar</Button>
										</div>
									</div>
								))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

