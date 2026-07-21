
La infraestructura pedida (rutas limpias `/mercados-agricolas`, `/bazares`, `/ferias-artesanales`, `/mercados-mixtos`; SSR con `head()` por ruta emitiendo og:title/description/url/canonical únicos en el HTML crudo; redirects 301 desde `?category=` y desde los slugs viejos; twitter:card por ruta; navegación de filtros a la ruta limpia) ya está implementada en turnos anteriores — se puede confirmar en `src/lib/category-route-helpers.ts`, `src/routes/mercados-agricolas.tsx`, `bazares.tsx`, `ferias-artesanales.tsx`, `mercados-mixtos.tsx` y los stubs de redirect `mercado-agricola.tsx`, `bazar-pop-up.tsx`, `feria-artesanale.tsx`, `mercado-mixto.tsx`.

Lo único que falta es el punto 1: hoy las 4 rutas usan el mismo `og-image.png` genérico. Hay que servir la imagen específica que subiste para cada categoría.

## Cambios

1. **Copiar las 4 imágenes subidas a `public/`** con los nombres exactos que pediste:
   - `user-uploads://og-mercados-agricolas.png` → `public/og-mercados-agricolas.png`
   - `user-uploads://og-bazares.png` → `public/og-bazares.png`
   - `user-uploads://og-ferias-artesanales.png` → `public/og-ferias-artesanales.png`
   - `user-uploads://og-mercados-mixtos.png` → `public/og-mercados-mixtos.png`

   Van a `public/` (no a lovable-assets) porque necesitas URLs absolutas en `rutamercadopr.com/og-*.png`.

2. **`src/lib/category-pages.ts`** — añadir un campo opcional `ogImage?: string` a `CategoryPageConfig` y setearlo en las 4 categorías con slug limpio:
   - `mercados-agricolas` → `/og-mercados-agricolas.png`
   - `bazares` → `/og-bazares.png`
   - `ferias-artesanales` → `/og-ferias-artesanales.png`
   - `mercados-mixtos` → `/og-mercados-mixtos.png`

   `food-market` y `flea-market` no tienen imagen dedicada → siguen con el fallback.

3. **`src/lib/category-route-helpers.ts`** — en `buildCategoryHead`, reemplazar el `og-image.png` hardcodeado por `${BASE}${config.ogImage ?? "/og-image.png"}`, tanto en `og:image` como en `twitter:image`.

No se toca ninguna otra ruta, ni la home, ni redirects, ni filtros. La home mantiene su `og-image.png` actual como pediste.

## Cómo verificar (view-source)

Después de publicar, en el navegador abre cada URL con el prefijo `view-source:`:

- `view-source:https://rutamercadopr.com/mercados-agricolas` → busca `og:image` → debe apuntar a `.../og-mercados-agricolas.png` y `og:title` a `"Mercados Agrícolas en Puerto Rico | RutaMercado"`.
- `view-source:https://rutamercadopr.com/bazares` → `og:image` = `.../og-bazares.png`.
- `view-source:https://rutamercadopr.com/ferias-artesanales` → `og:image` = `.../og-ferias-artesanales.png`.
- `view-source:https://rutamercadopr.com/mercados-mixtos` → `og:image` = `.../og-mercados-mixtos.png`.

Como el crawler de Facebook cachea, después pasa cada URL por el Facebook Sharing Debugger (`developers.facebook.com/tools/debug`) y pulsa **Scrape Again**; WhatsApp e Instagram heredan de ese caché.
