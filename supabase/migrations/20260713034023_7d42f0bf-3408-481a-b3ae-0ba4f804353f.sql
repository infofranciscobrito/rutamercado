ALTER TABLE public.market_submissions
  ADD COLUMN pets text,
  ADD COLUMN parking text,
  ADD COLUMN accessibility text,
  ADD COLUMN payment_methods text[],
  ADD COLUMN family_friendly text,
  ADD COLUMN food_area text;

ALTER TABLE public.markets
  ADD COLUMN pets text,
  ADD COLUMN parking text,
  ADD COLUMN accessibility text,
  ADD COLUMN payment_methods text[],
  ADD COLUMN family_friendly text,
  ADD COLUMN food_area text;