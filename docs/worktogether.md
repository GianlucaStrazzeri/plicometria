<!--
  docs/worktogether.md
  - Onboarding notes for contributors: languages, tooling, how to run and common tasks.
-->

# Trabajar Juntos (Work Together)

Este documento explica la estructura principal de dependencias, tecnologías y flujos de trabajo del proyecto para que una persona nueva pueda incorporarse rápidamente.

## Resumen rápido
- Framework: Next.js (app router) con React + TypeScript
- UI: Tailwind CSS (utilidades), componentes UI locales (en `components/ui/`)
- Estado/DB local: `localStorage` usado para datos de ejemplo y cache en el cliente
- Base de datos remota: PostgreSQL (via Supabase) y Prisma (esqueleto en `prisma/`)
- Autenticación / supabase client: en `lib/supabaseClient.ts` y `lib/supabaseServer.ts`
- Linter / formateo: ESLint (config en `eslint.config.mjs`) y TypeScript

## Lenguajes y runtime
- TypeScript (principal) — .ts / .tsx
- JavaScript para scripts en `scripts/` (Node.js)
- CSS: Tailwind (clases utilitarias en JSX/TSX)

## Estructura relevante del repo
- `app/` - páginas (Next.js app router). Aquí están las rutas y páginas.
- `components/` - componentes React reutilizables, organizados por área (billing, calendar, clients, etc.).
- `components/ui/` - primitives (Table, Button, Input, Select, etc.).
- `lib/` - helpers de infra (Prisma client, supabase, utils, auth helpers).
- `prisma/` - esquema de Prisma y migraciones.
- `scripts/` - utilidades de mantenimiento (seed, create_tables, etc.).
- `docs/` - documentación del proyecto (aquí mismo).

## Dependencias clave
- `next` — framework React/SSR
- `react` / `react-dom`
- `typescript` — tipado
- `prisma` — ORM (schema en `prisma/schema.prisma`)
- `@supabase/supabase-js` — cliente Supabase (para accesos a Postgres desde el cliente)
- `pg` — driver Postgres (scripts locales / node)
- ESLint + plugins (`@typescript-eslint`, reglas Next.js/React)

Comprueba `package.json` para la lista exacta de dependencias y versiones.

## Variables de entorno
Archivo utilizado: `.env.local` (no versionado).

Variables principales (ejemplos):

```powershell
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
DATABASE_URL=postgresql://postgres:<password-encoded>@<host>:5432/postgres
SUPABASE=<raw-password>  # (en este repo se guardó por conveniencia, pero NO recomendable)
```

Nota: Si necesitas ejecutar código Node que se conecta a la base de datos (scripts), exporta `DATABASE_URL` antes de ejecutar.

## Scripts útiles
- Instalar dependencias:

```powershell
npm install
```

- Iniciar dev server (Next.js):

```powershell
npm run dev
# abre http://localhost:3000
```

- Linter (ESLint):

```powershell
npm run lint
```

- Ejecutar seed / crear tablas (scripts en `scripts/`):

```powershell
# ejemplo
node scripts/seed_all.js
```

## Datos y comportamiento local
- Muchas pantallas usan `localStorage` con claves del estilo `plicometria_*_v1` para datos de demo (clients, services, appointments, bills, etc.).
- En desarrollo el proyecto seedea datos de ejemplo en `useEffect` o en scripts si `localStorage` está vacío.

## Patrones comunes y cómo contribuir
- Evitar setState síncrono en efectos: preferimos `useState` con inicializador perezoso o diferir setState dentro de `useEffect` con `setTimeout(..., 0)` y limpiar el timeout. Esto evita los warnings de `react-hooks/set-state-in-effect` y problemas de re-render en React.
- Evitar ramas `if (typeof window !== 'undefined')` en JSX porque causan mismatches SSR/CSR. En su lugar usar un flag `mounted` y renderizar condicionalmente después del mount.
- Cuando añadas nuevas páginas/componentes, coloca estilos y utilidades en `components/ui` si son genéricos.

## Flujo de incorporación (pasos recomendados)
1. Clonar repo y `npm install`.
2. Crear `.env.local` con variables mínimas (ver arriba). Si no se conecta a Supabase, muchas pantallas aún funcionan con `localStorage`.
3. `npm run dev` y abrir `http://localhost:3000`.
4. Ejecutar `npm run lint` y arreglar avisos si vas a hacer PRs.

## Operaciones comunes para revisar código
- Ejecutar linter: `npm run lint` (mostrará warnings; hemos rebajado severidad de algunas reglas para desarrollo iterativo).
- Formatear (si hay prettier configurado): seguir pre-commit hooks o configurar tu editor.

## Dónde mirar cuando algo se ve raro en la UI
- `components/ui/table.tsx` — wrapper y comportamiento de tablas (overflow, tamaño). Si hay solapamientos, revisar `overflow-auto`, `flex` parents y `basis-full`.
- Archivos por área: `components/billing/*`, `components/calendar/*`, `components/clients/*`.

## Comunicación y PR
- Para cambios grandes, abre un PR con descripción de lo que cambia y capturas de pantalla.
- Si tocas las reglas de ESLint, documenta la razón en el PR y considera restaurarlas tras la refactorización.

## Notas de seguridad
- No subas secretos en `.env.local`. Los archivos de este repo pueden contener valores de ejemplo; revísalos y reemplázalos con secretos en tu entorno seguro.

---

Si necesitas que añada pasos específicos (por ejemplo: cómo levantar un Postgres local con Docker, cómo ejecutar migraciones Prisma, o un checklist para code review), dímelo y lo añado a este archivo.

*** Fin de `docs/worktogether.md` ***
