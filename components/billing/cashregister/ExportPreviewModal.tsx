"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Props = {
  open: boolean;
  filename?: string;
  headers: string[];
  rows: Array<Array<string|number|undefined>>;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ExportPreviewModal({ open, filename, headers, rows, onClose, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Previsualizar exportación</h3>
        <div className="text-sm text-muted-foreground">Archivo: {filename}</div>
        <div className="mt-4 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 200).map((r, i) => (
                <TableRow key={i}>
                  {r.map((c, j) => (
                    <TableCell key={j} className="max-w-xs truncate">{String(c ?? "")}</TableCell>
                  ))}
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={headers.length} className="p-4 text-center text-sm text-muted-foreground">No hay filas para previsualizar.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Mostrando {Math.min(rows.length, 200)} de {rows.length} filas</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={onConfirm}>Descargar CSV</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
