# Backend / API — plicometria-app

Rutas API
- Las API routes del App Router están en `app/api/`.
- Ejemplo principal: `app/api/appointments/route.ts` que devuelve citas para el calendario.

Prisma
- Cliente central en `lib/prisma.ts`.
- Importante: `lib/prisma.ts` implementa `getPrisma()` con import dinámico para evitar que adaptadores nativos (ej. `@prisma/adapter-better-sqlite3`) se carguen durante el build en entornos serverless.
- Patrón recomendado para rutas que usan Prisma:
  - Declarar `export const runtime = 'nodejs';` en la ruta.
  - Llamar `const prisma = await getPrisma();` dentro del handler antes de usarlo.

Migrations
- Esquema en `prisma/schema.prisma` y migraciones en `prisma/migrations/`.
- Para aplicar migraciones localmente:
```powershell
npx prisma migrate dev
npx prisma generate
```

Notas de seguridad
- Nunca comitees credenciales en el repositorio. Usa variables de entorno (`DATABASE_URL`).

Recomendaciones
- Para producción, usa una base de datos gestionada (Postgres) en lugar de SQLite con adaptadores nativos.
- Si creas nuevas rutas que usan Prisma, reproduce el patrón `getPrisma()` para evitar fallos en CI/servidores de build.