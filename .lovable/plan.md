# Mover el párrafo introductorio SEO a la sección "Conoce RutaMercado"

## 1. Eliminar `IntroSEO` de la home
- En `src/routes/index.tsx`: quitar el import de `IntroSEO`, su uso en el fallback del `<Suspense>` (línea ~244) y en `MarketsContent` (línea ~368).
- Resultado: el listado de mercados sube para ocupar el espacio que dejaba el párrafo.

## 2. Borrar el componente `IntroSEO`
- Eliminar el archivo `src/components/rutamercado/IntroSEO.tsx` (ya no se usa).

## 3. Convertir los 4 items de "¿Qué encontrarás?" en enlaces reales
- En `src/components/rutamercado/AboutSection.tsx`, cada `<li>` de la lista de categorías pasa a ser un `<Link>` de TanStack Router hacia su ruta:
  - Mercados Agrícolas → `/mercados-agricolas`
  - Bazares → `/bazares`
  - Ferias Artesanales → `/ferias-artesanales`
  - Mercados Mixtos → `/mercados-mixtos`
- Mismo diseño visual (ícono circular, fondo, texto). Añadir hover state sutil: el fondo del ícono pasa a un verde más intenso y el texto al color de acento.
- Actualizar `CATEGORY_ITEMS` para incluir el `href` por item, o usar el mapping ya existente.

## 4. Añadir subtítulo bajo el H2
- Debajo del H2 "Tu guía para descubrir los mejores mercados locales de Puerto Rico", añadir un párrafo con: "Mercados locales, ferias artesanales, bazares y mercados agrícolas de Puerto Rico en un solo lugar. Cubrimos las regiones Metro, Norte, Sur, Este, Oeste y Centro."
- Usar el mismo estilo de texto de apoyo de la sección (clase tipo `text-white/80`, tamaño moderado, `max-w` centrado).

## 5. No tocar
- Hero, buscador, barra de filtros, listado de mercados, resto del diseño.

## Verificación
- Screenshot de la sección "Conoce RutaMercado" mostrando: nuevo subtítulo, 4 items ahora enlaces clicables con hover, y confirmar que el párrafo bajo el hero ya no existe.
