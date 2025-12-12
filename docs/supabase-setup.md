# Conectar tu aplicación a Supabase

Esta guía explica, paso a paso y en lenguaje práctico, cómo conectar la app (Next.js) que estás desarrollando a una base de datos Supabase. Asumo que ya creaste un proyecto en Supabase (tienes acceso al dashboard). Si aún no tienes backend, aquí verás lo esencial para empezar.

**Resumen rápido**
- Instalar la librería oficial: `@supabase/supabase-js`.
- Guardar las claves en `env` (variables de entorno): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y (opcional / server-only) `SUPABASE_SERVICE_ROLE_KEY`.
- Crear un cliente reutilizable en `lib/supabaseClient.ts`.
- En componentes client-side usar ese cliente para leer/grabar.
- Para acciones server-side seguras, usar la `SERVICE_ROLE_KEY` sólo en el servidor (API routes / server actions).

**1) Instalar SDK**

Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
# con npm
npm install @supabase/supabase-js

# o con pnpm
pnpm add @supabase/supabase-js
```

**2) Variables de entorno**

En el dashboard de Supabase -> Settings -> API encontrarás:
- `URL` (la URL del proyecto)
- `anon/public` key (clave pública)
- `service_role` key (clave con privilegios de servidor; NO exponerla al cliente)

Añade estas variables a tu `.
env.local` (archivo git-ignoreado, no subir al repo):

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
# Opcional (solo servidor):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

- Las variables con prefijo `NEXT_PUBLIC_` estarán disponibles en el código del cliente (browser). La `SERVICE_ROLE_KEY` NUNCA debe enviarse al cliente.

**3) Crear cliente reutilizable**

Crea `lib/supabaseClient.ts` (TypeScript) con el cliente configurado:

```ts
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- Usa este archivo desde componentes cliente y desde `app`/páginas client-side.
- Para uso en el servidor (API routes, server actions), crea otro cliente usando la `SERVICE_ROLE_KEY` solo en el lado servidor:

```ts
// lib/supabaseServer.ts (solo importarlo desde server code)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // NO exponer en cliente

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
```

**4) Ejemplos de uso (cliente)**

- Leer datos (ej.: tabla `clients`):

```tsx
// components/example/ClientsList.tsx ("use client")
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }
      if (!mounted) return;
      setClients(data ?? []);
    })();

    return () => { mounted = false };
  }, []);

  return (
    <div>
      {clients.length === 0 ? <p>No hay clientes</p> : (
        <ul>
          {clients.map((c) => (
            <li key={c.id}>{c.nombre} {c.apellido}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- Insertar un registro (desde un handler o botón):

```ts
const { data, error } = await supabase.from('clients').insert([{ nombre: 'Ana', apellido: 'Pérez' }]);
```

**5) Ejemplo de uso (servidor / API route)**

Si necesitas realizar operaciones protegidas (por ejemplo emitir facturas, leer datos sensibles, o ejecutar funciones administrativas), crea una API route o Server Action y usa `supabaseAdmin` con la `SERVICE_ROLE_KEY`:

```ts
// app/api/seed/route.ts (Next.js App Router API route)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  // ejemplo: insertar filas desde el servidor
  const { data, error } = await supabaseAdmin.from('clients').insert([{ nombre: 'Demo', apellido: 'Cliente' }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

**6) Modelo de datos / SQL de ejemplo**

En Supabase -> Table Editor puedes crear tablas. Aquí tienes un esquema mínimo para arrancar (SQL):

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  apellido text,
  email text,
  telefono text,
  notas text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  precio numeric,
  duracion_minutes integer,
  created_at timestamptz default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  service_id uuid references services(id),
  start timestamptz,
  end timestamptz,
  status text,
  created_at timestamptz default now()
);
```

- Puedes ejecutar ese SQL desde la pestaña `SQL` del dashboard.

**7) Seguridad: Row Level Security (RLS) y políticas**

- Por defecto, Supabase crea tablas sin RLS. Para producción es recomendable:
  - Habilitar RLS en cada tabla de usuario.
  - Crear políticas (Policies) para permitir lecturas/escrituras según `auth.uid()` u otros criterios.

Ejemplo básico: permitir a usuarios autenticados insertar su propio cliente

```sql
-- Habilitar RLS
alter table clients enable row level security;

-- Política: usuarios autenticados pueden insertar
create policy "Authenticated insert" on clients
  for insert using (auth.role() = 'authenticated') with check (true);
```

Ajusta las políticas para tu modelo de seguridad.

**8) Autenticación (opcional)**

- Supabase ofrece `supabase.auth` para registro/inicio de sesión.
- Si quieres que cada profesional/usuario tenga sesión: usa `supabase.auth.signUp()` y `signIn()` desde el cliente, y `supabase.auth.onAuthStateChange` para sincronizar.
- Ten en cuenta: si usas `supabase.auth` y RLS, las políticas pueden usar `auth.uid()` para vincular filas a usuarios.

**9) Herramientas útiles / CLI**

- `supabase` CLI (opcional, para migraciones y despliegue local):
  - Instalar: https://supabase.com/docs/guides/cli
  - Comandos útiles:
    - `supabase login`
    - `supabase init`
    - `supabase db push` (aplica migraciones locales)

**10) Flujo sugerido para integrar en tu proyecto**

1. Añade variables a `.
env.local` (URL + anon key).  
2. Crea `lib/supabaseClient.ts` y (opcional) `lib/supabaseServer.ts`.  
3. Instala `@supabase/supabase-js`.  
4. Crea tablas mínimas desde el dashboard o con SQL.  
5. Desde componentes client, prueba `select` e `insert` simples.  
6. Si necesitas tareas admin, crea API routes y usa `SUPABASE_SERVICE_ROLE_KEY` ahí.

**11) Ejemplo de integración rápida con tu app existente**

- Si quieres mostrar `Lista de alimentos` (tu `listoffoods`), reemplaza la lectura actual de `localStorage` por una lectura de la tabla `foods` en Supabase:

```ts
const { data } = await supabase.from('foods').select('*').order('nombre');
```

- Si prefieres migrar progresivamente: mantén `localStorage` como caché y sincroniza con Supabase en background (ideal para prototipos).

**12) Consejos y buenas prácticas**
- Nunca subas `SUPABASE_SERVICE_ROLE_KEY` a GitHub ni lo uses en el cliente.  
- Usa `NEXT_PUBLIC_` sólo para claves seguras de lectura en cliente.  
- Implementa RLS y políticas antes de lanzar a producción.  
- Para despliegues en Vercel/Netlify, configura las mismas variables de entorno en el panel del host.  

---

**Acciones realizadas en este repositorio (comandos exactos)**

He instalado la librería oficial de Supabase y creado clientes reutilizables en `lib/` para que puedas usarlos de inmediato. Ejecuta estos comandos en PowerShell (raíz del proyecto):

```powershell
# instalar la librería cliente de Supabase
npm install @supabase/supabase-js
```

Salida / nota local: la instalación añadió los paquetes necesarios; `npm` sugirió ejecutar `npm audit fix --force` para arreglar vulnerabilidades automáticamente si lo deseas. Recomiendo revisar `npm audit` antes de aplicar `--force`.

Archivos que añadí al repo para facilitar la integración:

- `lib/supabaseClient.ts` — Cliente público para uso en componentes del cliente (usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- `lib/supabaseServer.ts` — Cliente de servidor que usa `SUPABASE_SERVICE_ROLE_KEY` (solo importar desde código servidor / API routes).

Ejemplo rápido de lo que contienen (ya añadidos en el repo):

`lib/supabaseClient.ts` (cliente público):

```ts
"use client"
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

`lib/supabaseServer.ts` (cliente servidor):

```ts
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, { auth: { persistSession: false } });
```

Siguientes pasos recomendados (rápido):

- Añade las variables de entorno en `.\.env.local` (o en tu panel de Vercel) y reinicia el servidor:

```powershell
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> # solo para servidor
```

- Reinicia el dev server:

```powershell
npm run dev
```

Si quieres, ahora puedo:

- Añadir ejemplos concretos que reemplacen `localStorage` por consultas a Supabase en `components/listoffoodstobuy/listoffoods.tsx`.
- Crear una API route de ejemplo `/api/seed` que use `supabaseAdmin` para insertar datos demo.
- Actualizar la documentación con la política recomendada de RLS para las tablas que uses.

Si quieres, puedo:
- Añadir código listo para pegar en `lib/supabaseClient.ts` y `lib/supabaseServer.ts`.  
- Crear una API route de ejemplo (`/api/seed`) que inserte datos demo en las tablas.  
- Preparar las sentencias SQL para crear las tablas que ya usas en la app (`clients`, `professionals`, `services`, `appointments`, `bills`, `foods`).

Dime cuál prefieres y lo genero inmediatamente (también puedo abrir parches sobre los archivos del proyecto si quieres que los añada).