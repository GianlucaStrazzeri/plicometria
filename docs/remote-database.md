# Base de datos remota gratuita y adaptación del proyecto

Este documento explica cómo cambiar de SQLite (local/efímero) a una base de datos remota gratuita (ej.: Supabase Postgres), y los pasos necesarios para adaptar tu proyecto Next.js + Prisma.

## Resumen recomendado
- Proveedor recomendado para este proyecto: **Supabase** (Postgres, plan gratuito) — funciona bien con Prisma y migraciones.
- Alternativas: **PlanetScale** (MySQL, buen rendimiento), **Neon** (Postgres), **Railway** (free tier limitado).

## Ventajas de usar Supabase
- Postgres totalmente compatible con Prisma.
- Plan gratuito suficiente para desarrollo y pruebas.
- Panel para ver/editar datos, usuarios y obtener la cadena de conexión.

---

## Paso 1 — Crear una base de datos en Supabase

1. Ve a https://app.supabase.com y regístrate (gratuito).
2. Crea un nuevo proyecto: dale un nombre, elige región y introduce una contraseña para la base de datos.
3. Espera a que se provisione el proyecto.
4. Ve a `Settings -> Database -> Connection string` y copia la `Connection string (URI)` o la `Connection string (libpq)`.

Ejemplo de `DATABASE_URL` (Postgres):

```
postgresql://postgres:TU_PASSWORD@db.xxxxxxxxx.supabase.co:5432/postgres
```

---

## Paso 2 — Añadir `DATABASE_URL` en local

En la raíz de tu proyecto Next.js crea (o edita) el archivo `.env.local` y añade la conexión:

```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxxxxxx.supabase.co:5432/postgres"
```

Notas:
- Mantén las comillas si la URL contiene caracteres especiales.
- Nunca subas `.env.local` al repositorio.

---

## Paso 3 — Ajustes en Prisma

1. Abre `prisma/schema.prisma` y cambia el `datasource` para que use `postgresql` en vez de `sqlite`. Ejemplo mínimo:

```diff
 datasource db {
-  provider = "sqlite"
-  // En Prisma 7 la URL de conexión NO se define aquí, sino en prisma.config.ts.
+  provider = "postgresql"
+  // La URL se lee desde `prisma.config.ts` (env: DATABASE_URL)
 }
```

2. (Tu proyecto usa `prisma.config.ts` para la URL — deja ese archivo como está, sólo asegúrate de que `DATABASE_URL` está definido en `.env.local`).

3. Instala dependencias si aún no están:

```powershell
npm install @prisma/client
npm install -D prisma
```

4. Genera el cliente Prisma:

```powershell
npx prisma generate
```

5. Aplicar migraciones (desarrollo):

```powershell
npx prisma migrate dev --name init
```

Si prefieres no crear migraciones en desarrollo y quieres simplemente empujar el esquema:

```powershell
npx prisma db push
```

Para producción, usa:

```powershell
npx prisma migrate deploy
```

---

## Paso 4 — Ajustes en el código del proyecto

Tu `lib/prisma.ts` actual tiene un intento de cargar un adaptador `better-sqlite3` para SQLite. Cuando pasas a Postgres puedes simplificar el cliente para evitar problemas en build-time.

Recomendación (reemplazar `lib/prisma.ts` por esto):

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  // Evita múltiples instancias en desarrollo con HMR
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
```

Esto es más simple y funciona bien con Postgres/Prisma en Vercel.

Si quieres que aplique este cambio automáticamente, dímelo y lo parcheo.

---

## Paso 5 — Configurar variables en Vercel (producción)

1. En el dashboard de Vercel accede al proyecto.
2. Ve a `Settings -> Environment Variables`.
3. Añade la variable `DATABASE_URL` con la misma cadena que copiaste de Supabase.
4. Re-deploy del proyecto desde Vercel (o push al repo) para que coja la nueva variable.

También puedes usar `vercel env add DATABASE_URL` con la Vercel CLI si prefieres.

---

## Paso 6 — Probar localmente

1. Arranca la app localmente:

```powershell
npm run dev
```

2. Prueba las rutas de la API que usan Prisma (por ejemplo `api/appointments/route.ts`) y comprueba que las tablas se han creado y funcionan.

3. Si hay errores de migración, revisa `prisma/migrations` y el log de `npx prisma migrate dev`.

---

## Notas sobre proveedores alternativos

- PlanetScale (MySQL): usa ramas y tiene particularidades con migraciones; con PlanetScale suele recomendarse usar `prisma migrate deploy` + `pg` adapter o PlanetScale CLI. No es la opción más directa para empezar si no conoces Vitess/branches.
- Neon: similar a Supabase (Postgres), buena alternativa.

---

## Checklist rápida

- [ ] Crear proyecto Supabase y copiar `DATABASE_URL`.
- [ ] Añadir `.env.local` con `DATABASE_URL`.
- [ ] Cambiar `provider` a `postgresql` en `prisma/schema.prisma`.
- [ ] `npx prisma generate` y `npx prisma migrate dev --name init`.
- [ ] Actualizar `lib/prisma.ts` para eliminar lógica específica de SQLite (opcional pero recomendado).
- [ ] Añadir `DATABASE_URL` en Vercel y desplegar.

---

## Recursos

- Supabase: https://supabase.com
- Prisma docs: https://www.prisma.io/docs

Si quieres, aplico los cambios automáticos (ej: parchear `lib/prisma.ts` y `prisma/schema.prisma`) y ejecuto los comandos necesarios en tu entorno. Indica si quieres que lo haga ahora.
