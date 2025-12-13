**Documentación del proyecto — Organización**

Este directorio contiene documentación técnica y operativa del proyecto.

Estructura propuesta:
- `docs/README.md` : este archivo — índice y guía rápida de la carpeta `docs`.
- `docs/sql/` : scripts SQL para crear el esquema de la base de datos, triggers y cualquier script DDL/DML reproducible.
- `docs/deployment/` : guías relacionadas con despliegue (Vercel, CI, variables de entorno, secretos).
- `docs/architecture/` : notas de arquitectura, decisiones de diseño y diagramas.
- `docs/guides/` : guías de uso para desarrolladores (cómo ejecutar seeds, migraciones, pruebas locales).

Archivos actuales y su propósito:
- `docs/db-schema.sql` : script SQL con el esquema del proyecto (migrará a `docs/sql/db-schema.sql`).
- `docs/supabase-production.md` : guía de configuración de Supabase para producción (env vars, RLS, seguridad).

Archivos reorganizados:
- `docs/sql/db-schema.sql` : esquema SQL principal.
- `docs/deployment/supabase-production.md` : guía de producción y seguridad para Supabase.

Cómo usar estos documentos
- Para aplicar el esquema en una instancia de Postgres (p. ej. Supabase): copia `docs/sql/db-schema.sql` al SQL editor de Supabase o ejecútalo con `psql`/scripts en CI.
- Para deploy reproducible: configura `DATABASE_URL` en tu CI (GitHub Actions / Vercel) y ejecuta los scripts en `scripts/` o aplica `prisma migrate` según tu flujo.

Enlaces rápidos:
- Esquema SQL: `docs/sql/db-schema.sql`
- Guía producción Supabase: `docs/deployment/supabase-production.md`

Convenciones
- Todos los SQLs idempotentes deben vivir en `docs/sql/` y deben poder ejecutarse varias veces sin causar errores.
- Los documentos de despliegue no deben contener claves concretas — usar placeholders y referir a secretos en el proveedor (Vercel/GitHub).

Si quieres que reorginice más documentos o que mueva `supabase-production.md` a `docs/deployment/`, dime y lo hago.
