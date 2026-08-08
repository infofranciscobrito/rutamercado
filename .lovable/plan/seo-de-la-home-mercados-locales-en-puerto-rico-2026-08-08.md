# SEO de la home: "Mercados Locales en Puerto Rico"

Solo contenido y metadata. No se toca el diseño, filtros, mapa ni el listado.

## 1. Metadata (src/routes/index.tsx)
- Título: `Mercados Locales en Puerto Rico | RutaMercado`
- Descripción nueva (la del pedido), replicada en `og:description` y `twitter:description`.
- `og:title` / `twitter:title` alineados al nuevo título.
- Canonical y `og:url` se quedan en `https://rutamercadopr.com/` (ya correctos).

## 2. H1 (src/components/rutamercado/Hero.tsx)
Actual: "Descubre los mercados locales de Puerto Rico".
Nuevo: **"Descubre los Mercados Locales en Puerto Rico"** — mismo estilo visual, contiene la frase exacta y sigue leyéndose natural.

## 3. Párrafo introductorio con enlaces internos
Nuevo componente `src/components/rutamercado/IntroSEO.tsx`, insertado en la home justo debajo del hero y antes de la barra de filtros/listado, usando la tipografía de texto de apoyo ya existente (mismo tono de gris/tamaño que el resto del sitio).

Texto propuesto (2–3 oraciones), con enlaces reales inline en verde de marca:

> RutaMercado reúne los mercados locales más activos de Puerto Rico en un solo lugar: desde [mercados agrícolas](/mercados-agricolas) y [ferias artesanales](/ferias-artesanales) hasta [bazares y pop ups](/bazares) y [mercados mixtos](/mercados-mixtos). Cubrimos las regiones Metro, Norte, Sur, Este, Oeste y Centro. Filtra por región, categoría o fecha y encuentra tu próxima parada este fin de semana.

Los enlaces usan `<Link>` de TanStack Router con el estilo de enlace de texto ya usado en el sitio.

## 4. JSON-LD en la home
En el `head()` de `/`, añadir un bloque `application/ld+json` de tipo `CollectionPage` con un `ItemList` embebido de los próximos mercados (máx. 50) tomado de `loaderData` — la misma consulta que ya alimenta el listado, sin duplicar fuente de datos. Cada ítem: `position`, `name` y `url` = `https://rutamercadopr.com/mercados/{slug}`. Se reutiliza el patrón que ya existe en `buildCategoryHead`.

## Detalles técnicos
- `head()` en `src/routes/index.tsx` pasa a recibir `{ loaderData }`; el loader ya devuelve los mercados enriquecidos vía `marketsQueryOptions`.
- Se omiten mercados sin `slug` o sin `nextDate`.
- Sin cambios en `MarketGrid`, `FilterBar`, `CategoryRow` ni en las server functions.

## Cómo verificar
1. Abrir `view-source:https://rutamercadopr.com/` (o la URL de preview) y buscar:
   - `<title>Mercados Locales en Puerto Rico | RutaMercado</title>`
   - `<meta name="description" ...>` con el texto nuevo
   - `<script type="application/ld+json">` con `"@type":"CollectionPage"` y la lista de mercados
2. Alternativa por terminal: `curl -s https://rutamercadopr.com/ | grep -i -E "<title>|description|ld\+json"`
3. Validar el JSON-LD en el Rich Results Test de Google.
