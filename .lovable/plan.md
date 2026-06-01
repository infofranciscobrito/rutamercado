## Plan — Renombrar categoría "Bazar / Pop-up" → "Bazaar/Pop Up"

### Cambios

**1. Base de datos (migración)**
Renombrar el valor del enum `public.market_category`:
```sql
ALTER TYPE public.market_category RENAME VALUE 'Bazar / Pop-up' TO 'Bazaar/Pop Up';
```
Esto actualiza automáticamente todos los mercados existentes con esa categoría. No se pierde data.

**2. Código (frontend)**
Actualizar las referencias literales al valor de la categoría:
- `src/types/market.ts` (líneas 6 y 41) — tipo `MarketCategory` y array `MARKET_CATEGORIES`
- `src/components/rutamercado/icons/CategoryIcons.tsx` (línea 14) — mapa de íconos
- `src/lib/category-pages.ts` (línea 31) — campo `category` de la config de la página

**3. Textos visibles asociados (mismo archivo `category-pages.ts`)**
Actualizar los textos en español que mencionan "Bazares / Pop-up" para que sigan siendo coherentes con el nuevo nombre:
- `pageTitle`: "Bazaar / Pop Up en Puerto Rico"
- `subtitle`, `ctaLabel`, `metaTitle`, `metaDescription`, `emptyText` — reemplazar "Bazares y Pop-ups" / "Bazares / Pop-up" por "Bazaar / Pop Up"

### Cosas que NO se cambian
- **Slug de URL** (`/bazar-pop-up`) — se mantiene para no romper SEO/links existentes
- `pageViewKey` (`category_bazar_popup`) — se mantiene para preservar continuidad de analytics
- `src/integrations/supabase/types.ts` — se regenera automáticamente tras la migración

### Notas
- Tras la migración, cualquier hardcode antiguo del string viejo dejará de funcionar; los 3 archivos listados arriba son todos los puntos donde aparece.
- Confirmar ortografía deseada: la plan usa **"Bazaar/Pop Up"** exactamente como lo escribiste.