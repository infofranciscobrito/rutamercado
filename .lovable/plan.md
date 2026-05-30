## Cambio

Generar una nueva imagen Open Graph (1200x630) con el logo verde actualizado centrado sobre fondo `#18253f`, y actualizar las referencias en el código para que apunten a esa imagen con URL absoluta.

## Pasos

1. **Generar la imagen `public/og-image.png` (1200x630)** usando composición programática (ImageMagick) a partir de `public/logo-rutamercado-horizontal.png`:
   - Fondo sólido `#18253f`.
   - Logo centrado, ocupando ~60% del ancho (≈720px) para que sea legible en miniaturas de WhatsApp/redes.
   - Exportar como PNG optimizado.
   - QA: abrir la imagen resultante y verificar visualmente que el logo se vea nítido y centrado.

2. **Actualizar `src/routes/__root.tsx`**:
   - Reemplazar la URL externa de R2 actualmente usada en `og:image` y `twitter:image` por la URL absoluta `https://rutamercadopr.com/og-image.png` (dominio canónico del proyecto).

3. **Actualizar `src/routes/index.tsx`**:
   - Cambiar `/og-image.png` y `/twitter:image` por `https://rutamercadopr.com/og-image.png` (URL absoluta, requisito de OG).

4. **Actualizar `src/lib/category-route-helpers.ts`**:
   - Cambiar `/og-image.png` por `https://rutamercadopr.com/og-image.png` en `og:image` y `twitter:image`.

## Fuera de alcance

- No se tocan layouts, colores ni otras metadatos.
- No se generan variantes por categoría — todas las páginas usan la misma OG image.
