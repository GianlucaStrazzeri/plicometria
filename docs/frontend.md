# Frontend — plicometria-app

Carpeta principal: `components/` y páginas en `app/`.

Estructura y convenciones
- `components/ui/`: primitives (Button, Input, Table, Card, etc.).
- `components/homepage/`: `homepage.tsx` — selector de vistas.
- `components/calendar/`: `CalendarDashboard.tsx` — calendario con FullCalendar y filtros.
- `components/clients/`: `clients.tsx` (tabla + persistencia en `localStorage`), `ClientModal.tsx`.
- `components/listoffoodstobuy/`: `listoffoods.tsx`, `FoodModal.tsx` (CRUD alimentos, `localStorage`).
- `components/plicometria/`: `dashboard.tsx`, `form.tsx`, `table.tsx`, `ComposiciónCorporal.tsx` (modal multi-paso).

Pautas de desarrollo
- Componentes que usan hooks y acceso a `localStorage` deben ser `use client`.
- Mantén la lógica de persistencia (localStorage) en el componente que la necesita.
- Para nuevas páginas, coloca la ruta en `app/` y crea un componente en `components/`.

Claves `localStorage`
- Clientes: `plicometria_clients_v1`
- Lista de alimentos: `shop_foods_v1`

Estilo
- `lib/utils.ts` exporta `cn(...)` (clsx + tailwind-merge) para componer `className` de forma segura.

Ejecutar el frontend localmente
```powershell
npm install
npm run dev
```

Si encuentras problemas de estilos, revisa `globals.css` en `app/` y los componentes en `components/ui/`.