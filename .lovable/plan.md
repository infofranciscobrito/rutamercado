## Cambio de imagen OG para /productores

### Objetivo
Configurar la ruta `/productores` para que, al compartirse en redes sociales (Facebook, WhatsApp, Instagram), muestre la imagen `og-productores.png` subida por el usuario, con todas las meta etiquetas necesarias y URLs absolutas.

### Pasos

1. **Copiar imagen al proyecto**
   - Copiar `user-uploads://og-productores.png` a `public/og-productores.png` (1200x630).

2. **Actualizar metadata en `src/routes/productores.tsx`**
   - Mantener `title` y `description` actuales.
   - Añadir / completar el bloque Open Graph y Twitter con URLs absolutas:
     - `og:title`: "Productores de Mercados Locales en Puerto Rico — RutaMercado"
     - `og:description`: descripción actual del directorio.
     - `og:image`: `https://rutamercadopr.com/og-productores.png`
     - `og:url`: `https://rutamercadopr.com/productores`
     - `og:type`: `website`
     - `og:site_name`: `RutaMercado`
     - `twitter:card`: `summary_large_image`
     - `twitter:title`: mismo que `og:title`
     - `twitter:description`: mismo que `og:description`
     - `twitter:image`: `https://rutamercadopr.com/og-productores.png`
   - Añadir `<link rel="canonical" href="https://rutamercadopr.com/productores" />`.

3. **Verificación tras publicar**
   - Revisar `view-source:https://rutamercadopr.com/productores` y confirmar que el HTML crudo contiene:
     - `<meta property="og:image" content="https://rutamercadopr.com/og-productores.png">`
     - `<meta property="og:title" content="Productores de Mercados Locales en Puerto Rico — RutaMercado">`
   - Forzar re-scrape en Facebook Sharing Debugger para refrescar la caché de la imagen anterior (si existiera).

### Nota
Como el sitio usa TanStack Start con SSR real, las etiquetas se renderizarán en el HTML crudo que reciben los crawlers sin configuración extra de pre-renderizado.