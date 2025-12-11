"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

type Message = { id: string; role: "user" | "assistant" | "system"; text: string };

type Props = {
  initialMessage?: string;
  autoSend?: boolean;
};

export default function ChatWidget({ initialMessage, autoSend }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // initial system prompt that gives the assistant context about the app
    setMessages([
      { id: "sys-1", role: "system", text: "Eres un asistente que conoce la aplicación Plicometria: clientes, servicios, facturas y citas. Responde de forma concisa y útil." },
    ]);
  }, []);

  // if an initial message is provided and autoSend is true, prefill and send
  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      if (autoSend) {
        // call asynchronously after render
        const t = setTimeout(() => { void handleSend(); }, 120);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, autoSend]);

  const append = (m: Message) => setMessages((s) => [...s, m]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: input.trim() };
    append(userMsg);
    setInput("");
    setLoading(true);

    // Assemble local context from localStorage (clients, services, bills, appointments)
    const context: Record<string, any> = {};
    try {
      const rawClients = localStorage.getItem("plicometria_clients_v1");
      const rawServices = localStorage.getItem("plicometria_services_v1");
      const rawBills = localStorage.getItem("plicometria_bills_v1");
      const rawAppts = localStorage.getItem("plicometria_appointments_v1");
      context.clients = rawClients ? JSON.parse(rawClients) : [];
      context.services = rawServices ? JSON.parse(rawServices) : [];
      context.bills = rawBills ? JSON.parse(rawBills) : [];
      context.appointments = rawAppts ? JSON.parse(rawAppts) : [];
    } catch (e) {
      context.error = "failed to read localStorage";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, context }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      let replyText = data.reply ?? "(sin respuesta)";
      // detect action JSON appended by the assistant: line starting with ACTION_JSON:
      const actionPrefix = "ACTION_JSON:";
      let actionObj: any = null;
      const lines = String(replyText).split(/\r?\n/);
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i].trim();
        if (l.startsWith(actionPrefix)) {
          const jsonPart = l.slice(actionPrefix.length).trim();
          try {
            actionObj = JSON.parse(jsonPart);
            // remove the action line from displayed reply
            lines.splice(i, 1);
            replyText = lines.join("\n");
          } catch (e) {
            // ignore parse errors and keep full reply
          }
          break;
        }
      }

      const assistant: Message = { id: `a-${Date.now()}`, role: "assistant", text: replyText };
      append(assistant);

      // if actionObj is present, execute supported actions
      try {
        if (actionObj && actionObj.action === 'navigate' && typeof actionObj.path === 'string') {
          // small delay to let UI render assistant message
          setTimeout(() => {
            router.push(actionObj.path);
          }, 120);
        }
      } catch (e) {
        console.warn('Failed to execute action from assistant', e);
      }
    } catch (err: any) {
      const assistant: Message = { id: `a-${Date.now()}`, role: "assistant", text: `Error: ${err.message || String(err)}` };
      append(assistant);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border rounded-md p-3 bg-white shadow-sm">
        <div className="mb-3 text-sm text-muted-foreground">Chat (IA) — Pregúntame sobre clientes, servicios, citas o facturas.</div>
        <div className="space-y-2 max-h-72 overflow-auto mb-3">
          {messages.map((m) => (
            <div key={m.id} className={`p-2 rounded ${m.role === "user" ? "bg-primary/10 self-end" : m.role === "assistant" ? "bg-slate-100" : "bg-slate-50 text-xs text-muted-foreground"}`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
            className="flex-1 rounded border px-2 py-1 resize-none h-12"
            disabled={loading}
          />
          <button onClick={handleSend} className="px-3 py-1 rounded bg-primary text-white" disabled={loading}>{loading ? "Enviando..." : "Enviar"}</button>
        </div>
      </div>
    </div>
  );
}
