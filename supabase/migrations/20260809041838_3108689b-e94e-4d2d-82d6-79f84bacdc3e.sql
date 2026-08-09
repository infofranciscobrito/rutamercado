ALTER TABLE public.market_clicks ADD COLUMN IF NOT EXISTS traffic_source text;
ALTER TABLE public.market_attendance_intentions ADD COLUMN IF NOT EXISTS traffic_source text;