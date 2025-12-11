# Vercel — Paso a paso para desplegar plicometria-app

Este documento describe los pasos mínimos y recomendados para desplegar la aplicación en Vercel y preparar el backend (Prisma + base de datos) en producción.

Resumen rápido
- Recomendación: usar una base de datos gestionada (Postgres). Evita SQLite en producción.
- Antes del primer deploy: crea la base de datos de producción, configura variables de entorno en Vercel y ejecuta las migraciones.
- Build command sugerido en Vercel: `npx prisma generate && npm run build` (si usas Prisma).

---

1) Requisitos previos
- Cuenta en Vercel (https://vercel.com) y acceso al repositorio Git (GitHub/GitLab/Bitbucket).
- Acceso a una base de datos de producción (Postgres recomendado). Puedes usar Vercel Postgres, Railway, PlanetScale (MySQL) o cualquier proveedor gestionado.
- En tu máquina local: Node.js (versión compatible con el proyecto), `npm`, `npx` y `prisma` disponible vía `npx prisma`.

2) Preparar la base de datos (producción)
(Opcional: si quieres probar en Preview puedes usar una base de datos temporal pero recuerda no usar SQLite en Vercel production)

- Crear la base de datos Postgres en tu proveedor preferido.
- Obtén la URL de conexión (DATABASE_URL). Ejemplo Postgres:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?schema=public
```

- (Opcional) Crea también una base de datos de shadow (para migraciones) o proporciona `SHADOW_DATABASE_URL` cuando sea necesario.

3) Configurar variables de entorno en Vercel
- En Vercel Dashboard > Project > Settings > Environment Variables agrega:
  - `DATABASE_URL` = URL de la base de datos de producción.
  - `SHADOW_DATABASE_URL` = (opcional) URL de shadow DB para Prisma en CI si lo necesitas.
  - Cualquier otra variable (por ejemplo `NEXT_PUBLIC_*`) que use la app.

Asegúrate de definir variables para los entornos: `Production` y `Preview` (y `Development` si quieres que las previews las usen).

4) Ajustar el Build Command en Vercel
- En la configuración del proyecto en Vercel (Build & Development Settings):
  - Framework preset: `Next.js` (generalmente detectado automáticamente).
  - Root Directory: (dejar en blanco si el repo raíz es el proyecto).
  - Build Command:

    ```text
    npx prisma generate && npm run build
    ```

  - Install Command (normalmente `npm install`).

  - Output Directory: (Next.js lo detecta, no cambiar).

Motivo: `npx prisma generate` asegura que el cliente Prisma se genere durante el build si tu código lo necesita.

5) Asegúrate de que Prisma no importe adaptadores nativos en tiempo de build
- El repo ya usa `lib/prisma.ts` con un `getPrisma()` que hace import dinámico para evitar cargar adaptadores nativos (por ejemplo `@prisma/adapter-better-sqlite3`) durante la fase de build en Vercel.
- Si creas nuevas rutas que usan Prisma, sigue este patrón:
  - en `app/api/.../route.ts` añadir `export const runtime = 'nodejs';` (si vas a usar Prisma en esa ruta)
  - dentro del handler `const prisma = await getPrisma();`

6) Ejecutar migraciones en producción
- No ejecutes `prisma migrate dev` contra la base de datos de producción. Para aplicar migraciones en producción usa `prisma migrate deploy`.

A. Ejecutar migraciones manualmente desde tu máquina local (recomendado para la primera vez):

```powershell
# 1. Asegúrate de que DATABASE_URL apunta a la DB de producción
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
# 2. Ejecutar deploy de migraciones
npx prisma migrate deploy
# 3. Generar el cliente (si no lo hace el build)
npx prisma generate
```

B. Ejecutar migraciones como parte de un job CI (alternativa):
- Puedes crear un workflow en GitHub Actions que, tras merge a `main`, se conecte a la DB de producción y ejecute `npx prisma migrate deploy`.

7) Despliegue inicial en Vercel
- Conecta el repositorio en Vercel (Import Project).
- Confirma el Framework preset y Build Command (ver paso 4).
- Asegúrate de que las Environment Variables están presentes antes de hacer el deploy (esto evita fallos durante build que requieran `DATABASE_URL`).
- Deploy: Vercel iniciará el build; si todo está correcto verás la app desplegada.

8) Verificar endpoints y logs
- Después del deploy, comprueba el endpoint de prueba, p. ej. `https://<tu-proyecto>.vercel.app/api/appointments`.
- Revisa Logs (Vercel Dashboard > Deployments > View Logs) para detectar errores en build o en serverless functions.

9) Notas sobre SQLite
- Si estás usando SQLite (`DATABASE_URL="file:./dev.db"`) ten en cuenta:
  - El filesystem en Vercel es efímero: los cambios no persisten entre despliegues/instancias. No es recomendable para producción.
  - Si aún así quieres usar SQLite con adaptadores nativos, evita importar adaptadores a nivel de módulo y ejecuta SQLite solo en entornos que lo soporten.

10) Ajustes extra y recomendaciones
- ERRORES COMUNES:
  - Error en build por `better-sqlite3` u otro binario: asegúrate del patrón `getPrisma()` y que `DATABASE_URL` en Vercel apunta a Postgres.
  - Falta `DATABASE_URL` en Environment Variables para la fase de build: añade la variable antes de desplegar.

- Habilita Health checks / pings si necesitas mantener warm tus funciones (opcional).
- Recomendado: migrar a Postgres y ejecutar las migraciones desde CI o mediante un job manual.

---

## Guía rápida para poner el backend (Prisma) — local -> producción

1. Local (desarrollo):
```powershell
# instalar deps
npm install
# generar cliente
npx prisma generate
# migrar en local (desarrollo)
npx prisma migrate dev
# levantar app	npm run dev
```

2. Preparar producción (DB gestionada):
- Crear base de datos Postgres en el proveedor elegido.
- Copiar la URL y añadirla a Vercel como `DATABASE_URL` (Production + Preview si procede).
- Desde tu máquina local (con `DATABASE_URL` apuntando a la DB de producción) ejecutar:
```powershell
npx prisma migrate deploy
npx prisma generate
```
- Hacer deploy en Vercel (Build Command incluir `npx prisma generate && npm run build`).

3. Mantenimiento de migraciones (futuras migraciones):
- Genera una nueva migración localmente:
```powershell
npx prisma migrate dev --name describe_changes
```
- Haz commit de la migración (`prisma/migrations/*`) y push al repo.
- En CI/production: ejecutar `npx prisma migrate deploy` (esto puede hacerse manualmente o mediante un Job en CI tras deploy).

---

## Comprobaciones finales y troubleshooting
- Si el endpoint `/api/appointments` devuelve un error en producción:
  - Revisa logs de Deployment en Vercel.
  - Asegúrate de que `DATABASE_URL` es accesible desde Vercel (puede que el proveedor bloquee IPs).
  - Confirma que las migraciones se han aplicado y que `npx prisma generate` se ejecutó correctamente.

- Si necesitas ayuda para configurar GitHub Actions para ejecutar `prisma migrate deploy` automáticamente, puedo generarte un workflow ejemplo.

---

Si quieres, ahora creo:
- un `docs/vercel.md` (hecho) y también un ejemplo de workflow de GitHub Actions para ejecutar migraciones automáticamente, o
- un `docs/vercel-quickstart.md` con pantallazos y pasos aún más detallados.

¿Qué prefieres que haga a continuación?