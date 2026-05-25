## Objective
Improve image loading in `MarketImage.tsx` and `MarketCard.tsx` by adding blur placeholders and preventing layout shift, without changing any colors, fonts, spacing, or other visual styling.

## Files to Modify

### 1. `src/components/rutamercado/MarketImage.tsx`
- `loading="lazy"` is already present on both `<img>` tags — confirm and preserve.
- Add `useState` to track `loaded` state per image instance.
- While `!loaded`, render the `<img>` with `filter: blur(8px)` and `opacity: 0.7`.
- On `onLoad`, set `loaded = true` and transition to `filter: blur(0)` and `opacity: 1` using Tailwind `transition-all duration-500`.
- Add explicit `width` and `height` attributes:
  - `cover` branch: `width={320} height={180}` (16:9 ratio hint for browsers).
  - `contain` branch: `width={800} height={600}` (4:3 generic ratio hint).
- No changes to colors, fonts, spacing, or className defaults.

### 2. `src/components/rutamercado/MarketCard.tsx`
- The card image container already uses `aspect-video`, which prevents CLS at the container level.
- No visual styling changes required; the `MarketImage` component handles the blur and intrinsic sizing.

### 3. `src/components/rutamercado/MarketDetailDialog.tsx`
- Add `min-h-[280px]` to the top image container so it does not fully collapse before the image loads, reducing modal-level CLS.
- No other visual styling changes.

## Verification
- Open the preview, scroll to cards, and observe images loading with a soft blur that clears into focus.
- Confirm no visual regressions in colors, spacing, fonts, or card dimensions.
- Confirm `loading="lazy"` remains on all `<img>` elements.