CREATE TABLE public.producer_update_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_name text NOT NULL,
  market_names text,
  requester_email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.producer_update_requests TO authenticated;
GRANT INSERT ON public.producer_update_requests TO anon;
GRANT ALL ON public.producer_update_requests TO service_role;

ALTER TABLE public.producer_update_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit producer update requests"
ON public.producer_update_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(producer_name)) > 0
  AND length(trim(requester_email)) > 0
  AND requester_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) > 0
  AND length(message) <= 4000
  AND status = 'pending'
);

CREATE POLICY "Admins can view producer update requests"
ON public.producer_update_requests
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update producer update requests"
ON public.producer_update_requests
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete producer update requests"
ON public.producer_update_requests
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_producer_update_requests_updated_at
BEFORE UPDATE ON public.producer_update_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();