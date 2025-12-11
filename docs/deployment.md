# Deployment — plicometria-app

Recomendaciones generales
- Antes de desplegar en Vercel u otra plataforma, asegúrate de configurar las variables de entorno:
  - `DATABASE_URL` — URL de la base de datos (en producción, usa Postgres u otra DB gestionada).

Vercel
- Problema conocido: importar adaptadores nativos de SQLite (better-sqlite3) durante el build puede romper la fase de "collecting page data". Para evitarlo:
  - Usa el `lib/prisma.ts` con `getPrisma()` (import dinámico) — ya aplicado en este repo.
  - Marca las API routes que usan Prisma con `export const runtime = 'nodejs'`.
  - Evita importar `@prisma/adapter-*` a nivel de módulo en archivos que se ejecutan durante el build.

Build local
```powershell
npm run build
```
- Si el build falla por problemas con la BD, revisa el log y confirma que `DATABASE_URL` esté configurado.

Producción
- Preferible: migrar a Postgres y actualizar `DATABASE_URL` en Vercel (o usar Vercel Postgres).
- Revisa las migraciones y ejecuta `prisma migrate deploy` en el entorno de despliegue si es necesario.

Verificación post-despliegue
- Revisar logs de build en Vercel para errores de import dinámico.
- Comprobar endpoints `/api/*` y la página `/calendar` (que consume `/api/appointments`).

Si quieres, puedo crear un `vercel.md` con pasos detallados y ejemplos de configuración para Vercel (deploy preview y production).