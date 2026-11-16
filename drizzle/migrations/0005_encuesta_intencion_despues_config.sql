ALTER TABLE public.encuesta_respuestas ADD COLUMN IF NOT EXISTS intencion_24_despues text;
CREATE TABLE public.encuesta_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  peso_seguro numeric NOT NULL DEFAULT 0.75 CHECK (peso_seguro >= 0 AND peso_seguro <= 1),
  peso_probable numeric NOT NULL DEFAULT 0.25 CHECK (peso_probable >= 0 AND peso_probable <= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.encuesta_config TO authenticated;
GRANT ALL ON public.encuesta_config TO service_role;
ALTER TABLE public.encuesta_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins leen config encuesta" ON public.encuesta_config FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Admins crean config encuesta" ON public.encuesta_config FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Admins editan config encuesta" ON public.encuesta_config FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
INSERT INTO public.encuesta_config (id) VALUES (1) ON CONFLICT DO NOTHING;