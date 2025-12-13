# Project structure — plicometria-app

Este documento ofrece una visión rápida de la estructura del proyecto, qué hace cada carpeta/archivo relevante y notas prácticas para desarrollar/desplegar.

> Nota: está escrito para desarrolladores que trabajan sobre el repo en `c:\Users\...\plicometria-app`.

---

## Resumen rápido

- Framework: Next.js (App Router) con carpeta `app/`.
- ORM/DB: Prisma (v7) con SQLite durante desarrollo (archivo `prisma/schema.prisma`).
- UI: componentes React cliente (`use client`) con primitives tipo shadcn (carpeta `components/ui`).
- Almacenamiento local: algunas listas usan `localStorage` (clients, listoffoods).

---

## Comandos útiles

- Instalar dependencias:

```powershell
npm install
```

- Ejecutar en modo desarrollo:

```powershell
npm run dev
```

- Construir para producción:

```powershell
npm run build
```

- Nota: antes de desplegar en Vercel o similar, configura `DATABASE_URL` en las variables de entorno.

---

## Archivos / carpetas principales

- `package.json`, `tsconfig.json`, `next.config.ts` — configuración del proyecto.

- `app/` — App Router de Next.js. Contiene las páginas de la aplicación.
  - `app/page.tsx` — página principal (renderiza el `Homepage` selector).
  - `app/plicometria/page.tsx` — página que monta el dashboard de plicometría.
  - `app/calendar/page.tsx` — página que monta `CalendarDashboard`.
  - `app/clients/page.tsx` — página que monta la vista de clientes.
  - `app/listoffoods/page.tsx` — página para la lista de compras/alimentos.
  - `app/api/appointments/route.ts` — API route para obtener citas (`/api/appointments`).
    - Importante: la API usa `getPrisma()` (lazy) y requiere runtime Node; ver `lib/prisma.ts`.

- `components/` — componentes UI organizados por función.
  - `components/ui/` — primitives (Button, Input, Table, Card, etc.).
  - `components/homepage/homepage.tsx` — selector de vistas (la landing interna).
  - `components/calendar/CalendarDashboard.tsx` — calendario (FullCalendar) y filtros.
  - `components/clients/`:
    - `clients.tsx` — tabla de clientes con búsqueda y persistencia en `localStorage`.
    - `ClientModal.tsx` — modal para crear/editar/eliminar clientes.
    - `localStorage` key: `plicometria_clients_v1`.
  - `components/listoffoodstobuy/`:
    - `listoffoods.tsx` — tabla y UI para administrar alimentos; guardado en `localStorage`.
    - `FoodModal.tsx` — modal para CRUD completo en la lista de alimentos.
    - `localStorage` key: `shop_foods_v1`.
  - `components/plicometria/`:
    - `dashboard.tsx` — panel principal que combina `PlicometriaForm` y `PlicometriaTable`.
    - `form.tsx` — formulario para crear un registro de plicometría; abre `ComposiciónCorporal`.
    - `table.tsx` — tabla que muestra los registros de la sesión.
    - `ComposiciónCorporal.tsx` — modal multi-paso que recoge porcentajes, peso/altura, pliegues y calcula IMC y una estimación de calorías de mantenimiento.

- `lib/` — utilidades.
  - `lib/utils.ts` — helper `cn(...)` (clsx + tailwind-merge).
  - `lib/prisma.ts` — *punto crítico*: implementa `getPrisma()` usando import dinámico para evitar que adaptadores nativos (ej. better-sqlite3) se carguen durante el build/SSR en plataformas serverless. Todas las API routes que usan Prisma deben solicitar `await getPrisma()` en tiempo de ejecución.

- `prisma/` — esquema y migraciones:
  - `schema.prisma` — modelo de datos.
  - `migrations/` — migraciones aplicadas.

- `public/` — activos estáticos.

- `README.md` — información general del repositorio (puede estar incompleto; este archivo complementa lo que falte).

---

## Notas técnicas y recomendaciones

- Prisma & Serverless: el proyecto ya cambió `lib/prisma.ts` para inicializar Prisma de forma perezosa y evitar errores en el build de Vercel relacionados con adaptadores nativos (ej. `@prisma/adapter-better-sqlite3`). Si vas a desplegar en Vercel, considera usar una base de datos gestionada (Postgres) en producción y configurar `DATABASE_URL` en el panel de Vercel.

- API Routes: `app/api/appointments/route.ts` fuerza `export const runtime = 'nodejs'` y usa `await getPrisma()` — si creas nuevas rutas que usan Prisma, copia el mismo patrón.

- LocalStorage keys: busca `plicometria_clients_v1` y `shop_foods_v1` en el código si quieres resetear datos de desarrollo.

- Archivos con acentos: algunos componentes usan nombres con acentos (`ComposiciónCorporal.tsx`). Esto funciona localmente en Windows/Unix, pero para evitar problemas de compatibilidad (CI, Docker, algunos entornos) podrías considerar renombrarlos a ASCII (`ComposicionCorporal.tsx`).

---

## Dónde buscar funcionalidades concretas

- Calendario / Citas: `components/calendar/CalendarDashboard.tsx` y API `app/api/appointments/route.ts`.
- Clientes: `components/clients/clients.tsx` + `ClientModal.tsx`.
- Plicometría: `components/plicometria/*` (dashboard/form/table/ComposiciónCorporal).
- Lista de alimentos / compras: `components/listoffoodstobuy/*`.
- Helpers CSS/Tailwind: `lib/utils.ts` (`cn`).

---

## Sugerencias para próximos pasos

- Ejecutar `npm run build` localmente para verificar que `lib/prisma.ts` y las rutas funcionan bien en modo producción.
- Revisar `app/api/*` y actualizar para usar `getPrisma()` si alguna ruta crea el cliente a nivel de módulo.
- (Opcional) Crear documentación por componente para los más críticos (práctico para otros colaboradores).

---

Si quieres, puedo:
- Añadir este archivo al control de versiones con un commit (si quieres que haga el commit, dime el mensaje deseado).
- Generar documentación más detallada por carpeta o crear un `docs/` con páginas separadas por área (API, Frontend, Database).

¿Qué prefieres que haga a continuación?
