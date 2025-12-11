/**
 * lib/utils.ts
 *
 * Helper `cn(...)` para componer cadenas de clases CSS de forma segura
 * y predecible en componentes React. Combina dos utilidades:
 * - `clsx`: concatenación condicional de clases (soporta strings, arrays,
 *   objetos condicionales, etc.).
 * - `tailwind-merge` (`twMerge`): resuelve y deduplica clases de Tailwind
 *   (por ejemplo, si hay `px-2` y `px-4`, `twMerge` mantiene la última).
 *
 * Exporta la función `cn(...inputs)` que acepta los mismos tipos que
 * `clsx` y devuelve una cadena lista para usar en `className`.
 *
 * Ejemplo de uso:
 *   <div className={cn("p-2", active && "bg-blue-500", "text-sm")} />
 *
 * Beneficios:
 * - Evita concatenaciones manuales y errores por espacios/condiciones.
 * - Resuelve conflictos y dupicados típicos de utilidades Tailwind.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
