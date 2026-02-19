-- create_guests.sql
-- Ejecutar en la base de datos Postgres para preparar la tabla de invitados

-- Habilitar extensión unaccent (opcional, requiere permisos)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Tabla principal
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Columna generada con nombre normalizado para comparaciones
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS normalized_name TEXT GENERATED ALWAYS AS (lower(unaccent(coalesce(name,'')))) STORED;

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_guests_normalized_name ON guests (normalized_name);
CREATE INDEX IF NOT EXISTS idx_guests_email_lower ON guests ((lower(coalesce(email,''))));

-- Opcional: restricción única por nombre normalizado (descomentar si se desea)
-- ALTER TABLE guests ADD CONSTRAINT uq_guests_normalized_name UNIQUE (normalized_name);
