"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { EXERCISES } from "./exercisesData";
import AddExerciseModal from "./AddExerciseModal";
import { ExerciseType, MovementPattern } from "./types";
import type { RichExercise } from "./types";
import ListOfExercise from "./listofexercise/listOfExercise";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ClientModal, { type Client as ModalClient } from "@/components/clients/ClientModal";

// Reuse the Client type exported by ClientModal for consistency
type Client = ModalClient;
type Assignment = {
	id: string;
	clientId: string | null;
	exerciseLabel: string;
	targetSeries?: number;
	targetReps?: number;
};

// Additional enums/types for the richer exercise structure requested
// types moved to ./types.ts

// Use the same localStorage key as the clients page so data is shared.
const CLIENTS_KEY = "plicometria_clients_v1";
const ASSIGNMENTS_KEY = "cr_assignments_v1";

export default function ExercisePage() {
	const [clients, setClients] = useState<Client[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);

	const [newClientName, setNewClientName] = useState("");
	const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
	const [clientQuery, setClientQuery] = useState("");
	const [clientModalOpen, setClientModalOpen] = useState(false);
	const [clientModalInitial, setClientModalInitial] = useState<Client | null>(null);

	const [exerciseLabel, setExerciseLabel] = useState("");
	const [targetReps, setTargetReps] = useState<number | undefined>(undefined);
	const [targetSeries, setTargetSeries] = useState<number | undefined>(undefined);

	// Rich exercises list (initialized from static EXERCISES, but kept in state so user can add)
	const [richExercises, setRichExercises] = useState<RichExercise[]>(() =>
		EXERCISES.map((e) => ({
			id: e.id,
			label: e.name,
			videoTitle: e.name,
			videoUrl: e.videoUrl || undefined,
			type: "STRENGTH" as ExerciseType,
			description: e.description,
			movementPattern: "SQUAT" as MovementPattern,
			muscles: (e.primaryMuscles || []).map((m) => ({ group: m, proportion: Math.floor(100 / (e.primaryMuscles?.length || 1)) })),
		}))
	);

	const [addOpen, setAddOpen] = useState(false);
	const [listOpen, setListOpen] = useState(false);

	const router = useRouter();

	useEffect(() => {
			try {
				const raw = window.localStorage.getItem(CLIENTS_KEY);
				if (raw) setClients(JSON.parse(raw));
			} catch {}
		try {
			const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
			if (raw) setAssignments(JSON.parse(raw));
		} catch {}
	}, []);

	// Avoid writing empty clients to storage on first mount and overwrite
	const isClientsMounted = useRef(false);
	useEffect(() => {
		if (!isClientsMounted.current) {
			isClientsMounted.current = true;
			return;
		}
		try {
			window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
		} catch {}
	}, [clients]);

	useEffect(() => {
		try {
			window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
		} catch {}
	}, [assignments]);

	function addClient() {
		const name = newClientName.trim();
		if (!name) return;
		const c: Client = { id: `c_${Date.now()}`, nombre: name, apellido: "" };
		setClients((s) => [c, ...s]);
		setNewClientName("");
		setSelectedClientId(c.id);
	}

	function addAssignment() {
		if (!exerciseLabel.trim()) return;
		const a: Assignment = {
			id: `a_${Date.now()}`,
			clientId: selectedClientId,
			exerciseLabel: exerciseLabel.trim(),
			targetReps: targetReps || undefined,
			targetSeries: targetSeries || undefined,
		};
		setAssignments((s) => [a, ...s]);
		setExerciseLabel("");
		setTargetReps(undefined);
		setTargetSeries(undefined);
	}

	function removeAssignment(id: string) {
		setAssignments((s) => s.filter((x) => x.id !== id));
	}

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-md sm:max-w-4xl space-y-6 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<h1 className="text-2xl font-semibold">Programador de ejercicios</h1>
					<div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
						<Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/')}>Vistas</Button>
						<Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>Añadir ejercicio</Button>
						<Button variant="outline" className="w-full sm:w-auto" onClick={() => setListOpen(true)}>Listado de ejercicios</Button>
					</div>
				</div>

				<section className="rounded border bg-white p-4">
					<h2 className="font-medium">Clientes</h2>
					<div className="mt-3 flex gap-2">
						<input
							className="flex-1 rounded border px-3 py-2 w-full"
							placeholder="Buscar cliente..."
							value={clientQuery}
							onChange={(e) => setClientQuery(e.target.value)}
						/>
						<button
							className="rounded bg-primary px-3 py-2 text-white w-full sm:w-auto"
							onClick={() => {
								setClientModalInitial(null);
								setClientModalOpen(true);
							}}
						>
							Añadir
						</button>
					</div>

					<div className="mt-3 flex flex-wrap gap-2">
						{clients.filter(Boolean).length === 0 && (
							<div className="text-sm text-muted-foreground">No hay clientes</div>
						)}
						{useMemo(() => {
							const q = clientQuery.trim().toLowerCase();
							return clients
								.filter((c) => {
									if (!q) return true;
									return (
										(c.nombre ?? "").toLowerCase().includes(q) ||
										(c.apellido ?? "").toLowerCase().includes(q) ||
										(c.email ?? "").toLowerCase().includes(q) ||
										(c.telefono ?? "").toLowerCase().includes(q)
									);
								})
								.map((c) => (
										<div key={c.id} className="flex gap-2">
											<button
												onClick={() => setSelectedClientId(c.id)}
												className={`rounded border px-3 py-1 ${selectedClientId === c.id ? 'bg-accent text-accent-foreground' : ''}`}
											>
												{c.nombre}{c.apellido ? ` ${c.apellido}` : ""}
											</button>
											<button
												className="rounded border px-3 py-1"
												onClick={() => {
													window.location.href = `/clients/${c.id}/exercises`;
												}}
											>
												Ver ejercicios
											</button>
										</div>
								));
						}, [clients, clientQuery, selectedClientId])}
					</div>
					<ClientModal
						open={clientModalOpen}
						onClose={() => setClientModalOpen(false)}
						initial={clientModalInitial}
						onSave={(data) => {
							// data may be with or without id
							if ((data as any).id) {
								const id = (data as any).id as string;
								setClients((prev) => prev.map((p) => (p.id === id ? { ...p, ...(data as Client) } : p)));
								setSelectedClientId((data as Client).id);
							} else {
								const newC: Client = { id: `c_${Date.now()}`, nombre: (data as any).nombre || "", apellido: (data as any).apellido, email: (data as any).email, telefono: (data as any).telefono, notas: (data as any).notas };
								setClients((prev) => [newC, ...prev]);
								setSelectedClientId(newC.id);
							}
							setClientModalOpen(false);
						}}
						onDelete={(id) => {
							setClients((prev) => prev.filter((p) => p.id !== id));
							setClientModalOpen(false);
							if (selectedClientId === id) setSelectedClientId(null);
						}}
					/>
				</section>

				{/* Exercises are managed via the header buttons and modal; inline list removed */}

				<AddExerciseModal
					open={addOpen}
					onClose={() => setAddOpen(false)}
					onCreate={(ex) => {
						setRichExercises((s) => [ex, ...s]);
						setAddOpen(false);
					}}
				/>

				{listOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						<div className="absolute inset-0 bg-black/40" onClick={() => setListOpen(false)} />
						<div className="relative z-10 w-full max-w-full sm:max-w-4xl rounded bg-white p-4 sm:p-6 shadow-lg h-[90vh] overflow-auto">
							<ListOfExercise
								exercises={richExercises}
								onCreate={(ex) => setRichExercises((s) => [ex, ...s])}
								onDelete={(id) => setRichExercises((s) => s.filter((x) => x.id !== id))}
								onEdit={(ex) => {
									// simple inline edit: replace by id
									setRichExercises((s) => s.map((r) => (r.id === ex.id ? ex : r)));
								}}
							/>
						</div>
					</div>
				)}

				<section className="rounded border bg-white p-4">
					<h2 className="font-medium">Asignar ejercicio</h2>
					<div className="mt-3 grid gap-2 md:grid-cols-3">
						<select
							className="md:col-span-2 rounded border px-3 py-2"
							value={exerciseLabel}
							onChange={(e) => setExerciseLabel(e.target.value)}
						>
							<option value="">Selecciona un ejercicio...</option>
							{richExercises.map((ex) => (
								<option key={ex.id} value={ex.label}>
									{ex.label} {ex.movementPattern ? `(${ex.movementPattern})` : ""}
								</option>
							))}
						</select>
						<input
							type="number"
							className="rounded border px-3 py-2"
							placeholder="Reps"
							value={targetReps ?? ""}
							onChange={(e) => setTargetReps(e.target.value ? Number(e.target.value) : undefined)}
						/>
						<input
							type="number"
							className="rounded border px-3 py-2 md:col-span-2"
							placeholder="Series"
							value={targetSeries ?? ""}
							onChange={(e) => setTargetSeries(e.target.value ? Number(e.target.value) : undefined)}
						/>
						<div className="md:col-span-3 flex justify-end">
							<button className="rounded bg-primary px-3 py-2 text-white" onClick={addAssignment}>
								Asignar al paciente seleccionado
							</button>
						</div>
					</div>
				</section>

				<section className="rounded border bg-white p-4">
					<h2 className="font-medium">Asignaciones</h2>
					<div className="mt-3 space-y-2">
						{assignments.length === 0 && <div className="text-sm text-muted-foreground">No hay asignaciones</div>}
						{assignments.map((a) => (
							<div key={a.id} className="flex items-center justify-between gap-2 rounded border p-2">
								<div>
									<div className="font-semibold">{a.exerciseLabel}</div>
									<div className="text-xs text-muted-foreground">
										{a.targetSeries ? `${a.targetSeries} series · ` : ''}{a.targetReps ? `${a.targetReps} reps` : ''}
										{a.clientId ? ` · Paciente: ${clients.find(c=>c.id===a.clientId)?.nombre ?? a.clientId}` : ' · Sin paciente asignado'}
									</div>
								</div>
								<div className="flex gap-2">
									<button className="rounded border px-2 py-1" onClick={() => removeAssignment(a.id)}>Eliminar</button>
								</div>
							</div>
						))}
					</div>
				</section>

			</div>
		</main>
		);
	}

