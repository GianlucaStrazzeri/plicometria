-- Archivo movido: esquema SQL del proyecto
-- Este archivo contiene instrucciones y scripts SQL para crear las tablas usadas
-- por la aplicación. Está ubicado en `docs/sql/db-schema.sql` para mantener la
-- carpeta `docs/` reservada exclusivamente a archivos Markdown.

-- Nota: este archivo originalmente estaba en `docs/db-schema.sql`.

-- Puedes ejecutar este SQL en psql o en el editor SQL de Supabase.

-- (Contenido originalmente: mensaje indicando la nueva ubicación)

/*
Este archivo ha sido movido a `docs/sql/db-schema.sql` para mantener los scripts SQL agrupados.

Path nuevo: `docs/sql/db-schema.sql`

Para aplicar: copia el contenido de `docs/sql/db-schema.sql` en el SQL editor de Supabase o ejecútalo con `psql`/scripts en CI.

*/
-- DB schema for plicometria app
-- Run this in Supabase SQL editor or via psql

-- clients
CREATE TABLE IF NOT EXISTS public.clients (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  dni TEXT UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  sex TEXT,
  pathology TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- professionals
CREATE TABLE IF NOT EXISTS public.professionals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  hours JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- services
CREATE TABLE IF NOT EXISTS public.services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT,
  price NUMERIC,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- schedules (availability / bookings)
CREATE TABLE IF NOT EXISTS public.schedules (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT REFERENCES public.professionals(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_booked BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- foods (lista de alimentos)
CREATE TABLE IF NOT EXISTS public.foods (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT,
  proteins NUMERIC,
  fats NUMERIC,
  carbs NUMERIC,
  sugars NUMERIC,
  vitamins TEXT,
  calories_per_100 NUMERIC,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function to update updated_at on update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_clients') THEN
    CREATE TRIGGER trg_set_updated_at_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_professionals') THEN
    CREATE TRIGGER trg_set_updated_at_professionals BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_services') THEN
    CREATE TRIGGER trg_set_updated_at_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_schedules') THEN
    CREATE TRIGGER trg_set_updated_at_schedules BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_foods') THEN
    CREATE TRIGGER trg_set_updated_at_foods BEFORE UPDATE ON public.foods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;
