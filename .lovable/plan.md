## Ajustes finales RutaMercado

### 1. SEO y meta tags
- **`src/routes/__root.tsx`**: añadir `lang="es"` al `<html>`, defaults sitewide (`og:type=website`, `og:site_name`, `twitter:card=summary_large_image`, viewport, charset). NO poner title/description/canonical/og:image aquí (regla del template).
- **`src/routes/index.tsx`**: `head()` con title "RutaMercado — Directorio de Mercados Locales en Puerto Rico", description, `og:title`, `og:description`, `og:url=/`, `og:image` (favicon/og generado), `twitter:title`, `twitter:description`, `twitter:image`, `link rel="canonical" href="/"`.
- **Favicon**: generar PNG con `imagegen` (pin de ubicación dorado #f8b625 sobre fondo navy #1c1e37) en `public/favicon.png` + `public/og-image.png` (1200x630 con el mismo branding). Referenciar en `__root.tsx` links.

### 2. Mejoras UX en la home
- **`src/lib/format.ts`**: helpers `isToday(date)`, `isTomorrow(date)`.
- **`MarketCard.tsx`**: badge "HOY" (#22C55E) o "MAÑANA" (#3B82F6) sobre la imagen cuando aplique.
- **`src/lib/markets.functions.ts`** (`listActiveMarkets`): filtrar `event_date >= today` y ordenar `event_date asc`.
- **`MarketGrid.tsx` / `EmptyState.tsx`**: cuando el filtro activo es `today` y `markets.length === 0`, mostrar mensaje "No hay mercados programados para hoy. ¡Revisa qué hay esta semana!" con botón que cambia filtro a `week`. Requiere recibir filtro activo + callback.
- **`FilterBar.tsx` / contenedor**: `window.scrollTo({ top: 0, behavior: 'smooth' })` cuando cambia algún filtro.

### 3. Sección "Sobre Nosotros"
- Nuevo componente `src/components/rutamercado/AboutSection.tsx` con fondo `#1c1e37`, dos párrafos en blanco y botón "Enviar mi Mercado" (`#f8b625`, `href="#"`, `target="_blank"`).
- Renderizar en `src/routes/index.tsx` justo antes del footer (si no existe footer, después de la grid).

### 4. Accesibilidad
- Focus ring global `#f8b625`: añadir clase utility o reglas en `src/styles.css` (`:focus-visible { outline: 2px solid #f8b625; outline-offset: 2px }`).
- `aria-label` en botones de filtro, botón abrir modal, botón cerrar modal, botones de contacto del modal, hamburger del admin.
- `alt` descriptivo en `MarketImage` (nombre del mercado).
- Modal: shadcn `Dialog` ya hace focus trap + cierre con Escape; verificar que se usa.
- Revisar contrastes (`text-muted-foreground` en vez de grises arbitrarios).

### 5. Responsive
- **Mobile**: filtros en `Sheet` cuando `md:hidden` (botón "Filtros" abre sheet con los selects).
- **MarketCard**: full-width con `px-4 gap-4` en mobile.
- **MarketDetailDialog**: en mobile usar `Drawer` (vaul) bottom-sheet, en desktop `Dialog` centered. Patrón responsive con `useMediaQuery`.
- **AdminLayout**: sidebar oculto en mobile + botón hamburger que abre `Sheet` con la navegación.
- **Tablas admin**: envolver en `<div className="overflow-x-auto">`.

### 6. Datos de prueba (12 mercados)
- Usar `supabase--insert` con 12 filas en `public.markets`, fechas distribuidas en las próximas 4 semanas (hoy+2, +5, +7, +9, +12, +14, +16, +19, +21, +23, +26, +28), todas activas, descripciones realistas, organizadores ficticios, teléfonos `(787) XXX-XXXX`, direcciones reales de PR, `image_url` con URLs Unsplash relevantes.

### Detalles técnicos
- Categorías y regiones existentes en BD son enums — usar valores actuales del schema (no cambiarlos).
- Frequencies: `Semanal`, `Quincenal`, `Mensual`, `Único` (confirmar enum existente antes de insertar; si difieren, ajustar mapping).
- No tocar `src/integrations/supabase/*`, `src/routeTree.gen.ts`, `.env`.
- No cambiar lógica de admin más allá de hamburger + overflow tablas.

### Archivos a crear/editar
- Crear: `public/favicon.png`, `public/og-image.png`, `src/components/rutamercado/AboutSection.tsx`
- Editar: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/styles.css`, `src/lib/format.ts`, `src/lib/markets.functions.ts`, `src/components/rutamercado/MarketCard.tsx`, `src/components/rutamercado/MarketGrid.tsx`, `src/components/rutamercado/EmptyState.tsx`, `src/components/rutamercado/FilterBar.tsx`, `src/components/rutamercado/MarketDetailDialog.tsx`, `src/components/rutamercado/MarketImage.tsx`, `src/components/admin/AdminLayout.tsx`, `src/components/admin/AdminSidebar.tsx`, tablas admin (`admin.markets.tsx`).
- DB: 1 insert con 12 filas en `markets`.
