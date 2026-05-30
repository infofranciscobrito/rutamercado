## Cambio

Reemplazo global del azul oscuro `#1c1e37` → `#18253f` en toda la plataforma (front público + panel admin + tokens).

## Alcance

Se aplica en los 28 archivos que actualmente usan `#1c1e37` / `#1C1E37`:

- **Tokens globales**: `src/styles.css` (variables `--color-navy`, sombras, gradientes que referencian el navy).
- **Front público** (`src/components/rutamercado/*`): Header, Footer, Hero, AboutSection, FilterBar, MarketCard, MarketDetailDialog, CategoryRow, CategoryPage, EmptyState, SubmitMarketForm, WeekStrip, ViewToggle, ActiveFilterChips, ImageUpload16x9, SkeletonCard, etc.
- **Páginas**: `src/routes/enviar.tsx`, `src/routes/index.tsx` y rutas de categoría si tienen referencias.
- **Panel admin**: `src/components/admin/*` (AdminLayout, AdminSidebar, MetricCard, MarketFormDrawer, SubmissionReviewDrawer), `src/routes/admin.login.tsx`, `src/routes/_admin/*` (dashboard, analytics, markets, submissions), `src/hooks/use-auth-ready.tsx`.

## Cómo se aplicará

Un único script de sustitución case-insensitive reemplaza `#1c1e37` → `#18253f` en todos los archivos detectados, incluyendo cualquier `rgba(28, 30, 55, X)` por `rgba(24, 37, 63, X)` para mantener consistencia en sombras y overlays.

## Resultado

Header, footer, tipografías navy, fondos del hero, panel admin y todos los acentos azul oscuro quedan unificados en `#18253f`. El verde `#54b678` no se toca.
