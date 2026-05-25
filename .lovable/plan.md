## Problem

`MarketImage.tsx` toggles a `filter: blur(8px) → blur(0)` via a `loaded` state set in `onLoad`. The logic itself is correct, but `onLoad` does not fire reliably for images already in the browser cache (common when scrolling back through `MarketCard` / `CategoryRow`, or when the same image appears in the grid and the detail dialog). When that happens, `loaded` stays `false` forever and the image is permanently blurred.

This is the only blur source in the file (no `blur-sm` Tailwind class is used) — both the `cover` and `contain` branches have the same bug.

## Fix

In `src/components/rutamercado/MarketImage.tsx`:

1. Attach a `ref` to each `<img>` (one for the `contain` branch, one for the `cover` branch).
2. Add a `useEffect` that, after mount and whenever `src` changes, checks `img.complete && img.naturalWidth > 0`. If true, the image came from cache — call `setLoaded(true)` immediately (and, for the `contain` branch, also fire the existing `onOrientation` calculation so behavior stays identical to the `onLoad` path).
3. Reset `loaded` to `false` when `src` changes, so a new image starts blurred again before its own `onLoad` resolves.
4. Keep the existing `onLoad` handlers as-is (they remain the primary path for non-cached loads).

No changes to:
- Styles, classes, transitions, sizes, `object-*` rules, gradients
- The fallback (no-`src`) branch
- The `onOrientation` contract
- Any other component

## Verification

- Scroll `CategoryRow` back and forth so cards re-mount with cached images → images should be sharp, not blurred.
- Open a market in `MarketDetailDialog` whose image already rendered in a `MarketCard` → detail image should be sharp.
- First-time load of a new image → brief blur, then sharp (unchanged behavior).
