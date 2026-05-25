# Sistema de Intención de Asistencia

## 1. Base de datos (migración)

Crear tabla `market_attendance_intentions`:
- `id` uuid PK, `market_id` uuid FK → markets(id) ON DELETE CASCADE
- `intention_type` text con CHECK in ('will_attend','interested')
- `visitor_id` text not null
- `created_at` timestamptz default now()
- Índices en `market_id`, `intention_type`, `created_at`
- RLS: INSERT público (anon+authenticated), SELECT solo authenticated (admin)
- Agregar `'click_attendance'` al enum `click_type` (ALTER TYPE ADD VALUE)

## 2. Server functions

**`src/lib/attendance.functions.ts`** (nuevo):
- `recordAttendanceIntention({ marketId, intentionType, visitorId })` — usa `supabaseAdmin`, inserta en `market_attendance_intentions` y en `market_clicks` con `click_type='click_attendance'`. Valida con Zod (uuid, enum, visitorId 1–64 chars).
- `getMarketIntentionCount({ marketId })` — público; retorna `{ total, willAttend, interested }` para mostrar en el modal tras votar.

**`src/lib/analytics.functions.ts`**:
- Extender `ClickTypeSchema` con `'click_attendance'`.

**`src/lib/admin-analytics.functions.ts`**:
- `getAttendanceMetrics()` → totales globales (will_attend, interested, uniqueVisitors, intentionRate vs `view_detail` clicks).
- `getTopMarketsByIntention()` → top 10 con breakdown + view counts.
- `getIntentionsPerDay({ days: 30 })` → series por día/tipo.
- `getIntentionsPerMarketAll()` para enriquecer la tabla y CSV.

**`src/lib/admin-markets.functions.ts`**:
- Extender `listMarkets` para incluir conteo de intenciones por mercado (left join agregado).

## 3. Visitor ID helper

**`src/lib/visitor-id.ts`** (nuevo): `getOrCreateVisitorId()` lee/escribe `rm_visitor_id` en localStorage (SSR-safe: retorna "" si `typeof window === 'undefined'`, sólo invocar desde event handlers/useEffect).

## 4. Modal de detalle

**`src/components/rutamercado/MarketDetailDialog.tsx`**:
- Nuevo subcomponente `AttendanceSection` insertado entre "Organizador" y botón "Cómo llegar", con separador (border-t #E5E7EB, my-5).
- Estado: `voted` (bool, inicializado desde `localStorage['rm_voted_'+market.id]`), `counts` ({total, willAttend, interested}), `submitting`.
- Si `!voted`: título + subtítulo centrados, dos botones (`¡Voy a ir!` primario #f8b625 con ícono `Hand`/`CalendarCheck`, `Me interesa` outline con ícono `Eye`/`Star`). Transiciones con clases CSS (fade).
- Al click: llama `recordAttendanceIntention`, marca localStorage, fetch del conteo, muestra estado de gracias con `CheckCircle2` en círculo dorado (animación tailwind `animate-in zoom-in`), texto "¡Gracias por tu respuesta!" y "{total} personas planean asistir a este mercado".
- Si ya votó al abrir: hacer query del conteo y mostrar estado final directamente.
- Manejo de errores: toast sonner "No se pudo registrar tu respuesta".

## 5. Admin Dashboard

**`src/routes/_admin/admin.dashboard.tsx`**:
- Agregar 5ta `MetricCard` "Intención de Asistencia" con ícono `Users`, valor = total, subtexto custom "X van a ir · Y interesados" (extender `MetricCard` para aceptar `subtext?: string` opcional).
- Grid cambia a `lg:grid-cols-5`.
- Datos vía nuevo `getAttendanceMetrics`.

## 6. Admin Analytics

**`src/routes/_admin/admin.analytics.tsx`**:
- Nueva sección al final "Intención de Asistencia":
  - 4 mini-cards: Voy a ir, Me interesa, Tasa de intención (%), Visitantes únicos.
  - Tabla top 10 mercados (Pos, Nombre, Voy a ir, Me interesa, Total, Tasa %).
  - `BarChart` apilado con dos `<Bar stackId="a">` colores #f8b625 y #FEF3C7.
  - `LineChart` 30 días con dos `<Line>` (#f8b625, #6B7280).
- Extender export CSV existente con columnas `voy_a_ir, me_interesa, total_intenciones, tasa_intencion`.

## 7. Admin Markets table

**`src/routes/_admin/admin.markets.tsx`**:
- Nueva columna "Intención" tras "Vistas" mostrando total con ícono `Users` y `Tooltip` shadcn con "X van a ir · Y interesados".
- Datos provienen del `listMarkets` extendido.

## Notas técnicas

- Recurrencia: la intención se asocia a `market_id` (no a fecha), cumpliendo el requerimiento.
- Atomicidad de borrado de mercados: el CASCADE de la nueva FK ya cubre la limpieza al eliminar mercados (compatible con el flujo de borrado actual).
- SSR: toda lectura de localStorage queda dentro de `useEffect`/handlers para evitar errores de hidratación.
- Sin cambios en diseño visual existente fuera de las áreas listadas.
