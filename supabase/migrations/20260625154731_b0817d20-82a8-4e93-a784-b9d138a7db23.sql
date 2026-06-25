ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS organizer_logo_url text;
ALTER TABLE public.producer_update_requests ADD COLUMN IF NOT EXISTS logo_url text;