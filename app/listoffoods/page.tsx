/**
 * Página: /listoffoods
 *
 * Propósito:
 * - Punto de entrada para la lista de alimentos/ingredientes del usuario.
 * - Renderiza `ListOfFoods`, un componente cliente que ofrece una tabla
 *   con datos nutricionales (proteínas, grasas, carbohidratos, azúcares,
 *   vitaminas, calorías/100g), duración del alimento y etiquetas "apto para".
 *
 * Comportamiento:
 * - `ListOfFoods` maneja CRUD local (localStorage) y también expone un
 *   modal para administrar la lista completa. Esta página actúa como shell
 *   para dicho componente.
 */
import ListOfFoods from '@/components/listoffoodstobuy/listoffoods'

export const metadata = {
  title: 'Lista de alimentos',
}

export default function ListOfFoodsPage() {
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Lista de alimentos</h1>
        <ListOfFoods />
      </div>
    </main>
  )
}
