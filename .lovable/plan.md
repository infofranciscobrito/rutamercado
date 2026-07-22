La imagen `og-registra-mercado.png` la subiste al chat (user-uploads://), no a `public/`. Como el sitio corre en TanStack Start con SSR real, las metaetiquetas devueltas por `head()` en cada ruta ya salen en el HTML crudo que ve el crawler — no hace falta pre-render extra. Solo hay que colocar la imagen en `public/` y añadir las etiquetas OG/Twitter propias a la ruta `/mercados`.

## Cambios

1. **Copiar la imagen a `public/og-registra-mercado.png`** desde `user-uploads://og-registra-mercado.png`. Va a `public/` (no a lovable-assets) porque necesitas la URL absoluta estable `https://rutamercadopr.com/og-registra-mercado.png`.

2. **`src/routes/mercados.tsx`** — reemplazar el bloque `meta` actual del `head()` por el set completo que pediste, con URLs absolutas:
   - `title` (tag `<title>`): `"Registra tu Mercado en RutaMercado | Puerto Rico"`
   - `description`, `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:image`
   - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
   - Añadir también `<link rel="canonical" href="https://rutamercadopr.com/mercados">` en `links` para que canonical y og:url coincidan (regla del proyecto).

No se toca ninguna otra ruta ni la home. Los preloads de fuentes existentes en `head()` se mantienen.

## Cómo verificar (view-source)

Después de publicar, abre en el navegador:

`view-source:https://rutamercadopr.com/mercados`

Busca (Ctrl+F) y confirma que aparecen en el HTML crudo — no inyectados por JS:

- `<title>Registra tu Mercado en RutaMercado | Puerto Rico</title>`
- `<meta property="og:image" content="https://rutamercadopr.com/og-registra-mercado.png">`
- `<meta property="og:url" content="https://rutamercadopr.com/mercados">`
- `<meta name="twitter:image" content="https://rutamercadopr.com/og-registra-mercado.png">`

Luego pasa `https://rutamercadopr.com/mercados` por el **Facebook Sharing Debugger** (`developers.facebook.com/tools/debug`) y pulsa **Scrape Again** para forzar el refresco del caché. WhatsApp e Instagram heredan de ese caché de Facebook, así que con re-scrapear ahí basta.

## Nota técnica

No es necesario configurar pre-render estático de la ruta: TanStack Start ya hace SSR de cada request y el `head()` de la ruta se serializa dentro del `<head>` del HTML inicial. Eso es exactamente lo que ya funciona para las 4 rutas de categoría (`/mercados-agricolas`, `/bazares`, etc.) que arreglamos antes.