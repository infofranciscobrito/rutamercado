In `src/routes/__root.tsx`, wrap `<Outlet />` with a true React class-based `ErrorBoundary` so unhandled rendering crashes show a friendly fallback instead of a blank screen. Also align the existing route `ErrorComponent` wording so both fallbacks speak the same language.

### What to build

1. **Add a class `ErrorBoundary`** in `__root.tsx`
   - `state = { hasError: false }`
   - `static getDerivedStateFromError()` → `{ hasError: true }`
   - `componentDidCatch(error, info)` → `console.error` both
   - `render()`:
     - If `hasError`, return a centered, minimal fallback:
       - Heading: "Something went wrong"
       - Subtext: "An unexpected error occurred. Please reload the page."
       - Primary button: "Reload page" → `window.location.reload()`
       - Keep it minimal — same container structure (`flex min-h-screen items-center justify-center bg-background px-4`) so it respects the theme and is never a blank white screen.
     - Otherwise render `this.props.children`

2. **Wrap `<Outlet />`** inside `RootComponent` with the new `<ErrorBoundary>`.

3. **Update the existing `ErrorComponent`** (the route-level TanStack fallback) so it matches:
   - Change heading from "This page didn't load" → "Something went wrong"
   - Change the primary button label from "Try again" → "Reload page" and make it call `window.location.reload()` instead of `router.invalidate() + reset()`
   - Keep the "Go home" secondary link
   - Keep all existing Tailwind classes exactly as-is (no color, font, spacing changes)

### What NOT to change
- No new files created.
- No dependency installs needed.
- No changes to `shellComponent`, `head`, `notFoundComponent`, `AuthInvalidator`, or any other route/page styling.