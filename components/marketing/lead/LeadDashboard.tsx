"use client";

import { useEffect, useState } from "react";
import leadStorage, { Lead } from "./leadStorage";

export default function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    function load() {
      setLeads(leadStorage.getLeads());
    }
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Leads recopilados</h3>
        <div className="text-sm text-muted-foreground">{leads.length} total</div>
      </div>

      {leads.length === 0 ? (
        <div className="text-sm text-muted-foreground">No hay leads recogidos todavía.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-1">Nombre</th>
                <th className="py-1">Contacto</th>
                <th className="py-1">Clínica</th>
                <th className="py-1">Usuarios</th>
                <th className="py-1">Origen</th>
                <th className="py-1">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="py-2">{l.firstName} {l.lastName}</td>
                  <td className="py-2">{l.phone || "-"} / {l.email || "-"}</td>
                  <td className="py-2">{l.hasClinic ? "Sí" : "No"}</td>
                  <td className="py-2">{l.usersCount}</td>
                  <td className="py-2">{l.source || "homepage"}</td>
                  <td className="py-2">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex gap-2 justify-end">
        <button className="px-2 py-1 rounded border" onClick={() => { leadStorage.clearLeads(); setLeads([]); }}>Borrar todo</button>
      </div>
    </div>
  );
}
