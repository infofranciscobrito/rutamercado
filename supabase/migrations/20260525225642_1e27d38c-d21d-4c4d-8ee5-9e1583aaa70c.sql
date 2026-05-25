-- Add new click_type value for attendance intent tracking
ALTER TYPE public.click_type ADD VALUE IF NOT EXISTS 'click_attendance';

-- Create attendance intentions table
CREATE TABLE public.market_attendance_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  intention_type text NOT NULL CHECK (intention_type IN ('will_attend', 'interested')),
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attendance_market_id ON public.market_attendance_intentions(market_id);
CREATE INDEX idx_attendance_intention_type ON public.market_attendance_intentions(intention_type);
CREATE INDEX idx_attendance_created_at ON public.market_attendance_intentions(created_at);

ALTER TABLE public.market_attendance_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record attendance intention"
  ON public.market_attendance_intentions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view attendance intentions"
  ON public.market_attendance_intentions
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
