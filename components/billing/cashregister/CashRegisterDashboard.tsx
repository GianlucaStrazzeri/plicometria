"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import ExportPreviewModal from "./ExportPreviewModal";
import AddPaymentModal from "./AddPaymentModal";
import AddExpenseModal from "./AddExpenseModal";
import PaymentsTable from "./PaymentsTable";
import ExpensesTable from "./ExpensesTable";
import FiltersModal from "./FiltersModal";
import type { Payment, Expense } from "./types";

export default function CashRegisterDashboard() {
  const [showPayment, setShowPayment] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cash_register_payments_v1") : null;
      if (raw) return JSON.parse(raw) as Payment[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cash_register_expenses_v1") : null;
      if (raw) return JSON.parse(raw) as Expense[];
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');

  // payments & expenses are initialized lazily from localStorage above

  const filteredPayments = useMemo(() => {
    if (!startDate && !endDate) return payments;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return payments.filter((p) => {
      const d = new Date(p.date);
      if (start && d < start) return false;
      if (end) {
        // include day end
        const dayEnd = new Date(end);
        dayEnd.setHours(23,59,59,999);
        if (d > dayEnd) return false;
      }
      return true;
    });
  }, [payments, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    if (!startDate && !endDate) return expenses;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return expenses.filter((p) => {
      const d = new Date(p.date);
      if (start && d < start) return false;
      if (end) {
        const dayEnd = new Date(end);
        dayEnd.setHours(23,59,59,999);
        if (d > dayEnd) return false;
      }
      return true;
    });
  }, [expenses, startDate, endDate]);

  const totals = useMemo(() => {
    const byMethod: Record<string, number> = {};
    filteredPayments.forEach((p) => { byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; });
    const totalPayments = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const totalExpenses = filteredExpenses.reduce((s, x) => s + x.amount, 0);
    return { byMethod, totalPayments, totalExpenses, net: totalPayments - totalExpenses };
  }, [filteredPayments, filteredExpenses]);

  const toast = useToast();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Array<Array<string|number|undefined>>>([]);
  const [previewFilename, setPreviewFilename] = useState<string | undefined>(undefined);

  const downloadCSV = (filename: string, headers: string[], rows: Array<Array<string|number|undefined>>) => {
    const escape = (v: any) => {
      if (v === undefined || v === null) return "";
      const s = String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n');
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.push({ title: 'Exportado', description: `${filename} descargado`, kind: 'success' });
    } catch (err) {
      console.warn(err);
      toast.push({ title: 'Error', description: 'No se pudo generar CSV', kind: 'error' });
    }
  };
  const exportPaymentsCSV = () => {
    if (!filteredPayments || filteredPayments.length === 0) { toast.push({ title: 'Sin datos', description: 'No hay pagos para exportar', kind: 'info' }); return; }
    const headers = ['fecha','cliente','monto','metodo','nota'];
    const rows = filteredPayments.map(p => [p.date, p.client ?? '', p.amount, p.method, p.note ?? '']);
    const filename = `pagos_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    setPreviewHeaders(headers);
    setPreviewRows(rows);
    setPreviewFilename(filename);
    setPreviewOpen(true);
  };

  const exportExpensesCSV = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) { toast.push({ title: 'Sin datos', description: 'No hay gastos para exportar', kind: 'info' }); return; }
    const headers = ['fecha','descripcion','monto','nota'];
    const rows = filteredExpenses.map(e => [e.date, e.description, e.amount, e.note ?? '']);
    const filename = `gastos_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    setPreviewHeaders(headers);
    setPreviewRows(rows);
    setPreviewFilename(filename);
    setPreviewOpen(true);
  };

  const confirmDownloadPreview = () => {
    if (!previewFilename) return;
    downloadCSV(previewFilename, previewHeaders, previewRows);
    setPreviewOpen(false);
  };

  return (
    <div className="space-y-4 p-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Caja / Registro de pagos</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowPayment(true)}>Registrar pago</Button>
          <Button variant="destructive" onClick={() => setShowExpense(true)}>Registrar gasto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-3 flex gap-2 items-center">
          <div>
            <Button variant="outline" onClick={() => setShowFilters(true)}>Filtros</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {startDate || endDate ? (
              <span>
                {startDate ? `Desde ${startDate}` : ""} {startDate && endDate ? " — " : ""} {endDate ? `Hasta ${endDate}` : ""}
              </span>
            ) : (
              <span>No hay filtros activos</span>
            )}
          </div>

          <div className="ml-auto" />
        </div>

        <div className="rounded border p-3">
          <div className="text-sm text-muted-foreground">Totales por método</div>
          <ul className="mt-2">
            {Object.entries(totals.byMethod).length === 0 && <li className="text-sm">No hay pagos.</li>}
            {Object.entries(totals.byMethod).map(([m, v]) => (
              <li key={m} className="flex justify-between"><span className="capitalize">{m}</span><span>{Number(v).toFixed(2)} €</span></li>
            ))}
          </ul>
        </div>

        <div className="rounded border p-3">
          <div className="text-sm text-muted-foreground">Ingresos</div>
          <div className="text-xl font-semibold">{Number(totals.totalPayments).toFixed(2)} €</div>
        </div>

        <div className="rounded border p-3">
          <div className="text-sm text-muted-foreground">Gastos</div>
          <div className="text-xl font-semibold">{Number(totals.totalExpenses).toFixed(2)} €</div>
          <div className="text-sm">Neto: {Number(totals.net).toFixed(2)} €</div>
        </div>
      </div>

      <div className="rounded border p-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${activeTab === 'payments' ? 'bg-gray-100' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Pagos
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTab === 'expenses' ? 'bg-gray-100' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Gastos
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => activeTab === 'payments' ? exportPaymentsCSV() : exportExpensesCSV()}>
              Exportar CSV ({activeTab === 'payments' ? 'Pagos' : 'Gastos'})
            </Button>
            <Button variant="ghost" onClick={() => { setActiveTab('payments'); setStartDate(null); setEndDate(null); }}>
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'payments' ? <PaymentsTable /> : <ExpensesTable />}
        </div>
      </div>

      <AddPaymentModal open={showPayment} onClose={() => setShowPayment(false)} />
      <AddExpenseModal open={showExpense} onClose={() => setShowExpense(false)} />
      <ExportPreviewModal open={previewOpen} filename={previewFilename} headers={previewHeaders} rows={previewRows} onClose={() => setPreviewOpen(false)} onConfirm={confirmDownloadPreview} />
      <FiltersModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        startDate={startDate}
        endDate={endDate}
        onApply={(s,e)=>{ setStartDate(s); setEndDate(e); }}
        onClear={() => { setStartDate(null); setEndDate(null); }}
        onExportPayments={() => exportPaymentsCSV()}
        onExportExpenses={() => exportExpensesCSV()}
      />
    </div>
  );
}
