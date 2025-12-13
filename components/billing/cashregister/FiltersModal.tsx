"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
  startDate: string | null;
  endDate: string | null;
  onApply: (start: string | null, end: string | null) => void;
  onClear?: () => void;
  onExportPayments?: () => void;
  onExportExpenses?: () => void;
};

export default function FiltersModal({ open, onClose, startDate, endDate, onApply, onClear, onExportPayments, onExportExpenses }: Props) {
  const [start, setStart] = useState<string | null>(startDate ?? null);
  const [end, setEnd] = useState<string | null>(endDate ?? null);

  // keep local state in sync when modal opens/closes
  React.useEffect(() => {
    if (!open) return;
    setStart(startDate ?? null);
    setEnd(endDate ?? null);
  }, [open, startDate, endDate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Filtros de pagos</h3>

        <div className="mt-3 grid gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input type="date" value={start ?? ""} onChange={(e) => setStart(e.target.value || null)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input type="date" value={end ?? ""} onChange={(e) => setEnd(e.target.value || null)} />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onExportPayments?.()}>Exportar pagos CSV</Button>
            <Button variant="outline" onClick={() => onExportExpenses?.()}>Exportar gastos CSV</Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onClear?.(); onClose(); }}>Limpiar</Button>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => { onApply(start, end); onClose(); }}>Aplicar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
