
-- Enums
create type public.market_category as enum ('Mercado Agrícola', 'Bazar / Pop-up', 'Feria Artesanal', 'Food Market', 'Mercado Mixto', 'Flea Market');
create type public.market_region as enum ('Metro', 'Norte', 'Sur', 'Este', 'Oeste', 'Centro');
create type public.market_frequency as enum ('Único', 'Semanal', 'Quincenal', 'Mensual');
create type public.click_type as enum ('view_detail', 'click_phone', 'click_email', 'click_instagram', 'click_directions');

-- updated_at trigger fn
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- markets table
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.market_category not null,
  region public.market_region not null,
  municipality text not null,
  address text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  frequency public.market_frequency,
  image_url text,
  organizer_name text not null,
  organizer_phone text,
  organizer_email text,
  organizer_instagram text,
  is_active boolean not null default true,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger markets_set_updated_at
before update on public.markets
for each row execute function public.set_updated_at();

-- market_clicks
create table public.market_clicks (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  click_type public.click_type not null,
  created_at timestamptz not null default now()
);

-- page_views
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.markets enable row level security;
alter table public.market_clicks enable row level security;
alter table public.page_views enable row level security;

-- markets policies
create policy "Public can view active markets"
  on public.markets for select
  to anon, authenticated
  using (is_active = true);

create policy "Authenticated can view all markets"
  on public.markets for select
  to authenticated
  using (true);

create policy "Authenticated can insert markets"
  on public.markets for insert
  to authenticated
  with check (true);

create policy "Authenticated can update markets"
  on public.markets for update
  to authenticated
  using (true) with check (true);

create policy "Authenticated can delete markets"
  on public.markets for delete
  to authenticated
  using (true);

-- market_clicks policies
create policy "Anyone can insert market clicks"
  on public.market_clicks for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read market clicks"
  on public.market_clicks for select
  to authenticated
  using (true);

-- page_views policies
create policy "Anyone can insert page views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read page views"
  on public.page_views for select
  to authenticated
  using (true);

-- increment_view_count function
create or replace function public.increment_view_count(market_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.markets set view_count = view_count + 1 where id = market_id;
$$;

-- indexes
create index markets_event_date_idx on public.markets(event_date);
create index markets_region_idx on public.markets(region);
create index markets_category_idx on public.markets(category);
create index market_clicks_market_id_idx on public.market_clicks(market_id);
