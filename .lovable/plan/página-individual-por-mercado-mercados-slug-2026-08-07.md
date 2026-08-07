# Página individual por mercado (/mercados/[slug])

Cada mercado pasa de vivir en un modal con `?market=uuid` a tener su propia página real, compartible e indexable, con metadata Open Graph y Schema.org renderizadas en el HTML crudo (igual que las páginas de categoría).

## Qué cambia para el usuario

- Al hacer clic en cualquier tarjeta de mercado (home, páginas de categoría, favoritos) la URL cambia a `/mercados/nombre-del-mercado` y se abre una página completa con la misma información y el mismo diseño que hoy muestra el modal.
- Los enlaces viejos `?market=uuid` siguen funcionando: redirigen de forma permanente a la ruta nueva.
- La home, el listado, los filtros y el formulario de registro se quedan exactamente igual.

## 1. Columna `slug` en la base de datos

Migración sobre la tabla de mercados:
- Nueva columna `slug` (texto, única).
- Se genera del nombre: minúsculas, sin acentos, espacios por guiones, sin caracteres raros. Si dos mercados generan el mismo slug, se añade un sufijo numérico (`-2`, `-3`).
- Se rellena para todos los mercados existentes en la misma migración.
- Un trigger genera el slug automáticamente al crear un mercado nuevo y cuando el slug quede vacío, para que el formulario de registro no cambie.

## 2. Rutas

- `src/routes/mercados.tsx` (página de registro) se mueve a `src/routes/mercados/index.tsx` sin cambios de contenido ni de URL.
- Nueva ruta `src/routes/mercados/$slug.tsx`:
  - Loader público que busca el mercado activo por slug (server function pública, sin sesión, para que funcione en SSR y para los crawlers). Si no existe → página 404 propia con `noindex`.
  - Renderiza el mismo bloque de información del modal actual (imagen, nombre, categoría, descripción, ubicación, fecha/hora, próximas fechas, servicios, contacto, intención de asistencia) dentro de la página, con Header y Footer del sitio. Se reutiliza el contenido del modal extrayéndolo a un componente compartido, sin tocar estilos.
  - Mantiene el registro de vista y los eventos de clic que ya existen.

## 3. Metadata OG y Twitter (por mercado, en el HTML crudo)

En el `head()` de la ruta, alimentado por el loader:
- `og:title` = `[Nombre] | RutaMercado`
- `og:description` = descripción del mercado recortada a ~155 caracteres (fallback a un texto con categoría y municipio si no hay descripción)
- `og:image` = foto del mercado si existe (URL absoluta), si no el OG genérico del sitio
- `og:url` y `canonical` = `https://rutamercadopr.com/mercados/[slug]`
- `og:type` = `website`, `og:site_name` = RutaMercado
- `twitter:card` = `summary_large_image` y `twitter:title` / `twitter:description` / `twitter:image` equivalentes

## 4. JSON-LD Schema.org `Event`

Bloque `<script type="application/ld+json">` en el head de cada página de mercado con: `name`, `description`, `startDate`/`endDate` en ISO 8601 usando la **próxima fecha de ocurrencia calculada** (nunca vacío ni inventado; si no hay próxima fecha, se omite el bloque), `eventAttendanceMode: OfflineEventAttendanceMode`, `eventStatus: EventScheduled`, `location` tipo `Place` con `address` `PostalAddress` (`addressLocality` = municipio, `addressRegion` = "PR", `addressCountry` = "US"), `image` si existe, y `organizer` tipo `Organization` solo si hay organizador.

## 5. Navegación y redirecciones

- Las tarjetas navegan a `/mercados/$slug` con `Link` (sirve cmd+click y preload).
- Home y páginas de categoría: si llega `?market=uuid`, se redirige con 301 a `/mercados/[slug]` correspondiente; si el uuid ya no existe, se limpia el parámetro como hoy (con el toast actual).
- El drawer de favoritos enlaza también a la ruta nueva.

## 6. Sitemap

`sitemap.xml` pasa a consultar la tabla de mercados activos y añade una entrada por cada `/mercados/[slug]` (changefreq `weekly`), además de las rutas fijas actuales. Sin `lastmod` inventado.

## Cómo verificar al terminar

En el navegador, abrir `view-source:https://rutamercadopr.com/mercados/[slug]` (o `curl -s https://rutamercadopr.com/mercados/[slug] | grep og:`): en el HTML crudo debe aparecer `<meta property="og:title" content="[Nombre] | RutaMercado">` con el nombre real del mercado y el bloque `<script type="application/ld+json">` con `"@type":"Event"`. También se puede pegar la URL en el depurador de compartidos de Facebook para ver el preview con la imagen del mercado.

## Notas técnicas

- Nueva server function pública `getMarketBySlug` con clave publishable (sin admin) y política de lectura pública ya existente sobre mercados activos.
- El contenido del modal se extrae a `MarketDetailContent`; `MarketDetailDialog` sigue existiendo para no romper el admin, pero la ruta pública ya no lo usa.
- El sitemap pasa a leer de la base de datos dentro del handler del route server.
