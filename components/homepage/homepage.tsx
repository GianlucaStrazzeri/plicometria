/**
 * components/homepage/homepage.tsx
 *
 * Página de inicio simple que actúa como un lanzador de vistas. Muestra
 * un selector para navegar a las secciones principales de la app
 * (`/plicometria`, `/calendar`, `/clients`, `/listoffoods`).
 *
 * Comportamiento:
 * - Es un componente cliente (`"use client"`) porque usa hooks y
 *   navegación desde el cliente (`useRouter`).
 * - Mantiene el valor seleccionado en estado local y redirige cuando
 *   el usuario pulsa "Ir".
 * - No realiza fetch ni tiene lógica de servidor; su responsabilidad
 *   es únicamente la navegación/UX inicial.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ChatWidget from "@/components/chat/ChatWidget";
import LeadForm from "@/components/marketing/leadsform/LeadForm";
import LeadsListModal from "@/components/marketing/leadsform/LeadsListModal";
// Button removed: navigation happens immediately on select change

export default function Homepage() {
	const router = useRouter();
	const [choice, setChoice] = useState("");
	const [counts, setCounts] = useState({ clients: 0, services: 0, bills: 0, appointments: 0 });
	const [chatOpen, setChatOpen] = useState(false);
	const [leadOpen, setLeadOpen] = useState(false);
	const [leadsOpen, setLeadsOpen] = useState(false);
	const [leadSource, setLeadSource] = useState<string | null>(null);

	useEffect(() => {
		function load() {
			try {
				const rawC = localStorage.getItem('plicometria_clients_v1');
				const rawS = localStorage.getItem('plicometria_services_v1');
				const rawB = localStorage.getItem('plicometria_bills_v1');
				const rawA = localStorage.getItem('plicometria_appointments_v1');
				setCounts({
					clients: rawC ? JSON.parse(rawC).length : 0,
					services: rawS ? JSON.parse(rawS).length : 0,
					bills: rawB ? JSON.parse(rawB).length : 0,
					appointments: rawA ? JSON.parse(rawA).length : 0,
				});
			} catch (e) {
				// ignore
			}
		}

		load();
		window.addEventListener('storage', load);
		return () => window.removeEventListener('storage', load);
	}, []);

	// navigation is handled directly in the select onChange

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
			<div className="max-w-lg w-full rounded bg-white p-6 shadow">
				<h1 className="text-2xl font-semibold mb-2">Hola</h1>
				<p className="text-sm text-muted-foreground mb-4">Accede rápidamente a las secciones principales o crea recursos desde los accesos rápidos.</p>

				<div className="grid grid-cols-2 gap-3 mb-4">
					{/* Card: Clients */}
					<button onClick={() => router.push('/clients')} className="flex flex-col items-start p-3 rounded border hover:shadow-sm text-left">
						<div className="text-2xl">👥</div>
						<div className="mt-2 text-sm font-medium">Clientes</div>
						<div className="text-xs text-muted-foreground">{counts.clients} registrados</div>
					</button>

					{/* Card: Calendar */}
					<button onClick={() => router.push('/calendar')} className="flex flex-col items-start p-3 rounded border hover:shadow-sm text-left">
						<div className="text-2xl">📅</div>
						<div className="mt-2 text-sm font-medium">Calendario</div>
						<div className="text-xs text-muted-foreground">{counts.appointments} citas</div>
					</button>

					{/* Card: Services */}
					<button onClick={() => router.push('/services')} className="flex flex-col items-start p-3 rounded border hover:shadow-sm text-left">
						<div className="text-2xl">🛠️</div>
						<div className="mt-2 text-sm font-medium">Servicios</div>
						<div className="text-xs text-muted-foreground">{counts.services} servicios</div>
					</button>

					{/* Card: Billing */}
					<button onClick={() => router.push('/billing')} className="flex flex-col items-start p-3 rounded border hover:shadow-sm text-left">
						<div className="text-2xl">🧾</div>
						<div className="mt-2 text-sm font-medium">Facturación</div>
						<div className="text-xs text-muted-foreground">{counts.bills} facturas</div>
					</button>

					{/* Card: Chat (opens modal) */}
					{/* Card: Documentation */}
					<button onClick={() => router.push('/docs')} className="flex flex-col items-start p-3 rounded border hover:shadow-sm text-left">
						<div className="text-2xl">📚</div>
						<div className="mt-2 text-sm font-medium">Documentación</div>
						<div className="text-xs text-muted-foreground">Guía del proyecto y SQL</div>
					</button>

						<div className="flex flex-col gap-2">
							<button onClick={() => setChatOpen(true)} className="flex items-center gap-3 p-3 rounded border hover:shadow-sm text-left">
								<div className="text-2xl">💬</div>
								<div>
									<div className="text-sm font-medium">Asistente</div>
									<div className="text-xs text-muted-foreground">Chat IA — pregunta y navega</div>
								</div>
							</button>

							<div className="flex gap-2">
								<button onClick={() => { setChatOpen(true); /* open and prefill example */ setTimeout(()=>{ const el = document.querySelector('#chat-textarea') as HTMLTextAreaElement | null; if(el) { el.value = 'Llévame a clientes'; el.dispatchEvent(new Event('input',{bubbles:true})); el.focus(); } }, 160); }} className="text-xs px-2 py-1 rounded border bg-gray-50">Ej: "Llévame a clientes"</button>
								<button onClick={() => { setChatOpen(true); setTimeout(()=>{ const el = document.querySelector('#chat-textarea') as HTMLTextAreaElement | null; if(el) { el.value = 'Abrir facturación'; el.dispatchEvent(new Event('input',{bubbles:true})); el.focus(); } }, 160); }} className="text-xs px-2 py-1 rounded border bg-gray-50">Ej: "Abrir facturación"</button>
							</div>
						</div>
				</div>

				{/* Marketing quick actions: abrir formulario y registrar cuál botón */}
				<div className="mt-4 flex gap-3 mb-4">
					<button onClick={() => { setLeadSource('interesado_servicios'); setLeadOpen(true); }} className="px-3 py-2 rounded border bg-emerald-50">Quiero información</button>
					<button onClick={() => { setLeadSource('tengo_clinica'); setLeadOpen(true); }} className="px-3 py-2 rounded border bg-amber-50">Tengo una clínica</button>
				</div>

				{/* Select visible on all sizes (mobile + desktop) */}
				<div className="block">
					<label className="block text-sm font-medium text-muted-foreground">Ir a</label>
					<select
						value={choice}
						onChange={(e) => {
							const val = e.target.value;
							setChoice(val);
							if (val) router.push(val);
						}}
						className="w-full rounded border px-3 py-2"
					>
						<option value="">Selecciona una vista...</option>
						<option value="/plicometria">Plicometría </option>
						<option value="/calendar">Calendario</option>
						<option value="/clients">Clientes</option>
						<option value="/exercise">Exercise</option>
						<option value="/professionals">Profesionales</option>
						<option value="/services">Servicios</option>
						<option value="/billing">Facturación</option>
					</select>
				</div>
				{/* Chat modal overlay */}
				{chatOpen ? (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						<div className="absolute inset-0 bg-black/40" onClick={() => setChatOpen(false)} />
						<div className="relative z-10 w-full max-w-lg rounded bg-white p-4 shadow-lg">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-lg font-medium">Asistente (IA)</h3>
								<button className="px-2 py-1 text-sm rounded border" onClick={() => setChatOpen(false)}>Cerrar</button>
							</div>
							<ChatWidget />
						</div>
					</div>
				) : null}

				{/* Lead form modal */}
				{leadOpen ? (
					<LeadForm source={leadSource} onClose={() => { setLeadOpen(false); setLeadSource(null); }} />
				) : null}
			</div>
		</div>
	);
}


// load counts from localStorage on client
// (kept at bottom to avoid hooks ordering complexities)
function useCounts() {
  const [counts, setCounts] = useState({ clients: 0, services: 0, bills: 0, appointments: 0 });
  // this hook is not used directly; component uses effect below
  return [counts, setCounts] as const;
}
