ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS organizer_contact_url text;
ALTER TABLE public.market_submissions ADD COLUMN IF NOT EXISTS organizer_contact_url text;