ALTER TABLE public.encuesta_config
  ADD COLUMN IF NOT EXISTS min_n integer NOT NULL DEFAULT 50 CHECK (min_n >= 1),
  ADD COLUMN IF NOT EXISTS verde_pct numeric NOT NULL DEFAULT 0.20 CHECK (verde_pct >= 0 AND verde_pct <= 1),
  ADD COLUMN IF NOT EXISTS verde_lim_inf numeric NOT NULL DEFAULT 0.10 CHECK (verde_lim_inf >= 0 AND verde_lim_inf <= 1),
  ADD COLUMN IF NOT EXISTS amarillo_pct numeric NOT NULL DEFAULT 0.10 CHECK (amarillo_pct >= 0 AND amarillo_pct <= 1);