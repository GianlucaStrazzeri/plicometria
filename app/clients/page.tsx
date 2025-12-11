/**
 * Página: /clients
 *
 * Propósito:
 * - Punto de entrada para la vista de clientes de la aplicación.
 * - Renderiza el componente `ClientsTable` que proporciona una tabla
 *   con búsqueda y operaciones CRUD (mediante modal) para gestionar
 *   los clientes almacenados localmente o via API.
 *
 * Notas:
 * - Esta página actúa como shell para el componente cliente `ClientsTable`.
 * - `metadata` exportado define el título de la página para SEO.
 */
import ClientsTable from '@/components/clients/clients'

export const metadata = {
  title: 'Clientes',
}

export default function ClientsPage() {
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Clientes</h1>
        <ClientsTable />
      </div>
    </main>
  )
}
