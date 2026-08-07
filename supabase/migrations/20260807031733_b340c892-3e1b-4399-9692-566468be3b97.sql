-- simple accent folding without requiring the unaccent extension
CREATE OR REPLACE FUNCTION public.unaccent_fallback(_txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT translate(
    _txt,
    'áàäâãÁÀÄÂÃéèëêÉÈËÊíìïîÍÌÏÎóòöôõÓÒÖÔÕúùüûÚÙÜÛñÑçÇ',
    'aaaaaAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUnNcC'
  );
$$;

-- slug helper
CREATE OR REPLACE FUNCTION public.slugify_market_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(
      lower(public.unaccent_fallback(_name)),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
$$;

ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS slug text;

-- backfill with uniqueness suffixes
WITH numbered AS (
  SELECT id,
         public.slugify_market_name(name) AS base,
         row_number() OVER (PARTITION BY public.slugify_market_name(name) ORDER BY created_at, id) AS rn
  FROM public.markets
  WHERE slug IS NULL OR slug = ''
)
UPDATE public.markets m
SET slug = CASE WHEN n.rn = 1 THEN NULLIF(n.base, '') ELSE NULLIF(n.base, '') || '-' || n.rn END
FROM numbered n
WHERE m.id = n.id;

UPDATE public.markets SET slug = 'mercado-' || left(id::text, 8) WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS markets_slug_key ON public.markets (slug);

-- auto-generate on insert / when cleared
CREATE OR REPLACE FUNCTION public.set_market_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  i int := 1;
BEGIN
  IF new.slug IS NULL OR btrim(new.slug) = '' THEN
    base := public.slugify_market_name(new.name);
    IF base IS NULL OR base = '' THEN
      base := 'mercado';
    END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.markets WHERE slug = candidate AND id IS DISTINCT FROM new.id) LOOP
      i := i + 1;
      candidate := base || '-' || i;
    END LOOP;
    new.slug := candidate;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_markets_set_slug ON public.markets;
CREATE TRIGGER trg_markets_set_slug
BEFORE INSERT OR UPDATE ON public.markets
FOR EACH ROW EXECUTE FUNCTION public.set_market_slug();