# RutaMercado — Interfaz pública

Construir la SPA pública sobre la ruta `/` con header sticky, barra de filtros, grid de mercados y modal de detalle. Todos los datos vienen de Lovable Cloud (tabla `markets`).

## 1. Dependencias y componentes shadcn

Instalar componentes shadcn faltantes: `dialog`, `sheet`, `select`, `badge`, `input`, `button`, `skeleton` (los que ya existan se reutilizan, no se duplican). Iconos vía `lucide-react` (ya instalado).

## 2. Capa de datos

`src/lib/markets.functions.ts` — `createServerFn` `listMarkets()`:
- SELECT de `markets` donde `is_active = true`, orden ascendente por `event_date`, luego `start_time`.
- Devuelve DTO plano tipado.

Wiring en `src/routes/index.tsx`:
- `queryOptions(['markets'])` + `ensureQueryData` en loader + `useSuspenseQuery` en el componente.
- Filtros (búsqueda, fecha, región, categoría) se aplican en cliente sobre el dataset (volumen esperado pequeño, evita refetch en cada toggle).

## 3. Estructura de archivos UI

```
src/components/rutamercado/
  Header.tsx              # sticky navy header con logo + tagline
  FilterBar.tsx           # search + date pills + region/category selects (desktop)
  MobileFilters.tsx       # Sheet con los mismos filtros para mobile
  ResultCount.tsx         # "Mostrando X mercados"
  MarketGrid.tsx          # grid responsive + estado vacío
  MarketCard.tsx          # card con imagen/badge/info + hover lift
  MarketImage.tsx         # img con fallback gradiente + pin centrado
  MarketDetailDialog.tsx  # modal con detalle completo y acciones tracked
  EmptyState.tsx          # icono + mensaje + botón "Limpiar filtros"
src/lib/
  markets.functions.ts    # listMarkets serverFn
  market-filters.ts       # tipos de filtros + función pure applyFilters()
  format.ts               # formatDateEs, formatTimeRange, frequencyLabel
```

## 4. Estado de filtros (URL search params)

Persistir filtros en URL para que sean compartibles y sobrevivan refresh, usando zod-adapter:

```ts
{
  q: string,                      // texto de búsqueda
  date: 'today'|'week'|'month'|'all'  (default 'all'),
  region: MarketRegion | 'all'   (default 'all'),
  category: MarketCategory | 'all' (default 'all'),
  market: string | undefined      // UUID abierto en modal (deep-link)
}
```

El modal de detalle se abre/cierra cambiando `?market=<uuid>` — permite compartir un mercado por URL.

## 5. Header

- Fondo `#1c1e37` (token `--secondary`), sticky `top-0 z-50`.
- Izquierda: `<img>` placeholder de 40px de alto (slot para el logo PNG real). Texto "RutaMercado" al lado en DM Serif Display, color dorado para distinguirlo del fondo.
- Derecha: tagline "Descubre los mercados locales de Puerto Rico" en blanco `opacity-80`, oculto en mobile (`hidden sm:block`).

## 6. Barra de filtros

- Sticky debajo del header (`top-[64px]`), fondo blanco, `border-b`, sombra que aparece al hacer scroll (detector con `useEffect`+IntersectionObserver o `useScrollPosition`).
- **Desktop (≥md):** layout horizontal — input de búsqueda (flex-1), pills de fecha (Hoy / Esta Semana / Este Mes / Todos), Select región, Select categoría.
- **Mobile (<md):** input de búsqueda + botón "Filtros" con icono que abre un `Sheet side="bottom"` con los mismos controles + botón "Aplicar"/"Limpiar".
- Pills activas: bg `#f8b625`, texto `#1c1e37`, font-medium. Inactivas: borde gris, texto navy.

## 7. Lógica de filtrado (`applyFilters`)

- `q`: incluye case-insensitive en `name` o `municipality`.
- `date`:
  - `today`: `event_date === hoy`
  - `week`: dentro de los próximos 7 días desde hoy (inclusive)
  - `month`: mismo mes/año que hoy
  - `all`: sin filtro de fecha
- `region` / `category`: igualdad exacta cuando no es 'all'.
- Combinación AND.

## 8. Card de mercado

- Container `rounded-xl` (12px), `bg-card`, `border`, `shadow-sm`, transición `transform 200ms ease-out`. Hover: `-translate-y-1 shadow-md`. Cursor pointer; toda la card es trigger del modal (botón accesible o `<button>` wrapper).
- `MarketImage`: aspect-video. Si `image_url`: `<img>` con `object-cover`. Si no: div con `bg-gradient-to-br from-[--primary] to-[--secondary]` + `<MapPin>` blanco centrado.
- Badge categoría: `absolute top-3 left-3`, bg `#f8b625`, texto `#1c1e37`, bold, `rounded-md` (6px), px-2 py-1.
- Cuerpo: nombre (font-display 18px), filas con iconos (CalendarDays, Clock, MapPin) en gris `#6B7280`, texto pequeño.
- Si `frequency` existe y `!== 'Único'`: pill outline dorado: `"Todos los sábados"` (mapeo por `frequency` + día de la semana en español).

## 9. Modal de detalle

`Dialog` shadcn, `max-w-[600px] max-h-[85vh] overflow-y-auto`:
- Imagen 16:9 arriba, badge categoría sobre imagen.
- Título (font-display 24px).
- Descripción.
- **Detalles del Evento** (sección con título pequeño uppercase tracking):
  - Fecha formateada en español ("sábado, 24 de mayo de 2025")
  - Horario ("8:00 AM – 2:00 PM")
  - Frecuencia
  - Dirección completa
  - Municipio, Región
- **Contacto del Organizador**:
  - Nombre del organizador
  - Teléfono → `<a href="tel:…">` (tracked `click_phone`)
  - Email → `<a href="mailto:…">` (tracked `click_email`)
  - Instagram → `<a href="https://instagram.com/{handle}" target="_blank">` (tracked `click_instagram`)
- Botón primario "Cómo llegar" — abre `https://www.google.com/maps/search/?api=1&query=<encoded address + municipio + PR>` en nueva pestaña (tracked `click_directions`). bg `#f8b625`, texto navy, `rounded-md`.
- Solo se renderizan las filas/botones de contacto cuyos campos existen.

## 10. Tracking

Al abrir el modal (effect cuando `?market=` cambia y se resuelve el mercado):
- `incrementMarketView({ marketId })`
- `trackMarketClick({ marketId, clickType: 'view_detail' })`

Al hacer clic en teléfono/email/Instagram/Cómo llegar: `trackMarketClick` con el `click_type` correspondiente antes de navegar (no se bloquea el flujo si falla).

`trackPageView({ page: '/' })` se dispara una vez al montar `Index` (effect con guard de StrictMode).

## 11. Estado vacío

Cuando `applyFilters` devuelve `[]` con filtros activos:
- Componente centrado con icono `SearchX` grande (text-muted-foreground), título "No encontramos mercados", subtítulo "Prueba ajustando los filtros." y botón "Limpiar filtros" que resetea search params a defaults.

Cuando la base aún no tiene mercados activos (lista total vacía sin filtros): mismo componente, título "Aún no hay mercados publicados" y sin botón.

## 12. Loading & error

- Skeleton grid (6 cards) durante carga inicial (Suspense fallback en el componente).
- `errorComponent` ya está heredado del root — añadir `notFoundComponent` simple a la ruta para cumplir convención.

## Detalles técnicos

- Fechas: `Intl.DateTimeFormat('es-PR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`, capitalizando primera letra.
- Horas: parsear `"HH:MM:SS"` y formatear a `h:mm a` localizado a español.
- Tipos compartidos provienen de `src/types/market.ts` (ya creado).
- Cliente Supabase: `supabase.from('markets').select(...)` desde la serverFn — RLS pública permite acceso anónimo a `is_active = true`.
- Sin autenticación en esta entrega: el admin/login viene en una siguiente iteración.

## Fuera de alcance (próxima iteración)

- Panel admin para crear/editar mercados.
- Carga de imágenes a storage.
- Autenticación.
