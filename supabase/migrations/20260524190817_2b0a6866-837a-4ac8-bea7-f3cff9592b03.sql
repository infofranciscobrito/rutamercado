
-- Fully revoke execute on SECURITY DEFINER helpers (database uses them internally via RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC, anon, authenticated;

-- Drop public SELECT policy on storage.objects for market-images (public bucket serves files
-- via CDN without needing a SELECT policy). This prevents object listing while still allowing
-- direct file reads through the public URL.
DROP POLICY IF EXISTS "Public can read market-images" ON storage.objects;
