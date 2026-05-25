# Sistema de Recurrencia Automática para Mercados

Reemplaza el campo `event_date` por un motor de recurrencia que calcula las próximas fechas automáticamente, con soporte para cancelaciones y cambios de fecha puntuales.

---

## 1. Migración de Base de Datos

### 1.1 Tabla `markets` — nuevos campos

Agregar:
- `recurrence_type` text NOT NULL — `'unico' | 'semanal' | 'quincenal' | 'mensual_por_dia'` (enum tipo `recurrence_type`)
- `recurrence_day_of_week` text NULL — `'lunes'..'domingo'` (enum `weekday_es`)
- `recurrence_week_of_month` text NULL — `'primero' | 'segundo' | 'tercero' | 'cuarto' | 'ultimo'` (enum `week_of_month_es`)
- `recurrence_start_date` date NOT NULL
- `recurrence_end_date` date NULL
- `recurrence_label` text NULL

**Backfill** (antes de eliminar `event_date`):
- `recurrence_type = 'unico'`, `recurrence_start_date = event_date` para todos los registros existentes.
- `recurrence_label = ''` para únicos.

Luego: `ALTER TABLE markets DROP COLUMN event_date;` y `DROP COLUMN frequency;` (queda reemplazado).

**Validación** vía trigger `BEFORE INSERT/UPDATE`:
- `semanal` / `quincenal` → `recurrence_day_of_week` obligatorio.
- `mensual_por_dia` → `recurrence_day_of_week` Y `recurrence_week_of_month` obligatorios.
- `unico` → ambos deben ser NULL.

### 1.2 Tabla `market_exceptions`
- `id` uuid PK default `gen_random_uuid()`
- `market_id` uuid NOT NULL REFERENCES `markets(id)` ON DELETE CASCADE
- `exception_date` date NOT NULL
- `reason` text NULL
- `created_at` timestamptz NOT NULL DEFAULT now()
- UNIQUE `(market_id, exception_date)`
- Índice en `market_id`

### 1.3 Tabla `market_date_overrides`
- `id` uuid PK default `gen_random_uuid()`
- `market_id` uuid NOT NULL REFERENCES `markets(id)` ON DELETE CASCADE
- `original_date` date NOT NULL
- `new_date` date NOT NULL
- `new_start_time` time NULL
- `new_end_time` time NULL
- `note` text NULL
- `created_at` timestamptz NOT NULL DEFAULT now()
- UNIQUE `(market_id, original_date)`
- Índice en `market_id`

### 1.4 RLS para las dos tablas nuevas
- SELECT público (`anon`, `authenticated`) — necesario para mostrar excepciones/overrides en el directorio.
- INSERT/UPDATE/DELETE solo admin (`private.has_role(auth.uid(), 'admin')`).

---

## 2. Motor de Cálculo de Fechas

Nuevo módulo `src/lib/recurrence.ts` (puro, sin Supabase) con:

```text
computeUpcomingDates(market, exceptions, overrides, { from = today, days = 90 }): Array<{
  date: string;            // YYYY-MM-DD efectivo
  originalDate: string;    // antes del override
  startTime: string;
  endTime: string;
  isOverridden: boolean;
  overrideNote?: string;
}>
```

Reglas:
- `unico` → devuelve `recurrence_start_date` si está en ventana.
- `semanal` → desde `recurrence_start_date`, todos los días que coincidan con `day_of_week`, cada 7 días.
- `quincenal` → igual pero `(diffDays % 14 === 0)` desde el primer match ≥ `recurrence_start_date`.
- `mensual_por_dia` → para cada mes en la ventana, calcular el N-ésimo o último `day_of_week` (`primero`=1, `segundo`=2, `tercero`=3, `cuarto`=4, `ultimo`=último del mes).

Post-proceso:
1. Quitar fechas `< from`.
2. Quitar fechas `> recurrence_end_date` (si existe).
3. Quitar fechas presentes en `exceptions`.
4. Reemplazar fechas presentes en `overrides` (cambiar `date`, `startTime`, `endTime` si vienen).
5. Re-ordenar por `date` ascendente (los overrides pueden adelantar/atrasar).

Helper `generateRecurrenceLabel(type, dayOfWeek, weekOfMonth)`:
- `unico` → `""`
- `semanal` + `sabado` → `"Todos los sábados"`
- `quincenal` + `domingo` → `"Cada dos domingos"`
- `mensual_por_dia` + `primero` + `sabado` → `"El primer sábado de cada mes"`
- `ultimo` + `domingo` → `"El último domingo de cada mes"`

---

## 3. Server Functions (TanStack)

### 3.1 Públicas (`src/lib/markets.functions.ts`)
- `listMarkets()` — devuelve mercados activos junto con sus excepciones y overrides, y la lista de próximas fechas pre-calculadas (próximos 90 días). Orden: por `nextDate` ascendente.

### 3.2 Admin (`src/lib/admin-markets.functions.ts`)
- `upsertMarket` — actualizar schema Zod: quitar `event_date`/`frequency`, agregar los 6 campos de recurrencia con validación condicional. Genera `recurrence_label` server-side si el cliente lo manda vacío.
- `listAllMarkets` — incluye conteo de excepciones/overrides.
- `getMarketRecurrencePreview({ id })` — devuelve las próximas 10 fechas calculadas (para el panel del drawer).

### 3.3 Excepciones / Overrides (`src/lib/market-schedule.functions.ts`)
- `addMarketException({ marketId, exceptionDate, reason })`
- `removeMarketException({ id })`
- `addMarketDateOverride({ marketId, originalDate, newDate, newStartTime?, newEndTime?, note? })`
- `removeMarketDateOverride({ id })`

Todas con `requireSupabaseAuth` y check de rol admin.

### 3.4 Submissions
Actualizar `market_submissions` con los mismos campos de recurrencia (y migración equivalente) para que el flujo público `/enviar` siga funcionando. Se documenta en sección 6.

---

## 4. UI Admin — `MarketFormDrawer`

Reemplazar el campo único de fecha por sección **Recurrencia**:
- Select tipo (4 opciones).
- Render condicional descrito en el brief (date picker único, día de semana, semana del mes, fechas desde/hasta).
- `recurrence_label` se calcula en vivo al cambiar los selects, pero queda editable manualmente.

Nueva sección **Excepciones y Cambios** (solo en modo edición):
- Llama `getMarketRecurrencePreview` para listar las próximas 10 fechas.
- Cada fila: fecha + dos botones (`Cancelar esta fecha`, `Cambiar fecha`).
- Estados visuales:
  - Cancelada → tachada en rojo + razón.
  - Modificada → ícono + nueva fecha + nota.
- Mini-formularios inline (Popover/Dialog) para crear excepción u override.
- Botón para revertir (eliminar excepción/override).

---

## 5. UI Pública (Directorio)

### 5.1 `MarketCard`
- Muestra `nextDate` (no `event_date`).
- Si tiene override en `nextDate`, usa la fecha y horario del override.
- Debajo de la fecha, badge nuevo `RecurrenceBadge`:
  - Solo si `recurrence_label !== ""`.
  - Estilos: bg `#FFF8EC`, border `1px solid #f8b625`, color `#92400E`, ícono `RefreshCcw` (lucide), font-size 12px.
- Si `nextDate.isOverridden`, mostrar línea naranja: `⚠️ Fecha modificada: {note}`.
- Reemplaza el actual `frequencyLabel` derivado.

### 5.2 `MarketDetailDialog`
- En "Detalles del Evento":
  - "Próxima fecha" = `nextDate`.
  - "Recurrencia" = `recurrence_label` (si existe).
  - Nueva subsección "Próximas fechas" — lista de las siguientes 4 fechas calculadas:
    - Canceladas: tachadas + razón.
    - Movidas: original tachada + nueva al lado + nota.

### 5.3 Ordenamiento y filtros
- Ordenar mercados por `nextDate` ascendente (ya viene así del server).
- Los filtros `Hoy/Mañana/Esta semana/Este mes` se aplican sobre `nextDate`.
- `WeekStrip` y `market-filters.ts` se actualizan para usar `nextDate` en vez de `event_date`.

---

## 6. Submissions públicas (`/enviar`)

El formulario público actual usa `event_date` + `frequency`. Para no romperlo:
- Migrar `market_submissions` con los mismos 6 campos de recurrencia + backfill.
- `SubmitMarketForm` adopta la misma UI de "Recurrencia" (versión simplificada).
- Al aprobar un submission, el admin lo convierte a market con los mismos campos.

---

## 7. Limpieza y compatibilidad

- Eliminar `MarketFrequency` y `frequencyLabel` de `src/types/market.ts` y `src/lib/format.ts` (o reescribir como wrapper sobre `recurrence_label`).
- Actualizar `src/types/market.ts` para reflejar nuevos campos (vendrá automático desde `types.ts` regenerado).
- Tests rápidos mentales para `computeUpcomingDates`:
  - Semanal sábado con start hoy (lunes) → próximo sábado, +7, +14...
  - Mensual `ultimo` + `domingo` → 29 jun, 27 jul, 31 ago.
  - Override mueve "5 jul" → "12 jul", se re-ordena.
  - Excepción del "5 jul" → desaparece, no se sustituye.

---

## Detalles técnicos clave

- Toda la lógica de fechas usa fechas locales (`YYYY-MM-DD` strings + `Date` construido con `new Date(y, m-1, d)`) para evitar problemas de UTC, igual que el `parseLocalDate` actual en `format.ts`.
- El cálculo de los próximos 90 días se hace **en el server** dentro de `listMarkets` para que el cliente no tenga que recalcular ni cargar todas las excepciones/overrides.
- Cron / pg_cron NO es necesario: el motor recalcula on-demand en cada request. Cero mantenimiento.
- `recurrence_label` se almacena (no solo se calcula) para permitir override manual del admin.

---

## Orden de implementación

1. Migración de tablas + backfill (sin DROP todavía).
2. `recurrence.ts` con tests mentales.
3. Server functions admin + públicas.
4. UI admin (form + excepciones).
5. UI pública (card + detalle + filtros).
6. Migración del form `/enviar` y `market_submissions`.
7. DROP `event_date` y `frequency` una vez todo lo demás está verde.

¿Apruebas el plan para empezar la implementación?
