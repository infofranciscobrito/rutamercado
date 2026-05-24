# RutaMercado — Backend & Project Setup

Configuración inicial del proyecto: identidad visual, Lovable Cloud (base de datos, RLS, función), tipos TypeScript y conexión al backend. **No se crea UI todavía.**

## 1. Habilitar Lovable Cloud

Activar Lovable Cloud para tener Postgres, autenticación y storage. Esto genera automáticamente el cliente Supabase en `src/integrations/supabase/`.

## 2. Identidad visual (tokens de diseño)

Actualizar `src/styles.css` con los tokens exactos (en formato `oklch` según convención del template, mapeando los HEX dados):

- `--background`: #FAFAF8 (blanco cálido)
- `--foreground`: #1c1e37 (navy)
- `--primary`: #f8b625 (dorado) · `--primary-foreground`: #1c1e37
- `--secondary` / superficies oscuras: #1c1e37
- `--muted-foreground`: #6B7280
- `--border` / `--input`: #E5E7EB
- `--success`: #22C55E (nuevo token)
- `--radius`: 12px (cards); botones/inputs derivan a 8px vía `--radius-md`

Tipografía:
- Importar `DM Serif Display` y `DM Sans` desde Google Fonts en `src/styles.css`
- Registrar `--font-display` (DM Serif Display) y `--font-sans` (DM Sans) en `@theme inline`
- Body usa `font-sans`; headings usarán `font-display`

## 3. Esquema de base de datos (migración SQL)

Crear migración con:

**Enums:**
- `market_category`: Mercado Agrícola, Bazar / Pop-up, Feria Artesanal, Food Market, Mercado Mixto, Flea Market
- `market_region`: Metro, Norte, Sur, Este, Oeste, Centro
- `market_frequency`: Único, Semanal, Quincenal, Mensual
- `click_type`: view_detail, click_phone, click_email, click_instagram, click_directions

**Tablas:** `markets`, `market_clicks`, `page_views` con las columnas especificadas. `updated_at` en `markets` mantenido por trigger.

**RLS:**
- `markets`: SELECT público (solo `is_active = true` en política pública); INSERT/UPDATE/DELETE solo `authenticated`
- `market_clicks`: INSERT público; SELECT `authenticated`
- `page_views`: INSERT público; SELECT `authenticated`

**Función:**
```sql
create or replace function public.increment_view_count(market_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.markets set view_count = view_count + 1 where id = market_id;
$$;
```

## 4. Tipos TypeScript

Crear `src/types/market.ts` con interfaces y union types derivados de los enums (`Market`, `MarketCategory`, `MarketRegion`, `MarketFrequency`, `ClickType`, `MarketClick`, `PageView`). Los tipos generados de Supabase quedan disponibles en `src/integrations/supabase/types.ts`.

## 5. Helpers de tracking (server functions)

Crear `src/lib/analytics.functions.ts` con `createServerFn` para:
- `trackPageView({ page, referrer })` — INSERT en `page_views`
- `trackMarketClick({ market_id, click_type })` — INSERT en `market_clicks`
- `incrementMarketView({ market_id })` — llama RPC `increment_view_count`

(Usan el cliente público de Supabase; las políticas RLS permiten INSERT anónimo.)

## 6. Limpieza

- Reemplazar el placeholder de `src/routes/index.tsx` con una landing mínima vacía (solo título "RutaMercado" centrado con la nueva tipografía) para evitar el placeholder de build, pendiente de UI real en próximos pasos.

## Notas técnicas

- Stack: TanStack Start + React + Tailwind v4 + shadcn/ui + Lovable Cloud (Supabase).
- No se instalan dependencias nuevas; fuentes vía `@import` de Google Fonts en `styles.css`.
- No se construye UI de listado/detalle/admin — eso vendrá en iteraciones siguientes.
