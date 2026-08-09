# Ruta /newsletter compartible con vista previa propia

Nueva URL pública `/newsletter` que muestra la homepage y baja automáticamente al bloque de suscripción, con metadata Open Graph propia presente en el HTML crudo (igual que las rutas de categoría).

## Qué se hace

1. **Reutilizar la homepage**: el contenido de la página de inicio (hoy dentro de `src/routes/index.tsx`) se mueve a un componente compartido sin cambiar nada visual ni de comportamiento. La ruta `/` sigue igual; la nueva ruta `/newsletter` renderiza ese mismo componente.

2. **Scroll automático**: al cargar `/newsletter`, la página baja suavemente hasta el bloque `id="newsletter"` que ya existe, usando el mismo `scroll-mt-24` ya configurado para el header fijo. No se duplica el bloque ni se toca el botón del Hero ni su ancla `#newsletter`.

3. **Metadata OG en el HTML servido** (SSR, verificable con "Ver código fuente"):
   - `og:title` = "Suscríbete al Newsletter | RutaMercado"
   - `og:description` = "Recibe los mercados de Puerto Rico directo en tu correo cada semana. Sin spam, cancelas cuando quieras."
   - `og:image` = `https://rutamercadopr.com/og-newsletter.png`
   - `og:url` = `https://rutamercadopr.com/newsletter`
   - `og:type` = "website", `og:site_name` = "RutaMercado"
   - `twitter:card` = "summary_large_image" y `twitter:title` / `twitter:description` / `twitter:image` iguales
   - `<link rel="canonical">` a `https://rutamercadopr.com/newsletter`
   - Título de pestaña y meta description propios de la ruta.

   La referencia a `og-newsletter.png` queda tal cual aunque el archivo aún no exista; no rompe el build. Cuando subas el PNG 1200×630 a `public/` con ese nombre, funciona sin tocar código.

4. **Sitemap**: se añade `/newsletter` a `sitemap.xml` para que sea indexable.

## Detalles técnicos

- Nuevo `src/routes/newsletter.tsx` con `createFileRoute("/newsletter")`, `loader` que reutiliza `marketsQueryOptions` (igual que `/`), y `head()` con las etiquetas de arriba. Sin `validateSearch` propio: es una URL limpia para compartir.
- Extracción de la vista de inicio a `src/components/rutamercado/HomeView.tsx`, con una prop opcional `scrollTo?: "newsletter"`. `src/routes/index.tsx` conserva su `validateSearch`, middlewares `stripSearchParams`, `beforeLoad` y head actuales y pasa sus filtros al componente; nada de la home cambia funcionalmente.
- El scroll se dispara en un `useEffect` tras montar, con `scrollIntoView({ behavior: "smooth" })` sobre `#newsletter`, respetando el offset existente del header fijo.
- No se modifica la metadata de ninguna otra ruta.

## Verificación

- `view-source:` de `/newsletter` muestra las etiquetas `og:*` y el canonical absoluto.
- `/newsletter` carga la homepage y queda posicionada en el bloque navy de suscripción, completamente visible bajo el header.
- `/` y el botón "Newsletter" del Hero siguen funcionando igual.
