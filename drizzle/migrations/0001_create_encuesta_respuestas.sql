CREATE TABLE public.encuesta_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_respuesta text NOT NULL UNIQUE,
  origen text NOT NULL DEFAULT 'directo',
  dispositivo text,
  iniciada_en timestamptz,
  completada_en timestamptz,
  frecuencia text,
  cantidad_mercados text,
  gasto text,
  categorias text[] NOT NULL DEFAULT '{}',
  lealtad text,
  descubrimiento text[] NOT NULL DEFAULT '{}',
  motivadores text[] NOT NULL DEFAULT '{}',
  precio_maximo text,
  intencion_24 text,
  plan text,
  dudas text,
  dudas_otro text,
  region text,
  edad text,
  sexo text,
  email text,
  consentimiento_email boolean NOT NULL DEFAULT false,
  email_momento text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.encuesta_respuestas TO authenticated;
GRANT ALL ON public.encuesta_respuestas TO service_role;
ALTER TABLE public.encuesta_respuestas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view encuesta" ON public.encuesta_respuestas
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_encuesta_respuestas_updated_at BEFORE UPDATE ON public.encuesta_respuestas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();