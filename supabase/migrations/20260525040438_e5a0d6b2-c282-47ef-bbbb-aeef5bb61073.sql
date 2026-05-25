
-- ============================================================
-- Sistema de Recurrencia para Mercados
-- ============================================================

-- 1. Agregar columnas nuevas a markets (nullable temporalmente)
ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS recurrence_type text,
  ADD COLUMN IF NOT EXISTS recurrence_day_of_week text,
  ADD COLUMN IF NOT EXISTS recurrence_week_of_month text,
  ADD COLUMN IF NOT EXISTS recurrence_start_date date,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date,
  ADD COLUMN IF NOT EXISTS recurrence_label text;

-- 2. Backfill desde event_date / frequency existentes
UPDATE public.markets
SET
  recurrence_type = COALESCE(recurrence_type, 'unico'),
  recurrence_start_date = COALESCE(recurrence_start_date, event_date),
  recurrence_label = COALESCE(recurrence_label, '');

-- 3. NOT NULL en los obligatorios
ALTER TABLE public.markets
  ALTER COLUMN recurrence_type SET NOT NULL,
  ALTER COLUMN recurrence_start_date SET NOT NULL,
  ALTER COLUMN recurrence_type SET DEFAULT 'unico';

-- 4. CHECK constraints (enum-like)
ALTER TABLE public.markets
  ADD CONSTRAINT markets_recurrence_type_check
    CHECK (recurrence_type IN ('unico','semanal','quincenal','mensual_por_dia')),
  ADD CONSTRAINT markets_recurrence_day_check
    CHECK (recurrence_day_of_week IS NULL OR recurrence_day_of_week IN
      ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  ADD CONSTRAINT markets_recurrence_week_check
    CHECK (recurrence_week_of_month IS NULL OR recurrence_week_of_month IN
      ('primero','segundo','tercero','cuarto','ultimo')),
  ADD CONSTRAINT markets_recurrence_consistency_check
    CHECK (
      (recurrence_type = 'unico'
        AND recurrence_day_of_week IS NULL
        AND recurrence_week_of_month IS NULL)
      OR (recurrence_type IN ('semanal','quincenal')
        AND recurrence_day_of_week IS NOT NULL
        AND recurrence_week_of_month IS NULL)
      OR (recurrence_type = 'mensual_por_dia'
        AND recurrence_day_of_week IS NOT NULL
        AND recurrence_week_of_month IS NOT NULL)
    );

-- 5. Aplicar mismas columnas a market_submissions
ALTER TABLE public.market_submissions
  ADD COLUMN IF NOT EXISTS recurrence_type text,
  ADD COLUMN IF NOT EXISTS recurrence_day_of_week text,
  ADD COLUMN IF NOT EXISTS recurrence_week_of_month text,
  ADD COLUMN IF NOT EXISTS recurrence_start_date date,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date,
  ADD COLUMN IF NOT EXISTS recurrence_label text;

UPDATE public.market_submissions
SET
  recurrence_type = COALESCE(recurrence_type, 'unico'),
  recurrence_start_date = COALESCE(recurrence_start_date, event_date),
  recurrence_label = COALESCE(recurrence_label, '');

ALTER TABLE public.market_submissions
  ALTER COLUMN recurrence_type SET NOT NULL,
  ALTER COLUMN recurrence_start_date SET NOT NULL,
  ALTER COLUMN recurrence_type SET DEFAULT 'unico';

ALTER TABLE public.market_submissions
  ADD CONSTRAINT msubs_recurrence_type_check
    CHECK (recurrence_type IN ('unico','semanal','quincenal','mensual_por_dia')),
  ADD CONSTRAINT msubs_recurrence_day_check
    CHECK (recurrence_day_of_week IS NULL OR recurrence_day_of_week IN
      ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  ADD CONSTRAINT msubs_recurrence_week_check
    CHECK (recurrence_week_of_month IS NULL OR recurrence_week_of_month IN
      ('primero','segundo','tercero','cuarto','ultimo'));

-- 6. Drop columnas viejas (event_date, frequency)
ALTER TABLE public.markets DROP COLUMN IF EXISTS event_date;
ALTER TABLE public.markets DROP COLUMN IF EXISTS frequency;
ALTER TABLE public.market_submissions DROP COLUMN IF EXISTS event_date;
ALTER TABLE public.market_submissions DROP COLUMN IF EXISTS frequency;

-- 7. Drop el type viejo market_frequency si existe
DROP TYPE IF EXISTS public.market_frequency;

-- 8. Tabla market_exceptions
CREATE TABLE IF NOT EXISTS public.market_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, exception_date)
);
CREATE INDEX IF NOT EXISTS idx_market_exceptions_market_id
  ON public.market_exceptions(market_id);

ALTER TABLE public.market_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view market exceptions"
  ON public.market_exceptions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert market exceptions"
  ON public.market_exceptions FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update market exceptions"
  ON public.market_exceptions FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete market exceptions"
  ON public.market_exceptions FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 9. Tabla market_date_overrides
CREATE TABLE IF NOT EXISTS public.market_date_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  original_date date NOT NULL,
  new_date date NOT NULL,
  new_start_time time,
  new_end_time time,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, original_date)
);
CREATE INDEX IF NOT EXISTS idx_market_date_overrides_market_id
  ON public.market_date_overrides(market_id);

ALTER TABLE public.market_date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view market date overrides"
  ON public.market_date_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert market date overrides"
  ON public.market_date_overrides FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update market date overrides"
  ON public.market_date_overrides FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete market date overrides"
  ON public.market_date_overrides FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
