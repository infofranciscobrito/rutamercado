DROP POLICY IF EXISTS "Authenticated can read market clicks" ON public.market_clicks;
DROP POLICY IF EXISTS "Admins can read market clicks" ON public.market_clicks;
CREATE POLICY "Admins can read market clicks"
  ON public.market_clicks
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can read page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can read page views" ON public.page_views;
CREATE POLICY "Admins can read page views"
  ON public.page_views
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can record attendance intention" ON public.market_attendance_intentions;
CREATE POLICY "Anyone can record attendance intention"
  ON public.market_attendance_intentions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    intention_type IN ('going', 'interested', 'maybe', 'not_going')
    AND length(visitor_id) BETWEEN 1 AND 128
    AND EXISTS (
      SELECT 1 FROM public.markets m
      WHERE m.id = market_id AND m.is_active = true
    )
  );