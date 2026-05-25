### Current State
The `EmptyState` component already exists and is wired into `index.tsx` after the Suspense boundary. However, the message is generic ("con esos filtros") and doesn't tell the user which filters are actually active.

### Changes

1. **index.tsx** — Pass active filter details into `EmptyState` so it can render a contextual message.
   - Build a small helper that describes the currently applied filters (search term, region, category, date).
   - Pass that description as a new prop to `EmptyState`.

2. **EmptyState.tsx** — Enhance the message when filters are active.
   - If a filter description is provided, render something like:  
     "No encontramos mercados para *categoría: Artesanal, región: San Juan*"
   - Keep the existing "Ver todos los mercados" / "Limpiar filtros" button logic.
   - Keep the `isTodayFilter` branch unchanged.

3. **Verify boundary** — Confirm `EmptyState` is only reachable inside `MarketsContent` (post-`useSuspenseQuery`) and never during the `Suspense` fallback. No structural change needed here; the current boundary is already correct.

No colors, fonts, spacing, or layout styling will be changed.