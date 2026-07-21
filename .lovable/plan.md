
## Contexto importante (buena noticia)

Este proyecto **no es un SPA de Vite** — es **TanStack Start con SSR**. Cada ruta ya devuelve HTML server-rendered con sus propias `<meta>` visibles en view-source. **No hace falta pre-renderizar con vite-react-ssg ni generar HTML estático manual**; basta con configurar `head()` correctamente por ruta, cosa que el proyecto ya hace parcialmente vía `buildCategoryHead` en `src/lib/category-route-helpers.ts`.

Los problemas reales son:
1. Los slugs actuales (`/mercado-agricola`, `/bazar-pop-up`, `/feria-artesanal`, `/mercado-mixto`, más `/food-market` y `/flea-market`) no coinciden con los que pediste.
2. El `__root.tsx` fija un `og:title`, `og:description` y `twitter:*` genéricos que **sobrescriben** los de las rutas hijas (TanStack Router hace merge por `name`/`property`, así que los hijos deben re-emitir cada tag para ganar — y hoy sí lo hacen, excepto en la home).
3. `og:url` y `<link rel="canonical">` de la home apuntan a valores relativos/incorrectos.
4. No existe redirección desde `/?category=...` a la ruta limpia.

## Aclaración pendiente sobre categorías

Solo listaste 4 categorías, pero el sitio tiene 6 en el modelo de datos: además de las tuyas existen **Food Market** y **Flea Market** (con rutas `/food-market` y `/flea-market` actuales, enlazadas desde el home). Voy a asumir esto y avísame si no:

- Mantener `/food-market` y `/flea-market` tal cual (con su `head()` actual), sin renombrar. Solo cambio los 4 slugs que pediste.
- Si prefieres eliminar esas 2 categorías del sitio, dímelo y lo hago aparte.

## Plan

### 1) Renombrar los 4 slugs de categoría

En `src/lib/category-pages.ts` cambio los `slug` de las 4 entradas:

- `mercado-agricola` → `mercados-agricolas`
- `bazar-pop-up` → `bazares`
- `feria-artesanal` → `ferias-artesanales`
- `mercado-mixto` → `mercados-mixtos`

Renombro los archivos de ruta correspondientes en `src/routes/`:

- `mercado-agricola.tsx` → `mercados-agricolas.tsx`
- `bazar-pop-up.tsx` → `bazares.tsx`
- `feria-artesanal.tsx` → `ferias-artesanales.tsx`
- `mercado-mixto.tsx` → `mercados-mixtos.tsx`

Dentro de cada archivo actualizo `createFileRoute("/…")`, `routeFrom` y el `CATEGORY_BY_SLUG.get(...)`. `routeTree.gen.ts` se regenera solo.

### 2) Metadata OG por ruta (con los textos exactos que pediste)

Actualizo `metaTitle` / `metaDescription` en `src/lib/category-pages.ts` para las 4 categorías con los strings literales del brief. En `buildCategoryHead` (`src/lib/category-route-helpers.ts`) agrego los tags que faltan para que **cada ruta re-emita todos los `og:*` y `twitter:*`** y así gane sobre el root merge:

- `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:site_name`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">` absoluto a la ruta

El `og:image` sigue siendo `https://rutamercadopr.com/og-image.png` (absoluto) en todas las rutas.

### 3) Arreglar la home (`src/routes/index.tsx`)

Agregar a `head()` de la home:
- `og:url = https://rutamercadopr.com/`
- `<link rel="canonical" href="https://rutamercadopr.com/">`
- Re-emitir `og:title`, `og:description`, `twitter:title`, `twitter:description` con el copy de la home para consistencia.

### 4) Redirects 301 desde el formato viejo

Como los redirects tienen que responder antes de que corra React, los implemento como **server routes** de TanStack Start (respuesta HTTP real, no client-side). Estrategia:

- Archivo nuevo `src/routes/_redirects.tsx` (o dentro de `index.tsx` como middleware `beforeLoad`) que inspecciona `?category=` en la home y, si coincide con alguna categoría conocida, hace `throw redirect({ to: '/mercados-agricolas', status: 301 })` etc.
- Además, para los slugs viejos que ya estaban indexados (`/mercado-agricola`, `/bazar-pop-up`, `/feria-artesanal`, `/mercado-mixto`), agrego archivos-ruta thin que hacen `beforeLoad` → `redirect({ to: '/<nuevo-slug>', status: 301 })` para no romper links históricos.

Mapa de category param → slug nuevo:
```text
Mercado Agrícola  -> /mercados-agricolas
Bazaar/Pop Up     -> /bazares
Feria Artesanal   -> /ferias-artesanales
Mercado Mixto     -> /mercados-mixtos
Food Market       -> /food-market       (sin cambio)
Flea Market       -> /flea-market       (sin cambio)
```

### 5) Preservar filtros

Los chips/dropdown de categoría en el home hoy escriben `?category=…`. Cambio la lógica del `FilterBar` / `index.tsx` para que al elegir una categoría **navegue a la ruta limpia** correspondiente (usando `<Link to="/mercados-agricolas">` o `navigate({ to })`) en lugar de setear el search param. Los demás filtros (q, region, municipality, date, day) siguen igual como query params dentro de cada ruta de categoría — ya están soportados por `categorySearchSchema`.

### 6) Sitemap

Actualizo `src/routes/sitemap[.]xml.ts` para emitir los slugs nuevos (y quitar los viejos si conviene).

## Verificación (cómo comprobarlo en view-source)

Una vez publicado:

1. Abrir en el navegador: `view-source:https://rutamercadopr.com/mercados-agricolas`
2. Buscar (Ctrl+F) `og:title` → debe aparecer:
   `<meta property="og:title" content="Mercados Agrícolas en Puerto Rico | RutaMercado">`
3. Repetir con `/bazares`, `/ferias-artesanales`, `/mercados-mixtos` y confirmar que cada una muestra su propio `og:title`, `og:description`, `og:url` y `canonical` en el HTML crudo (sin ejecutar JS).
4. Validar en el **Facebook Sharing Debugger** (`https://developers.facebook.com/tools/debug/`) pegando cada URL y presionando "Scrape Again" — debe leer los tags correctos. WhatsApp e Instagram reutilizan el mismo scrape con caché propia.
5. Probar `curl -A "facebookexternalhit/1.1" https://rutamercadopr.com/bazares | grep og:` desde terminal como alternativa.

Nota: los crawlers cachean previews. Después del deploy, forzar re-scrape en el debugger de Facebook para cada URL.

## Archivos que se tocan

- `src/lib/category-pages.ts` — slugs y textos meta actualizados
- `src/lib/category-route-helpers.ts` — tags OG/Twitter completos + site_name
- `src/routes/mercado-agricola.tsx` → renombrar a `mercados-agricolas.tsx` (+3 análogos)
- `src/routes/mercado-agricola.tsx` (versión legacy corta con redirect 301) — nuevo, y 3 hermanos
- `src/routes/index.tsx` — head() con og:url/canonical absolutos + redirect 301 desde `?category=`
- `src/components/rutamercado/FilterBar.tsx` (y/o `index.tsx`) — al seleccionar categoría, navegar a la ruta limpia en vez de setear query param
- `src/routes/sitemap[.]xml.ts` — slugs nuevos
