# UI / CSS / Tailwind Overview

Resumen de cómo se gestiona la UI y el CSS en este proyecto, dependencias relevantes y puntos prácticos para trabajar con el sistema de estilos.

---

## Archivos clave

- `package.json` — dependencias relacionadas con CSS/Tailwind: [package.json](package.json)
- Hoja global de estilos (punto de entrada): [app/globals.css](app/globals.css)
- Configuración PostCSS: [postcss.config.mjs](postcss.config.mjs)
- Layout principal (importa `globals.css` y las fuentes): [app/layout.tsx](app/layout.tsx)
- Utilidad para componer clases Tailwind: [lib/utils.ts](lib/utils.ts)
- Componentes UI reutilizables en `components/ui/` — usan utilidades Tailwind y Radix primitives.

---

## Dependencias principales (extraídas de `package.json`)

- `tailwindcss` (^4) — motor de utilidades CSS.
- `@tailwindcss/postcss` — plugin PostCSS para integrar Tailwind en la cadena de build.
- `tw-animate-css` — colección de utilidades/animaciones (se importa en `globals.css`).
- `tailwind-merge` — resuelve conflictos de clases Tailwind; usado por `lib/utils.ts`.
- `class-variance-authority` — ayuda para variantes de componentes (pattern-driven styling).
- `clsx` — composición condicional de clases.
- `@radix-ui/*` — primitives accesibles (ej. `@radix-ui/react-label`, `select`, etc.) que se estilizan con Tailwind.
- `lucide-react` — iconos; se usan junto con utilidades Tailwind.
- `next/font/google` (Next) — fuentes inyectadas y expuestas como variables CSS en `layout.tsx`.

---

## Cómo está estructurado el CSS / Tailwind en este proyecto

1. Entrada global
   - `app/layout.tsx` importa `globals.css` (es el punto de entrada de estilos para toda la app).
   - `globals.css` contiene la importación de Tailwind y define variables CSS, temas (`:root` y `.dark`) y reglas base con `@layer base` y `@apply`.

2. PostCSS
   - `postcss.config.mjs` activa el plugin `@tailwindcss/postcss` para procesar las directivas/funciones necesarias durante el build.

3. Utilities + helpers
   - `lib/utils.ts` exporta `cn(...)` que combina `clsx` y `twMerge` para construir `className` seguras y deduplicate de Tailwind.
   - `class-variance-authority` se puede ver en componentes para manejar variantes basadas en props.

4. Componentes
   - La UI está compuesta por componentes que usan utilidades Tailwind directamente en `className`, y algunos usan `@apply` en `globals.css` para reglas globales.
   - Radix primitives se usan para accesibilidad; Tailwind se encarga del aspecto visual.

5. Theming y tokens
   - El proyecto define variables CSS (`--primary`, `--background`, etc.) en `:root` y una alternativa `.dark`.
   - Estas variables se consumen indirectamente a través de utilidades `@apply` y clases (p. ej. `bg-background`, `text-foreground`) que están mapeadas con las variables. Esto facilita cambiar colores globales desde un único sitio (`globals.css`).

---

## Observaciones prácticas y recomendaciones

- No encontré un `tailwind.config.js`/`cjs`/`ts` en la raíz del repo. Sin un archivo de configuración explícito Tailwind usa behavior por defecto; sin embargo se recomienda crear un `tailwind.config.(cjs|js|ts)` para:
  - Declarar `content` (rutas que Tailwind debe escanear: `app/**/*`, `components/**/*`, `src/**/*`).
  - Establecer `darkMode: 'class'` (si aún no está asumido) y extender `theme` con colores que apunten a las variables CSS (ej. `primary: 'var(--primary)'`).
  - Añadir plugins (forms, typography, container queries, etc.) si son necesarios.

- Variables CSS & theming
  - `:root` / `.dark` definen tokens; para cambiar paleta/tema edita `app/globals.css` (se propaga a toda la app).
  - Usar variables permite mantener las utilidades Tailwind (p. ej. `bg-background`) y seguir cambiando valores sin tocar cada componente.

- Build / Dev
  - Next.js detecta `postcss.config.mjs` y aplica PostCSS/Tailwind durante `next dev` / `next build`.
  - Comandos útiles:

```powershell
npm run dev
npm run build
npx tailwindcss -v  # muestra versión si quieres verificar instalación global/local
```

- Accesibilidad y componentes
  - El proyecto usa Radix para primitives accesibles; sigue la estrategia de separar lógica (Radix) y presentación (Tailwind).
  - Recomendación: preferir asociar `Label` con inputs vía `id` + `htmlFor` cuando sea posible — mejorar screen reader semantics por encima de solo `aria-label`.

- Manejo de clases conflictivas
  - Usa `cn()` desde `lib/utils.ts` para concatenar clases y `twMerge` para que la clase más reciente prevalezca (ej. `px-2` vs `px-4`).

---

## Cómo mejorar/ajustar rápidamente la configuración Tailwind

1. Añadir un `tailwind.config.cjs` mínimo:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      }
    }
  },
  plugins: []
}
```

2. Considerar plugins oficiales si los necesita la UI:
   - `@tailwindcss/forms` — estilos accesibles para formularios.
   - `@tailwindcss/typography` — para contenido Markdown/HTML largo.

3. Si se quiere una experiencia de tokens más integrada, añadir helpers en `theme.extend` que hagan `color: 'var(--my-token)'`.

---

## Dónde tocar para cambiar UI / UX

- Para cambiar paleta o brillo: editar `:root` y `.dark` en [app/globals.css](app/globals.css).
- Para añadir utilidades globales o `@apply` comunes: agrégalas en `@layer base` dentro de `globals.css`.
- Para controlar qué archivos analiza Tailwind (y así disminuir CSS generado): crear `tailwind.config.*` y ajustar `content`.
- Para cambios en comportamiento de componentes (variantes, merges): revisar `lib/utils.ts` y `components/ui/*`.

---

## Resumen rápido

- El proyecto usa Tailwind v4 vía `@tailwindcss/postcss` y centraliza tokens en `app/globals.css`.
- UI se construye con utilidades Tailwind + Radix primitives; `lib/utils.ts` ayuda a componer clases.
- Recomendación inmediata: añadir `tailwind.config.cjs` con `content` y mapear `theme` a las variables CSS para mayor control.

---

Si quieres, puedo:
- Crear un `tailwind.config.cjs` inicial en la raíz y ajustar `postcss.config.mjs` según convenga.
- Añadir `@tailwindcss/forms` y `@tailwindcss/typography` a `devDependencies` y configurar plugins.
- Generar un ejemplo de cómo mapear las variables CSS en `theme.extend.colors`.

¿Qué prefieres que haga ahora?