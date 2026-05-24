## Panel de Administración RutaMercado

Implementaré un panel admin protegido en `/admin/*` con autenticación email+password de Lovable Cloud, sidebar fija con branding, y tres páginas (dashboard, mercados, analíticas) que ya leen y escriben contra la base de datos existente.

### 1. Backend (Lovable Cloud)

**Auth**
- Habilitar email/password (sin auto-confirm; el admin se crea desde Cloud o se confirma manualmente).
- Sin tabla `profiles` (no se necesitan datos extra de usuario; cualquier usuario autenticado es admin para este MVP).

**Storage**
- Migración: crear bucket público `market-images` con políticas RLS:
  - SELECT público (cualquiera puede ver imágenes).
  - INSERT / UPDATE / DELETE solo para `authenticated`.

**Server functions nuevas** (todas con `requireSupabaseAuth`):
- `src/lib/admin-markets.functions.ts`: `listAllMarkets`, `upsertMarket(input)`, `deleteMarket(id)`, `toggleMarketActive(id, isActive)`.
- `src/lib/admin-analytics.functions.ts`: `getDashboardMetrics()`, `getViewsPerMarket()` (top 10), `getClicksPerDay(days)`, `getUpcomingMarkets(limit)`, `getAnalyticsOverview(rangeDays)`, `getTopMarkets(rangeDays)`, `getTopOrganizers(rangeDays)`, `getDistributionByCategory()`, `getDistributionByRegion()`, `getDailyTraffic(rangeDays)`.

**Wiring de auth**
- Añadir `attachSupabaseAuth` como `functionMiddleware` global en `src/start.ts` (requerido para que los serverFn protegidos reciban el bearer token).
- Listener `onAuthStateChange` en `__root.tsx` para invalidar router + queries en login/logout.

### 2. Rutas (file-based)

```
src/routes/
  admin/
    login.tsx                  → /admin/login  (pública)
  _admin.tsx                   → layout pathless protegido (beforeLoad + sidebar)
  _admin/
    admin.tsx                  → redirect a /admin/dashboard
    admin.dashboard.tsx        → /admin/dashboard
    admin.markets.tsx          → /admin/markets
    admin.analytics.tsx        → /admin/analytics
```

- `_admin.tsx`: `beforeLoad` hace `supabase.auth.getUser()`; si no hay usuario → `redirect({ to: '/admin/login' })`. Renderiza `<AdminLayout><Outlet/></AdminLayout>`.
- `admin/login.tsx`: si ya hay sesión, redirige a `/admin/dashboard`. Formulario con `supabase.auth.signInWithPassword`.

### 3. Componentes UI

`src/components/admin/`:
- `AdminLayout.tsx` — sidebar 250px en desktop, `Sheet` colapsable en mobile, header con botón menú móvil + email del usuario + cerrar sesión.
- `AdminSidebar.tsx` — logo arriba, nav items (Dashboard, Mercados, Analíticas, Cerrar Sesión) con icons `lucide-react` (BarChart3, Store, TrendingUp, LogOut). Item activo: fondo `bg-[#f8b625]/15`, borde izquierdo 3px `#f8b625`, texto `#f8b625`. Inactivos: `text-white/70`.
- `MetricCard.tsx` — icono circular con fondo `bg-primary/15`, número en DM Serif Display 32px navy, label DM Sans 14px muted.
- `MarketFormDrawer.tsx` — `Sheet side="right"` con react-hook-form + zod, todos los campos del schema. Sube imagen al bucket `market-images` (path `${crypto.randomUUID()}-${file.name}`), guarda la URL pública. Botones Guardar (#f8b625) y Cancelar.
- `MarketsTable.tsx` — tabla con buscador, filtro por categoría, paginación 20/pág, toggle de activo, acciones editar/eliminar (con confirm dialog).
- `DateRangePicker.tsx` — selector con presets 7/30/90 días + custom.
- `ExportCSVButton.tsx` — helper para descargar arrays como CSV.

### 4. Dashboard

- 4 `MetricCard`: mercados activos, suma de `view_count`, mercados próximos 7 días, total `market_clicks`.
- `BarChart` (Recharts, ya instalado vía `chart.tsx`) — top 10 mercados por vistas.
- `LineChart` — clics por día últimos 30 días.
- Tabla — próximos 5 mercados (nombre, fecha es-PR, municipio, vistas).

### 5. Mercados

- `listAllMarkets` → tabla con búsqueda client-side, filtro por categoría, paginación 20.
- Toggle `is_active` llama `toggleMarketActive` con optimistic update.
- "Agregar Mercado" / "Editar" abren `MarketFormDrawer`. Al guardar invalida `['admin-markets']` y la query pública `['markets']`.
- Eliminar: `AlertDialog` de confirmación → `deleteMarket`.

### 6. Analíticas

- Selector de rango (7/30/90/custom).
- Métricas: page_views home, view_detail clicks, contact clicks (phone+email+instagram), directions clicks, engagement rate.
- Tablas: Top 10 mercados, Top organizadores (con `Export CSV`).
- Pie charts: distribución por categoría y región. Line chart: tráfico diario.

### 7. Detalles técnicos

- **Paquetes a instalar**: `recharts` ya está. `react-hook-form` + `@hookform/resolvers` + `zod` (verificar; si faltan, `bun add`). `date-fns` para formato es-PR (ya importado vía `format.ts`).
- **Query keys**: `['admin','markets']`, `['admin','dashboard']`, `['admin','analytics', rangeDays]`.
- **Read shape**: loaders usan `ensureQueryData(queryOptions)` y componentes `useSuspenseQuery`.
- **Storage upload**: cliente browser `supabase.storage.from('market-images').upload(path, file, { upsert: false })` → `getPublicUrl(path)`.
- **Logout**: `supabase.auth.signOut()` → `router.navigate({ to: '/admin/login' })`.
- **No tocar** el directorio público existente (`/`) ni el cliente Supabase auto-generado.

### Pasos de ejecución

1. Migración: bucket `market-images` + políticas RLS (requiere aprobación del usuario).
2. Habilitar email auth + pedir al usuario crear cuenta admin desde Cloud → Users.
3. Wire `attachSupabaseAuth` en `start.ts` + listener en `__root.tsx`.
4. ServerFns admin (markets + analytics).
5. Componentes admin (layout, sidebar, drawer, tabla, métricas, charts).
6. Rutas (`_admin.tsx`, `admin.dashboard.tsx`, `admin.markets.tsx`, `admin.analytics.tsx`, `admin/login.tsx`).
7. Verificar build y flujos de login/CRUD/upload.
