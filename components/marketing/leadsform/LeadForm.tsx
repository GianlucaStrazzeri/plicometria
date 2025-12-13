"use client";

import React, { useState, useEffect } from "react";

type Props = {
  open: boolean;
  source?: string;
  onClose: () => void;
};

export default function LeadForm({ open, source = "", onClose }: Props): React.ReactElement | null {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (open) {
      setStatus("idle");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, message, source }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Solicitar información</h3>
            <p className="text-xs text-slate-500">Fuente: {source || "Web"}</p>
          </div>
          <button
            className="rounded-md bg-slate-100 px-3 py-1 text-sm"
            onClick={onClose}
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="lead-name" className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
            <input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="lead-email" className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input
              id="lead-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lead-phone" className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
              <input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="lead-company" className="mb-1 block text-xs font-medium text-slate-600">Empresa (opcional)</label>
              <input
                id="lead-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead-message" className="mb-1 block text-xs font-medium text-slate-600">Mensaje (opcional)</label>
            <textarea
              id="lead-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Acepto que mis datos sean usados para contactarme.</div>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="mr-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {status === "sending" ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>

          {status === "success" && <div className="mt-2 text-sm text-green-600">Gracias — te contactamos pronto.</div>}
          {status === "error" && <div className="mt-2 text-sm text-red-600">Error al enviar. Intenta de nuevo.</div>}
        </form>
      </div>
    </div>
  );
}
