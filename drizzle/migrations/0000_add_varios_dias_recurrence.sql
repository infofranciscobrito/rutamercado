ALTER TABLE public.markets DROP CONSTRAINT IF EXISTS markets_recurrence_type_check;
ALTER TABLE public.markets ADD CONSTRAINT markets_recurrence_type_check
  CHECK (recurrence_type IN ('unico','varios_dias','semanal','quincenal','mensual_por_dia'));
ALTER TABLE public.markets DROP CONSTRAINT IF EXISTS markets_recurrence_consistency_check;
ALTER TABLE public.markets ADD CONSTRAINT markets_recurrence_consistency_check
  CHECK (
    (recurrence_type IN ('unico','varios_dias') AND recurrence_day_of_week IS NULL AND recurrence_week_of_month IS NULL)
    OR (recurrence_type IN ('semanal','quincenal') AND recurrence_day_of_week IS NOT NULL AND recurrence_week_of_month IS NULL)
    OR (recurrence_type = 'mensual_por_dia' AND recurrence_day_of_week IS NOT NULL AND recurrence_week_of_month IS NOT NULL)
  );
ALTER TABLE public.market_submissions DROP CONSTRAINT IF EXISTS msubs_recurrence_type_check;
ALTER TABLE public.market_submissions ADD CONSTRAINT msubs_recurrence_type_check
  CHECK (recurrence_type IN ('unico','varios_dias','semanal','quincenal','mensual_por_dia'));