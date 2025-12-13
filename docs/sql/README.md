**SQL directory**

Contiene scripts SQL idempotentes para crear el esquema de la base de datos del proyecto.

Archivos importantes:
- `db-schema.sql` — script principal que crea las tablas: `clients`, `professionals`, `services`, `schedules`, `foods` y los triggers `updated_at`.

Cómo ejecutar
- Desde la consola de Supabase: copia el contenido de `db-schema.sql` y ejecútalo en el SQL editor.
- Desde un servidor/CI con `psql` y `DATABASE_URL`:
  ```bash
  psql "$DATABASE_URL" -f docs/sql/db-schema.sql
  ```
- Desde el script Node incluido en el repo:
  ```powershell
  node .\scripts\create_tables.js
  ```

Notas
- Los scripts son idempotentes (`CREATE TABLE IF NOT EXISTS`) y deberían poder ejecutarse múltiples veces sin errores.
- Mantén los scripts de alteraciones mayores como archivos separados (p. ej. `migrations/`) si necesitas historial de cambios.
