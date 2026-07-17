
DROP POLICY IF EXISTS "Admins pueden gestionar emprendedores" ON public.emprendedores;

CREATE POLICY "Admins pueden gestionar emprendedores"
  ON public.emprendedores
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
