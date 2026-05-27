# Páginas individuales por categoría

## Resumen

Crear 6 rutas dedicadas (una por categoría), cada una con su propio SEO, breadcrumb, filtros simplificados (sin filtro de categoría), grid vertical de mercados, estado vacío específico, y la sección About + Footer existentes. Añadir un botón "Ver todos los [categoría]" debajo de la primera card en cada fila de la homepage. Crear un sitemap.xml que incluya las nuevas rutas.

## Rutas nuevas

| URL | Categoría |
|---|---|
| `/mercado-agricola` | Mercado Agrícola |
| `/bazar-pop-up` | Bazar / Pop-up |
| `/feria-artesanal` | Feria Artesanal |
| `/food-market` | Food Market |
| `/mercado-mixto` | Mercado Mixto |
| `/flea-market` | Flea Market |

## Archivos

### 1. `src/lib/category-pages.ts` (nuevo)
Tabla única con la configuración por categoría — usada por las páginas, la homepage y el sitemap. Cada entrada tiene:
- `slug` (URL)
- `category` (valor exacto de `MarketCategory`)
- `pageTitle` ("Mercados Agrícolas en Puerto Rico", etc.)
- `subtitle` (los descriptivos del brief)
- `ctaLabel` ("Ver todos los Mercados Agrícolas", etc.)
- `metaTitle`, `metaDescription` (textos del brief)
- `pageViewKey` (`category_mercado_agricola`, etc.)

### 2. `src/components/rutamercado/CategoryPage.tsx` (nuevo)
Componente reutilizable que recibe la config + el `EnrichedMarket[]` filtrado por categoría. Renderiza:
- `Header` (existente, sticky)
- Breadcrumb: `Inicio > {pageTitle}` (DM Sans 14px, color `#6B7280`, container `max-w-7xl`)
- Título + subtítulo + contador "X mercados disponibles"
- Filtros simplificados: reutilizar `FilterBar` con una prop nueva `hideCategory?: boolean` (o un componente hermano más liviano). El selector de categoría se oculta en desktop y en el bottom sheet móvil. `DatePills` y `RegionSelect` se mantienen.
- `MarketGrid` (existente) ordenado por `nextDate` ascendente
- Estado vacío: ícono `CategoryIcon` grande, texto + botón "Volver al directorio" (Link a `/`)
- `MarketDetailDialog` controlado por `?market=<uuid>` (mismo patrón que index)
- `AboutSection` + `Footer`
- Tracking de page view (StrictMode-safe, igual que index)

### 3. `src/routes/mercado-agricola.tsx`, `bazar-pop-up.tsx`, `feria-artesanal.tsx`, `food-market.tsx`, `mercado-mixto.tsx`, `flea-market.tsx` (6 nuevos)
Cada uno:
- `validateSearch`: subset del schema actual (`q`, `date`, `region`, `day`, `market`) — sin `category`.
- `loader`: reutiliza `marketsQueryOptions` (mismo `queryKey: ["markets"]`).
- `head()`: meta tags del brief (title, description, og:title, og:description, og:url absoluta `https://rutamercadopr.com/<slug>`, og:image `/og-image.png`, twitter:*), `links: [{ rel: "canonical", href: "https://rutamercadopr.com/<slug>" }]`, y un `scripts` con JSON-LD `ItemList` cuyos `itemListElement` son objetos `Event` derivados de `loaderData` (nombre, startDate = `nextDate`, location con `municipality + region`, `url` al detail via `?market=<id>`).
- `component`: render de `<CategoryPage config={...} />`.

### 4. `src/components/rutamercado/CategoryRow.tsx` (editar)
Añadir un botón "Ver todos los {categoría}" debajo de la primera card, alineado a la izquierda con esa card. Implementación: dentro del scroller, debajo de la primera `MarketCard` (no de cada una), un `Link` con los estilos del brief (`bg-[#f8b625] text-[#1c1e37]`, DM Sans 14px/600, `rounded-lg`, padding 10px 20px, h-40, hover scale + sombra dorada). Pasar `ctaHref` y `ctaLabel` como props desde `index.tsx` (resueltos vía la tabla de `category-pages.ts`).

Posición exacta: la primera card del scroll se envuelve en un wrapper flex-col que contiene la `MarketCard` arriba y el botón debajo, alineado al inicio.

### 5. `src/routes/index.tsx` (editar mínimo)
Pasar `ctaHref` y `ctaLabel` a cada `<CategoryRow>` leyendo `category-pages.ts`. Nada más cambia.

### 6. `src/components/rutamercado/FilterBar.tsx` (editar)
Aceptar prop opcional `hideCategory?: boolean`. Cuando es `true`, no renderizar `CategorySelect` (ni en la fila desktop ni en el sheet móvil). Default `false` para preservar el comportamiento del home.

### 7. `src/routes/sitemap[.]xml.ts` (nuevo)
Server route que emite el sitemap. Incluye:
- `/` (priority 1.0, changefreq weekly)
- `/enviar` (priority 0.5, monthly)
- Las 6 rutas de categoría (priority 0.7, weekly)
`BASE_URL = "https://rutamercadopr.com"`. Sin fetch a DB (no hay rutas dinámicas públicas por slug).

### 8. `public/robots.txt` (nuevo)
```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://rutamercadopr.com/sitemap.xml
```

## Detalles técnicos

- **Filtrado**: cada página filtra `markets.filter(m => m.category === config.category)` y luego aplica el `applyFilters` existente con `category: "all"` forzado, para reusar la lógica de fecha/región/día/búsqueda. Ordenar por `nextDate` ascendente al final.
- **Selección por modal**: mismo patrón que index (`?market=<uuid>` en search params, `MarketDetailDialog` controlado, toast si el mercado deja de existir).
- **Tracking**: `trackPageView({ data: { page: config.pageViewKey, referrer, userAgent } })` con `useRef` para evitar doble disparo en StrictMode.
- **JSON-LD**: generado en `head()` desde `loaderData` (los markets ya están en cache vía `ensureQueryData`). Solo incluir mercados con `nextDate` no nulo.
- **Header**: el menú de navegación del `Header` no se toca — las rutas quedan fuera del nav, accesibles solo por el botón del home y por Google.
- **Responsive**: el grid usa `MarketGrid` existente (1/2/3 columnas).
- **No tocar**: admin, modal de detalle, diseño visual de home, sitemap plugin de Vite (no está activo).

## Riesgos

- `MARKET_CATEGORIES` define los valores canónicos — la tabla `category-pages.ts` debe mapear cada slug a uno de esos strings exactos para que el filtro funcione.
- El botón "Ver todos" debe ir dentro del scroller horizontal para alinearse con la primera card; verificar que no rompa el `snap-x` ni la altura uniforme de las cards (se ubica debajo, fuera del flujo de snap).
