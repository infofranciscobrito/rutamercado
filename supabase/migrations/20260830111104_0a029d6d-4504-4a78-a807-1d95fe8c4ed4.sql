GRANT SELECT ON public.page_views TO authenticated;
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT ALL ON public.page_views TO service_role;