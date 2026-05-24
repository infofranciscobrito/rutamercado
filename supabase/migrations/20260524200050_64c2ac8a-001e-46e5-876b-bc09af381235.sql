-- 1. Submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Submissions table
CREATE TABLE public.market_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category public.market_category NOT NULL,
  region public.market_region NOT NULL,
  municipality text NOT NULL,
  address text NOT NULL,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  frequency public.market_frequency,
  image_url text,
  organizer_name text NOT NULL,
  organizer_phone text,
  organizer_email text,
  organizer_instagram text,
  status public.submission_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  published_market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_submissions_status ON public.market_submissions(status, created_at DESC);
CREATE INDEX idx_market_submissions_email ON public.market_submissions(organizer_email, created_at DESC);

CREATE TRIGGER market_submissions_set_updated_at
BEFORE UPDATE ON public.market_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.market_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can create submissions"
ON public.market_submissions FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL AND published_market_id IS NULL);

-- Admins manage submissions
CREATE POLICY "Admins can view submissions"
ON public.market_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
ON public.market_submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
ON public.market_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow anon uploads to submissions/ subfolder in market-images bucket
CREATE POLICY "Anyone can upload submission images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'market-images'
  AND (storage.foldername(name))[1] = 'submissions'
);