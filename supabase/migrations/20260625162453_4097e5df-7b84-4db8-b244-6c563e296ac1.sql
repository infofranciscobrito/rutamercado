
CREATE TABLE public.productores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text,
  telefono text,
  instagram text,
  website text,
  region text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX productores_nombre_lower_unique ON public.productores (lower(nombre));

GRANT SELECT ON public.productores TO anon, authenticated;
GRANT ALL ON public.productores TO service_role;

ALTER TABLE public.productores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productores son públicos para lectura"
  ON public.productores FOR SELECT
  USING (true);

CREATE POLICY "Admins pueden gestionar productores"
  ON public.productores FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER set_productores_updated_at
  BEFORE UPDATE ON public.productores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.productor_mercados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  productor_id uuid NOT NULL REFERENCES public.productores(id) ON DELETE CASCADE,
  mercado_nombre text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX productor_mercados_unique ON public.productor_mercados (productor_id, lower(mercado_nombre));
CREATE INDEX productor_mercados_productor_idx ON public.productor_mercados (productor_id);

GRANT SELECT ON public.productor_mercados TO anon, authenticated;
GRANT ALL ON public.productor_mercados TO service_role;

ALTER TABLE public.productor_mercados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mercados de productores son públicos para lectura"
  ON public.productor_mercados FOR SELECT
  USING (true);

CREATE POLICY "Admins pueden gestionar mercados de productores"
  ON public.productor_mercados FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

WITH normalized AS (
  SELECT
    id,
    NULLIF(trim(organizer_name), '') AS organizer_name,
    NULLIF(trim(organizer_email), '') AS email,
    NULLIF(trim(organizer_phone), '') AS telefono,
    NULLIF(trim(organizer_instagram), '') AS instagram,
    NULLIF(trim(organizer_contact_url), '') AS website,
    NULLIF(trim(organizer_logo_url), '') AS logo_url,
    region::text AS region
  FROM public.markets
  WHERE is_active = true
    AND NULLIF(trim(organizer_name), '') IS NOT NULL
),
consolidated AS (
  SELECT
    lower(organizer_name) AS key,
    (array_agg(organizer_name ORDER BY id))[1] AS nombre,
    (array_agg(email) FILTER (WHERE email IS NOT NULL))[1] AS email,
    (array_agg(telefono) FILTER (WHERE telefono IS NOT NULL))[1] AS telefono,
    (array_agg(instagram) FILTER (WHERE instagram IS NOT NULL))[1] AS instagram,
    (array_agg(website) FILTER (WHERE website IS NOT NULL))[1] AS website,
    (array_agg(logo_url) FILTER (WHERE logo_url IS NOT NULL))[1] AS logo_url,
    (array_agg(region) FILTER (WHERE region IS NOT NULL))[1] AS region
  FROM normalized
  GROUP BY lower(organizer_name)
)
INSERT INTO public.productores (nombre, email, telefono, instagram, website, logo_url, region)
SELECT nombre, email, telefono, instagram, website, logo_url, region
FROM consolidated
ON CONFLICT ((lower(nombre))) DO NOTHING;

INSERT INTO public.productor_mercados (productor_id, mercado_nombre)
SELECT DISTINCT p.id, m.name
FROM public.markets m
JOIN public.productores p ON lower(p.nombre) = lower(trim(m.organizer_name))
WHERE m.is_active = true
  AND NULLIF(trim(m.organizer_name), '') IS NOT NULL
ON CONFLICT DO NOTHING;
