ALTER TABLE public.encuesta_respuestas
  ADD COLUMN IF NOT EXISTS descubrimiento_otro text,
  ADD COLUMN IF NOT EXISTS mesas_favoritas text,
  ADD COLUMN IF NOT EXISTS email_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirm_token uuid,
  ADD COLUMN IF NOT EXISTS confirm_sent_to text;
CREATE UNIQUE INDEX IF NOT EXISTS encuesta_respuestas_confirm_token_idx ON public.encuesta_respuestas(confirm_token);