CREATE TABLE public.mesas_aliadas_interes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_respuesta text NOT NULL UNIQUE,
  origen text NOT NULL DEFAULT 'directo',
  dispositivo text,
  is_test boolean NOT NULL DEFAULT false,
  iniciada_en timestamptz,
  completada_en timestamptz,
  categoria text NOT NULL,
  frecuencia text NOT NULL,
  ticket text NOT NULL,
  descuento text NOT NULL,
  recibir text[] NOT NULL DEFAULT '{}',
  interes text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('anonima', 'con_contacto')),
  negocio text,
  instagram text,
  email text,
  telefono text,
  consentimiento boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mesas_aliadas_interes TO authenticated;
GRANT ALL ON public.mesas_aliadas_interes TO service_role;
ALTER TABLE public.mesas_aliadas_interes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view mesas aliadas interes" ON public.mesas_aliadas_interes
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_mesas_aliadas_interes_updated_at BEFORE UPDATE ON public.mesas_aliadas_interes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();