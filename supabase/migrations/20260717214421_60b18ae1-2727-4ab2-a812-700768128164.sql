
CREATE TABLE public.emprendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_negocio text NOT NULL,
  logo_url text,
  descripcion text NOT NULL,
  categoria_producto text NOT NULL,
  region text,
  municipio text,
  instagram text,
  email text,
  telefono text,
  persona_contacto text,
  mercados_interes text[],
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.emprendedores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emprendedores TO authenticated;
GRANT ALL ON public.emprendedores TO service_role;

ALTER TABLE public.emprendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emprendedores aprobados son públicos para lectura"
  ON public.emprendedores FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Cualquiera puede registrarse como emprendedor pendiente"
  ON public.emprendedores FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins pueden gestionar emprendedores"
  ON public.emprendedores FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_emprendedores_updated_at
  BEFORE UPDATE ON public.emprendedores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX emprendedores_status_idx ON public.emprendedores(status);
CREATE INDEX emprendedores_categoria_idx ON public.emprendedores(categoria_producto);
CREATE INDEX emprendedores_region_idx ON public.emprendedores(region);
