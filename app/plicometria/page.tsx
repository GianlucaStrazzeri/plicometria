/**
 * Página: /plicometria
 *
 * Propósito:
 * - Actuar como punto de entrada para la funcionalidad de plicometría.
 * - Renderiza `PlicometriaDashboard`, que contiene el formulario de
 *   registro de pliegues, historial en la sesión y la lógica de UI
 *   relacionada (modal de composición corporal, cálculos rápidos, etc.).
 *
 * Notas:
 * - `PlicometriaDashboard` es un componente cliente que gestiona estado
 *   local de registros y la interacción con formularios/modales.
 * - Esta página exporta `metadata` para el título de la página.
 */
import { PlicometriaDashboard } from '@/components/plicometria/dashboard'

export const metadata = {
  title: 'Plicometría',
}

export default function PlicometriaPage() {
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto">
        <PlicometriaDashboard />
      </div>
    </main>
  )
}
