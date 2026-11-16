ALTER TABLE public.encuesta_respuestas
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS market_slug text,
  ADD COLUMN IF NOT EXISTS survey_version text NOT NULL DEFAULT 'v2',
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
UPDATE public.encuesta_respuestas SET survey_version='v1', completed=true, started_at=iniciada_en, completed_at=completada_en;
ALTER TABLE public.encuesta_respuestas ALTER COLUMN categorias SET DEFAULT '{}', ALTER COLUMN descubrimiento SET DEFAULT '{}', ALTER COLUMN motivadores SET DEFAULT '{}';