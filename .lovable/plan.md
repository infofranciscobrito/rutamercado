## Changes

### 1. `src/components/rutamercado/CategoryRow.tsx` — static grid
- Remove `useRef`, scroll handlers, `ChevronLeft`/`ChevronRight` import, and the prev/next arrow buttons.
- Sort `markets` by closest `nextDate` ascending and slice to first 4.
- Replace the horizontal scroll container with a responsive CSS grid:
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`
  - Cards stretch to fill column width — update `MarketCard` usage to drop `fixedWidth` so cards adapt to their grid cell (verify `MarketCard` supports flexible width; otherwise wrap in `w-full` cell and pass a `fullWidth` prop). Quick read of `MarketCard` will confirm the right knob.
  - If fewer than 4 markets exist, render only what's available — empty grid cells stay empty (cards do not stretch).
- Move the "Ver todos los [categoría]" CTA OUT of the first card cell into a fixed block beneath the grid:
  - Always rendered when `ctaHref` + `ctaLabel` are provided (independent of card count).
  - `mt-4 mb-5` (16px top / 20px bottom), left-aligned.
  - Same yellow styling already in use (#f8b625 bg, #1c1e37 text, DM Sans 14/600, rounded-lg).

### 2. `src/components/rutamercado/Footer.tsx` — unify with AboutSection
- Change background from `bg-[#141628]` to `bg-[#1c1e37]` so it matches `AboutSection`.
- At the very top of the footer, render a centered divider: `mx-auto h-[2px] w-20 bg-[#f8b625]` with `py-[30px]` wrapper (30px top + 30px bottom spacing) so the gold line sits between the two navy blocks.
- Keep the rest of the footer (logo, copyright, links) unchanged.

### 3. No other files touched
- Header, Hero, FilterBar, MarketCard internals, modal, category pages, admin — all untouched.
- `src/routes/index.tsx` already passes `ctaHref`/`ctaLabel`; no change needed.

## Technical notes
- MarketCard currently accepts `fixedWidth` (used for the horizontal carousel). Will read it to decide: if it has a non-fixed mode, use that; otherwise pass `style={{ width: "100%" }}` via a small wrapper and rely on the existing card max-width being overridden by the grid cell. Goal: 4 equal cards in one desktop row inside the `max-w-7xl` container without horizontal scroll.
- Sorting source: `EnrichedMarket.upcoming[0]?.date` (already what filtering uses); fall back to original order if missing.
