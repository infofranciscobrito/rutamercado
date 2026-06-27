
ALTER TABLE public.productores
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending','approved'));

CREATE INDEX IF NOT EXISTS productores_status_idx ON public.productores(status);

-- Replace public SELECT policy so only approved producers are public.
DROP POLICY IF EXISTS "Productores son públicos para lectura" ON public.productores;
CREATE POLICY "Productores aprobados son públicos para lectura"
  ON public.productores
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Allow anonymous public registration as pending.
GRANT INSERT ON public.productores TO anon;
GRANT INSERT ON public.productor_mercados TO anon;

CREATE POLICY "Cualquiera puede registrarse como productor pendiente"
  ON public.productores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Cualquiera puede añadir mercados a productor pendiente"
  ON public.productor_mercados
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.productores p
      WHERE p.id = productor_id AND p.status = 'pending'
    )
  );
