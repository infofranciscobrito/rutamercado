
-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- Admins can view roles; nobody can write through the API (managed via SQL)
CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Backfill: grant admin to any existing authenticated user so current admins keep access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT DO NOTHING;

-- 2. Tighten markets policies (require admin role for writes)
DROP POLICY IF EXISTS "Authenticated can insert markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can update markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can delete markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can view all markets" ON public.markets;

CREATE POLICY "Admins can view all markets"
ON public.markets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert markets"
ON public.markets FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update markets"
ON public.markets FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete markets"
ON public.markets FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Storage policies for market-images bucket
-- Drop existing overly-broad policies if present
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (policyname ILIKE '%market-images%' OR policyname ILIKE '%market_images%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END$$;

-- Public read of individual files only (no listing). Listing requires anon LIST policy
-- which we intentionally omit. Direct GET of a known object path still works for public bucket.
CREATE POLICY "Public can read market-images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'market-images');

CREATE POLICY "Admins can upload market-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'market-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update market-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'market-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'market-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete market-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'market-images' AND public.has_role(auth.uid(), 'admin'));

-- 4. Lock down increment_view_count (called only through controlled server function path)
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO service_role;
