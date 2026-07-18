ALTER TABLE public.emprendedores 
  ADD COLUMN IF NOT EXISTS categoria_otro text,
  ADD COLUMN IF NOT EXISTS artesano_certificado text;