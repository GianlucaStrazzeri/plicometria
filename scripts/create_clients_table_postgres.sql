-- SQL: Crear tabla `clients` para PostgreSQL
-- Uso: ejecutar con psql apuntando a la base de datos PostgreSQL

-- Crear extensión para UUID (pgcrypto) si no existe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear la tabla `clients` si no existe
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dni TEXT UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  sex TEXT,
  pathology TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Función y trigger para mantener `updated_at` actualizado automáticamente
CREATE OR REPLACE FUNCTION trg_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON clients;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION trg_set_timestamp();

-- Índices adicionales (por rendimiento en búsquedas comunes)
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_last_name ON clients(last_name);
