/**
 * components/marketing/LandingClinic.tsx
 * Landing page (marketing) para vender el software de clínica.
 * Diseño premium: navbar, hero con mockup, grid de features, CTA final y footer.
 *
 * Nota: componente estático (Server Component friendly). No usa hooks ni window/localStorage.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import LeadForm from "./leadsform/LeadForm";

import {
  BarChart3,
  CalendarDays,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

// Si ya tienes Button en components/ui, úsalo.
// Si no existe, puedes reemplazar por <button> fácilmente.
import { Button } from "@/components/ui/button";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
};

const FEATURES: Feature[] = [
  {
    title: "Agenda y reprogramación",
    description:
      "Calendario claro, reprogramación rápida y prevención de solapes para optimizar tu día.",
    icon: CalendarDays,
  },
  {
    title: "Historia clínica y pacientes",
    description:
      "Registros estructurados, búsqueda inmediata y acceso seguro en cada sesión.",
    icon: Users,
  },
  {
    title: "Facturación y cobros",
    description:
      "Facturas, estados de pago y trazabilidad en un flujo simple y profesional.",
    icon: ReceiptText,
  },
  {
    title: "Informes y analítica",
    description:
      "KPIs accionables: ocupación, ingresos, recurrencia, y exportación de reportes.",
    icon: BarChart3,
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function LaptopMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-10 rounded-[40px] bg-gradient-to-r from-sky-200/50 via-blue-200/40 to-indigo-200/40 blur-2xl" />
      {/* Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="text-xs font-medium text-slate-500">Dashboard</div>
          <div className="h-6 w-16 rounded-lg bg-slate-100" />
        </div>

        {/* Screen */}
        <div className="p-5">
          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="col-span-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-slate-900" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    NextClinic
                  </div>
                  <div className="text-xs text-slate-500">Software</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-9 rounded-xl bg-slate-900/5" />
                <div className="h-9 rounded-xl bg-slate-900/5" />
                <div className="h-9 rounded-xl bg-slate-900/5" />
                <div className="h-9 rounded-xl bg-slate-900/5" />
              </div>
            </div>

            {/* Main */}
            <div className="col-span-8 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs text-slate-500">Citas</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    1.250
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs text-slate-500">Pacientes</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    85
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs text-slate-500">Ingresos</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    12.460€
                  </div>
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Rendimiento
                  </div>
                  <div className="h-7 w-24 rounded-xl bg-slate-100" />
                </div>
                <div className="h-36 rounded-2xl bg-gradient-to-b from-slate-100 to-white p-4">
                  <div className="h-full w-full rounded-xl border border-slate-200 bg-white" />
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Pacientes
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Próximas visitas
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                    <div className="h-8 rounded-xl bg-slate-900/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="mx-auto mt-3 h-4 w-[85%] rounded-b-[28px] bg-slate-200/70" />
    </div>
  );
}

export default function LandingClinic() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSource, setLeadSource] = useState("");

  return (
    <main className="min-h-screen bg-white">
      {/* Fondo suave */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-slate-50 via-white to-white" />

      {/* Navbar */}
      <header className="mx-auto max-w-6xl px-6 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <span className="text-sm font-bold">N</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                NextClinic
              </div>
              <div className="text-xs text-slate-500">Software</div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              href="#home"
            >
              Home
            </a>
            <a
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              href="#pricing"
            >
              Pricing
            </a>
            <Button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Contact
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="mx-auto max-w-6xl px-6 pb-16 pt-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Seguridad y control
              </Badge>
              <Badge>
                <Sparkles className="mr-2 h-4 w-4" />
                UI moderna y rápida
              </Badge>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Software de gestión <span className="text-slate-500">para clínica</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              Centraliza citas, pacientes, facturación e informes en una plataforma
              clara, rápida y segura. Diseñado para equipos que quieren escalar sin
              complejidad.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-xl bg-slate-900 px-6 py-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800">
                Empezar ahora
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white px-6 py-6 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                onClick={() => {
                  setLeadSource("Solicitar demo");
                  setLeadOpen(true);
                }}
              >
                Solicitar demo
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Onboarding</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  1 día
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Soporte</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Humano
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Cumplimiento</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  RGPD
                </div>
              </div>
            </div>
          </div>

          <LaptopMock />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Features
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5">
                    <Icon className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {f.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button className="rounded-xl bg-slate-900 px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800">
            Empezar
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            ¿Listo para empezar?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Activa tu cuenta o agenda una demo guiada. Incluimos migración y
            onboarding para que el cambio sea inmediato.
          </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="rounded-xl bg-slate-900 px-8 py-6 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={() => {
                setLeadSource("Prueba gratis");
                setLeadOpen(true);
              }}
            >
              Prueba gratis
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white px-8 py-6 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              onClick={() => {
                setLeadSource("Hablar con ventas");
                setLeadOpen(true);
              }}
            >
              Hablar con ventas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-900">NextClinic</div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
      <LeadForm open={leadOpen} source={leadSource} onClose={() => setLeadOpen(false)} />
    </main>
  );
}
