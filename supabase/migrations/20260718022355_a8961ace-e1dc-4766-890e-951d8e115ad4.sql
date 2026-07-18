
ALTER TABLE public.emprendedores
  ADD COLUMN IF NOT EXISTS tiempo_operando text,
  ADD COLUMN IF NOT EXISTS registro_comerciante text,
  ADD COLUMN IF NOT EXISTS fuente_ingreso text,
  ADD COLUMN IF NOT EXISTS canales_venta text[],
  ADD COLUMN IF NOT EXISTS tamano_equipo text;
