# Expansión del panel de Analíticas

Solo lecturas sobre tablas existentes (`market_clicks`, `page_views`, `market_attendance_intentions`, `markets`, `market_submissions`). Sin migraciones, sin nuevos eventos de tracking. Estética actual (cards `rounded-xl border bg-card p-5`, paleta `#54b678` / `#18253f`, `recharts`, shadcn `Table`/`Select`).

## 1. Filtro de fecha unificado

Reemplazar el `<Select>` actual por un control que soporte:
- Últimos 7 días
- Últimos 30 días (default)
- Últimos 90 días
- Este año (desde 1 de enero)
- Rango personalizado (date picker con `Popover` + `Calendar` shadcn, dos fechas)

El estado se modela como `{ preset, from, to }` donde `from`/`to` son ISO. Todas las queries (existentes y nuevas) reciben `{ from, to }` en lugar de `days`. Los server functions se actualizan para aceptar `from`/`to` (z.string().datetime()) manteniendo compatibilidad: si solo viene `days`, se calcula `from`.

## 2. Cambios en `src/lib/admin-analytics.functions.ts`

Ampliar funciones existentes y añadir nuevas (todas con `requireSupabaseAuth`, rango por `from`/`to`):

- `getAnalyticsOverview` → devolver además: `clickPhone`, `clickEmail`, `clickInstagram`, `clickContact` (nuevo `click_contact`), `willAttend`, `interested`, `activeMarkets`, `inactiveMarkets`, `pendingSubmissions`. Lecturas adicionales:
  - `markets` agrupado por `is_active` (count exact head, dos queries).
  - `market_submissions` count head `status='pending'` (sin filtro de fecha, es estado actual).
  - `market_attendance_intentions` en el rango, agregado por `intention_type`.
- `getTopMarkets` → desglosar `contactClicks` en `clickPhone`, `clickEmail`, `clickContact` (URL contacto), mantener `directionsClicks`, e incluir `willAttend`, `interested`, `recurrenceType` (campo `recurrence_type` de `markets`). Join en memoria con `market_attendance_intentions` filtrado por rango.
- `getClicksByType` (nuevo) → group by `click_type` en el rango, devuelve `[{ type, count }]` para los 6 tipos.
- `getTrafficSources` (nuevo) → lee `page_views.referrer` en el rango, normaliza host:
  - vacío/null → "Directo"
  - host contiene `google.` → "Google"
  - `instagram.` → "Instagram"
  - `facebook.`/`fb.` → "Facebook"
  - resto → host limpio
  Devuelve top 10 categorías + tabla detallada por referrer.
- `getPageActivity` (nuevo) → group by `page` en `page_views` en el rango, ordenado desc.
- `getSubmissionsStats` (nuevo) → en el rango: total, breakdown por `status`, y últimas 10 (`name`, `municipality`, `created_at`, `status`) ordenadas desc.

## 3. Cambios en `src/routes/_admin/admin.analytics.tsx`

Header:
- Nuevo control de fecha (preset + popover de rango).
- Estado se persiste en URL search params (`from`, `to`, `preset`) para deep-linking.

Cards de resumen (reorganizadas en dos filas de `grid lg:grid-cols-4` o `5`):
1. Vistas directorio
2. Vistas de detalle
3. Engagement
4. Clics teléfono
5. Clics email
6. Clics Instagram
7. Clics URL contacto
8. Clics "Cómo llegar"
9. "Iré"
10. "Me interesa"
11. Mercados activos / inactivos (una card con dos valores apilados o dos cards)
12. Submissions pendientes

Tabla Top Mercados — columnas finales:
`# | Mercado | Vistas | Tel | Email | Direcciones | Contacto | Iré | Me interesa | Recurrencia`

Nuevas secciones (en orden, debajo de Top Organizadores):

- **Análisis de Clicks por Tipo**: `BarChart` horizontal (`layout="vertical"`) con 6 barras, etiquetas en español (`Ver detalle`, `Teléfono`, `Email`, `Cómo llegar`, `URL contacto`, `Asistencia`). Color `#54b678`.
- **Fuentes de Tráfico**: dos columnas — `PieChart` de las 5 categorías + tabla top 10 referrers (`Referrer | Categoría | Visitas`).
- **Actividad por Página**: tabla (`Página | Visitas`) ordenada desc, con scroll si excede 15 filas.
- **Submissions de Mercados**: card con total + tres badges (pendientes / aprobadas / rechazadas) + tabla últimas 10 (`Nombre | Municipio | Fecha | Estado`).

CSV download en cada tabla nueva, usando el helper existente `downloadCSV`.

## 4. Detalles técnicos

- `recurrence_type` ya está en `markets`; usar mapeo legible (`Único`, `Semanal`, etc.) reutilizando lógica existente si la hay en `src/lib/recurrence.ts`, si no, mapeo inline.
- `click_contact` ya existe en el enum `click_type` (migración previa) y en `ClickType`. Incluido en overview y desglose.
- Para `getTrafficSources`, parsear referrer con `new URL(referrer).hostname` envuelto en try/catch (referrers inválidos → "Otro").
- Todos los queries en paralelo via `Promise.all` dentro de cada server function; en el cliente usar `useQuery` independientes con `queryKey` que incluya `from`/`to`.
- `queryKey` se actualiza a `["admin","analytics", <sección>, from, to]`.
- Loading: mantener el patrón actual (un único `isLoading` agregado), pero usar skeleton por sección si alguna sección nueva tarda más para no bloquear todo (opcional — primera versión mantiene patrón actual).
- Labels en español en toda la UI nueva.

## 5. Archivos a modificar

- `src/lib/admin-analytics.functions.ts` — ampliar 3 functions, añadir 4 nuevas.
- `src/routes/_admin/admin.analytics.tsx` — control de fecha, cards extra, columnas extra, 4 secciones nuevas, search params.
- (Opcional) `src/components/admin/MetricCard.tsx` — sin cambios; el panel usa `Metric` local que ya existe.

## Fuera de alcance

- Sin cambios de esquema, triggers, RLS, ni nuevos eventos de tracking.
- Sin cambios al Pixel de Facebook.
- Sin cambios al diseño general del admin.
