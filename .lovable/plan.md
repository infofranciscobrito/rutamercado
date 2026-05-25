# Desglose de intención de asistencia por mercado individual

Corregir las queries y vistas de intención para que toda la data esté agrupada por mercado individual (con nombre, categoría, municipio, vistas y tasa), añadir drill-down por mercado, y hacer todo navegable con filtro.

## 1. Backend — `src/lib/admin-analytics.functions.ts`

- **Reescribir `getTopMarketsByIntention`**: hacer `GROUP BY market_id` real trayendo de `markets` los campos `name, category, municipality, view_count`, hacer left join con `market_attendance_intentions` (no descartar mercados sin intención si se quiere ver el universo — pero para el "Top 10" sí filtrar `total > 0`). Conteo de vistas de detalle desde `market_clicks` con `click_type='view_detail'` agrupado por `market_id`. Devolver: `id, rank, name, category, municipality, willAttend, interested, total, detailViews, intentionRate`. Ordenado por `total DESC`. Aceptar input opcional `{ limit?: number }` para reutilizar la query para el dashboard (top 5) y para el CSV (sin límite).
- **Nueva `getIntentionMarketDetail({ marketId })`**: para el drill-down de una fila. Devuelve:
  - `market`: `{ id, name, category, municipality, view_count }`
  - `willAttend`, `interested`, `total`, `detailViews`, `intentionRate`
  - `uniqueVisitors`: count distinct `visitor_id` filtrado por ese `market_id`
  - `daily`: serie de 30 días `[{ date, willAttend, interested }]` filtrada por ese `market_id`
- **Mantener** `getAttendanceMetrics`, `getIntentionsPerDay` (global) tal cual.
- Validación zod estricta de `marketId` uuid.

## 2. Dashboard — `src/routes/_admin/admin.dashboard.tsx`

- La `MetricCard` "Intención de Asistencia" se mantiene con total + subtexto "X van a ir · Y interesados".
- Debajo de la grid de métricas, agregar una nueva card "Top 5 mercados por intención":
  - Lista numerada `1. {nombre} — {X} van a ir · {Y} interesados`
  - Cada item es un `Link` a `/admin/analytics?market={id}` (TanStack Router con search params)
  - Si no hay datos: estado vacío "Aún no hay intenciones registradas"
- Datos vía `getTopMarketsByIntention({ limit: 5 })`.

## 3. Analíticas — `src/routes/_admin/admin.analytics.tsx`

- **Search param `?market={id}`** opcional para destacar/expandir un mercado.
- **Tabla "Top 10 Mercados por Intención"** — corregir columnas:
  - `#`, `Mercado` (clickeable — toggle expand), `Categoría` (Badge), `Municipio`, `Voy a ir`, `Me interesa`, `Total`, `Vistas`, `Tasa %`
  - Click en el nombre → expandir la fila para mostrar el panel de detalle (carga `getIntentionMarketDetail` on-demand con `useQuery` enabled).
  - Si `?market={id}` está en la URL al cargar, expandir automáticamente esa fila y hacer scroll.
- **Panel de detalle expandido por fila**:
  - Nombre completo + badges (categoría, municipio)
  - Grid 2 columnas: `PieChart` dona (Voy a ir #f8b625 vs Me interesa #FEF3C7) + `LineChart` 30 días por tipo (mismos colores que la línea global)
  - Mini-cards: visitantes únicos, tasa de conversión (`intentionRate`)
- **BarChart "Intención por Mercado"** — corregir:
  - `dataKey="name"` en `XAxis` con `tickFormatter` que trunca a ~14 chars + ellipsis
  - `Tooltip` custom que muestra nombre completo + "X van a ir · Y interesados · Z total"
  - Barras apiladas dorado/crema (ya están)
- **CSV** — reemplazar columnas por: `nombre_mercado, categoria, municipio, vistas, voy_a_ir, me_interesa, total_intenciones, tasa_intencion`. Una fila por mercado (usar `getTopMarketsByIntention()` sin limit, no solo top 10 → el handler ya soporta `limit` opcional).

## 4. Tabla de mercados — `src/routes/_admin/admin.markets.tsx`

- Columna "Intención" muestra `{X} van / {Y} interés` (con íconos pequeños `Hand` dorado y `Eye` muted), o "—" si 0.
- La celda es un `Link` a `/admin/analytics?market={id}`.
- Quitar el tooltip (el desglose ya está visible).

## 5. Notas técnicas

- Toda agregación se hace en JS sobre `select` de Supabase (no hay PostgREST GROUP BY) — el patrón es traer las filas crudas y agruparlas con `Map`, como ya hace el archivo. La "query SQL ejemplo" del usuario sirve de referencia conceptual; la implementación equivalente es: `select id,name,category,municipality,view_count from markets` + `select market_id,intention_type from market_attendance_intentions` + agrupar por `market_id`.
- Sin cambios en el modal público ni en el sistema de votación.
- Sin cambios visuales fuera del panel de detalle nuevo y los formatos de celda mencionados.
- Cache keys de React Query incluyen `marketId` para drill-down.
