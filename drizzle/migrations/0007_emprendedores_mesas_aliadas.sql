ALTER TABLE public.emprendedores
  ADD COLUMN IF NOT EXISTS discount_willing text CHECK (discount_willing IN ('si','tal_vez','no')),
  ADD COLUMN IF NOT EXISTS discount_offer text CHECK (discount_offer IN ('5','10','15','otro')),
  ADD COLUMN IF NOT EXISTS discount_offer_other text CHECK (char_length(discount_offer_other) <= 200),
  ADD COLUMN IF NOT EXISTS participation_needs text[] CHECK (participation_needs IS NULL OR cardinality(participation_needs) <= 3),
  ADD COLUMN IF NOT EXISTS participation_needs_other text CHECK (char_length(participation_needs_other) <= 200),
  ADD COLUMN IF NOT EXISTS wants_founder boolean,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;