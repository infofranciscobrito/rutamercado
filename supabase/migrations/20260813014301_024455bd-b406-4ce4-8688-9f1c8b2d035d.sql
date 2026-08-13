ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS seen boolean NOT NULL DEFAULT false;
UPDATE public.newsletter_subscribers SET seen = true WHERE seen = false;
GRANT SELECT, UPDATE ON public.newsletter_subscribers TO authenticated;