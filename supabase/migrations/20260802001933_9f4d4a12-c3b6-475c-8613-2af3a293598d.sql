ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS destacado_desde timestamptz;

UPDATE public.markets SET destacado_desde = now() WHERE destacado = true AND destacado_desde IS NULL;

CREATE OR REPLACE FUNCTION public.set_destacado_desde()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  if new.destacado is distinct from old.destacado then
    if new.destacado then
      new.destacado_desde = now();
    else
      new.destacado_desde = null;
    end if;
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_markets_destacado_desde ON public.markets;
CREATE TRIGGER trg_markets_destacado_desde
BEFORE UPDATE ON public.markets
FOR EACH ROW EXECUTE FUNCTION public.set_destacado_desde();

CREATE OR REPLACE FUNCTION public.set_destacado_desde_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  if new.destacado then
    new.destacado_desde = coalesce(new.destacado_desde, now());
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_markets_destacado_desde_ins ON public.markets;
CREATE TRIGGER trg_markets_destacado_desde_ins
BEFORE INSERT ON public.markets
FOR EACH ROW EXECUTE FUNCTION public.set_destacado_desde_insert();

ALTER TABLE public.market_clicks ADD COLUMN IF NOT EXISTS era_destacado boolean;
ALTER TABLE public.market_attendance_intentions ADD COLUMN IF NOT EXISTS era_destacado boolean;

CREATE INDEX IF NOT EXISTS idx_market_clicks_era_destacado ON public.market_clicks (era_destacado);
CREATE INDEX IF NOT EXISTS idx_market_intentions_era_destacado ON public.market_attendance_intentions (era_destacado);