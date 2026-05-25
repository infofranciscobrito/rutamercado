## Objective
Replace the current `SkeletonRow` fallback in the main market listing with a grid of skeleton cards that matches the real `MarketGrid` layout.

## Current State
- `index.tsx` wraps `MarketsContent` in `<Suspense>` with a fallback that renders `Hero` + `SkeletonRow`.
- `SkeletonRow` is a horizontally scrolling row of fixed-width cards — it does not match the real grid layout.
- `SkeletonGrid` already exists in `SkeletonCard.tsx` and uses the exact same grid classes as `MarketGrid`: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`.

## Changes
### 1. `src/routes/index.tsx` — Update Suspense fallback
- Replace the `<SkeletonRow />` inside the fallback with `<SkeletonGrid count={8} />`.
- Wrap `SkeletonGrid` in `<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">` so its outer container matches the real `MarketGrid` container.

No other files are touched. No colors, fonts, or spacing are changed.