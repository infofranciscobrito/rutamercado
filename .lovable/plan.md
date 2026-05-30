## Problema

Solo se cambió `/enviar` a verde. La página principal (`/`), las páginas de categoría y todo el panel de administración (`/admin/*`) siguen mostrando el dorado `#f8b625`.

## Solución

Reemplazo global de la paleta amarilla por la verde en **todos** los archivos del proyecto (front público + backend admin + tokens globales).

### Sustituciones

- `#f8b625` → `#54b678` (color principal)
- `#f59e0b` → `#3f9560` (hover / gradiente medio)
- `#d97706` → `#2f7a4c` (gradiente final, solo en `--rm-gradient-brand`)
- `rgba(248, 182, 37, X)` → `rgba(84, 182, 120, X)` (sombras, patrón de puntos, focus rings)

### Archivos a modificar

1. **Tokens globales** — `src/styles.css` (`--color-gold`, `--rm-shadow-gold`, `--rm-gradient-brand`, `--rm-dot-pattern`, focus outline y comentario de paleta).
2. **Front público** — todos los componentes en `src/components/rutamercado/` que usan amarillo: `Header`, `Hero`, `Footer`, `AboutSection`, `FilterBar`, `ActiveFilterChips`, `ViewToggle`, `WeekStrip`, `MarketCard`, `MarketImage`, `MarketDetailDialog`, `CategoryRow`, `CategoryPage`, `EmptyState`, `SkeletonCard`, `SubmitMarketForm`, `ImageUpload16x9`.
3. **Panel admin (backend)**:
   - `src/components/admin/AdminLayout.tsx`, `AdminSidebar.tsx`, `MetricCard.tsx`, `MarketFormDrawer.tsx`, `SubmissionReviewDrawer.tsx`
   - `src/routes/admin.login.tsx`
   - `src/routes/_admin/admin.dashboard.tsx`, `admin.analytics.tsx`, `admin.markets.tsx`, `admin.submissions.tsx`
   - `src/hooks/use-auth-ready.tsx`

### Cómo se aplicará

Un único script de sustitución recorre los archivos listados aplicando las 4 reglas, garantizando consistencia y sin amarillo residual.

## Resultado esperado

Toda la aplicación (home, categorías, `/enviar`, login de admin y todas las pantallas del panel administrativo) queda unificada en verde `#54b678`.
