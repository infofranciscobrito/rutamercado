
# Rediseño Premium de RutaMercado

Transformación visual completa del directorio público, manteniendo intacto el panel admin y toda la lógica de backend (server functions, RLS, tracking). Solo se tocan los componentes de presentación bajo `src/components/rutamercado/` y `src/routes/index.tsx`, más los tokens de diseño en `src/styles.css`.

## Lo que cambia

### Sistema de diseño (`src/styles.css`)
- Añadir tokens nuevos: fondo crema `#FFF8EC`, dorado hover `#FEF3C7`, gradiente de marca, gradiente hero navy, sombras cálidas con tinte navy en vez de gris puro.
- Escala tipográfica fluida con `clamp()` para hero, secciones, cards y body.
- Helper de `prefers-reduced-motion` que desactiva animaciones globalmente.
- Pattern dot-grid en CSS puro para el hero.

### Header (`Header.tsx`)
- Sticky 64px de alto, logo a la izquierda, links "Sobre Nosotros" y botón outline dorado "Enviar mi Mercado" a la derecha.
- Mobile: hamburger que abre un `Sheet` lateral con los links.
- Sombra sutil que aparece al hacer scroll (con transición 300ms).

### Hero (nuevo `Hero.tsx`)
- Fondo gradiente navy + dot-grid dorado al 5%.
- Título serif grande, subtítulo cálido.
- Barra de búsqueda integrada (input 56px, icono lupa, focus dorado con halo).
- Stats horizontales en desktop: mercados activos · municipios · categorías (calculados del dataset cargado).
- Animación de entrada escalonada (texto, luego búsqueda).

### Barra de filtros (`FilterBar.tsx` reescrita)
- **Fila 1 — calendario semanal**: 7 botones circulares (Lun–Dom) con número del día y abreviación, dorado para el seleccionado, dot dorado bajo días con mercados, opacidad reducida para días vacíos, flechas ← → para cambiar semana. Scroll horizontal con snap en mobile.
- **Pills de rango**: Hoy / Esta Semana / Este Mes / Todos.
- **Fila 2 — Región y Categoría**: dropdowns nativos shadcn con altura 40px.
- Botón "Limpiar filtros" cuando hay alguno activo.
- Mobile: dropdowns colapsan en un botón "Filtros" que abre un `Sheet` desde abajo con botón "Aplicar".
- Sticky con sombra al hacer scroll.

### Contador y badges activos
- "Mostrando X mercados" + chips removibles para cada filtro activo (fondo `#FEF3C7`, texto `#92400E`, X para quitar).
- Toggle a la derecha: Vista por Categoría ↔ Vista Grid (icono filas / icono grid), preferencia en `localStorage`.

### Directorio por categorías (nuevo `CategoryRow.tsx`)
- Una sección por categoría con mercados disponibles (respetando filtros).
- Encabezado: icono SVG de categoría (hoja, carpa, mano, tenedor, bolsa, caja) + título serif + contador.
- Flechas ← → en desktop para hacer scroll programático; swipe nativo en mobile.
- Scrollbar oculto, gap 20px, padding edge correcto.
- Fondo alterno entre `#FAFAF8` y `#FFF8EC` por sección para crear ritmo.

### Card de mercado (`MarketCard.tsx` rediseñada)
- Ancho fijo 320px desktop / 280px mobile, radius 16px, fondo blanco.
- Sombra cálida default, elevación con `translateY(-6px)` al hover (250ms).
- Imagen 16:9 con placeholder gradiente de marca + pin SVG cuando falta.
- Badge categoría dorado (top-left), badge HOY verde con pulse suave / MAÑANA azul (top-right).
- Nombre serif (2 líneas máx), separador dorado fino, filas con icono dorado para fecha/horario/ubicación, pill de frecuencia outline dorado al final.

### Vista Grid alternativa
- Mismo `MarketCard` en grid responsivo 1/2/3 columnas, ordenado por fecha.

### Modal de detalle (`MarketDetailDialog.tsx` rediseñado)
- Desktop: dialog centrado max 580px / 85vh, radius 20px.
- Mobile: bottom sheet full-height con handle arriba para arrastrar y cerrar (usando `Drawer` de shadcn/vaul).
- Overlay con blur, animación scale+fade 250ms.
- Header: imagen 16:9, badge categoría, botón cerrar circular flotante.
- Cuerpo:
  - Nombre serif + separador dorado + descripción.
  - "Detalles del Evento": grid 2×2 de mini-cards crema (fecha, horario, frecuencia, ubicación) + dirección completa en panel gris claro.
  - "Organizador": card crema con nombre + botones Llamar (dorado) / Email / Instagram en fila.
  - Botón principal "Cómo Llegar" navy full-width con icono.
- Conserva: `incrementMarketView`, `trackMarketClick` para view_detail, phone, email, instagram, directions. Focus trap y cerrar con Esc/overlay (ya provistos por Radix).

### Sección "Sobre Nosotros" (`AboutSection.tsx` rediseñada)
- Fondo navy `#1c1e37`, layout 2 columnas en desktop.
- Izquierda: kicker dorado, título serif blanco, dos párrafos, botón dorado "Enviar mi Mercado".
- Derecha (desktop): composición decorativa de pines/círculos dorados translúcidos.

### Footer nuevo (`Footer.tsx`)
- Fondo `#141628`, logo centrado opacidad 80%, separador dorado fino, copyright + links Sobre/Contacto con hover dorado.

### Estado vacío (`EmptyState.tsx` rediseñado)
- SVG ilustrativo de pin "dormido" en colores de marca, título serif, subtexto, botón outline dorado.
- Variante especial cuando el filtro "Hoy" no tiene resultados → CTA "Ver esta semana".

### Skeletons
- Cards skeleton con misma estructura, pulse animado entre dos tonos, stagger 100ms.
- Variante en fila (para vista por categoría) y en grid.

## Detalles técnicos

- **No se tocan**: `src/lib/*.functions.ts`, migraciones, RLS, `src/integrations/supabase/*`, panel `_admin`, autenticación, ni los tipos.
- **Componentes shadcn nuevos a usar** (ya presentes en el proyecto): `Sheet` (drawer lateral header móvil + bottom sheet filtros), `Drawer` (modal móvil), `Dialog` (modal desktop), `Select`, `Skeleton`, `Tooltip`.
- **Iconografía**: SVG inline en `src/components/rutamercado/icons/` para los 6 iconos de categoría; resto vía `lucide-react`.
- **Filtros**: extender `src/lib/market-filters.ts` para soportar selección por día específico (además de today/week/month/all) sin romper la URL existente — se añade `day?: string (YYYY-MM-DD)` opcional al esquema Zod con `fallback(undefined)`.
- **Stats del hero**: derivados del array `markets` ya cargado por el loader (sin queries extra).
- **Toggle vista**: estado local con persistencia en `localStorage` (`rm-view-mode`), default `category`.
- **Animaciones**: solo `transform` y `opacity`, easing `cubic-bezier(0.23,1,0.32,1)`, respeta `prefers-reduced-motion` vía media query en CSS.
- **Accesibilidad**: todos los botones icon-only con `aria-label`, focus visible dorado, targets ≥44px, contraste AA verificado en navy/dorado/crema.
- **SEO**: se conserva el `head()` de `index.tsx` intacto.

## Archivos afectados

```text
src/styles.css                                    (extender tokens)
src/lib/market-filters.ts                         (añadir filtro por día)
src/routes/index.tsx                              (orquestación nueva)
src/components/rutamercado/Header.tsx             (rewrite)
src/components/rutamercado/Hero.tsx               (nuevo)
src/components/rutamercado/FilterBar.tsx         (rewrite)
src/components/rutamercado/WeekStrip.tsx         (nuevo)
src/components/rutamercado/ActiveFilterChips.tsx (nuevo)
src/components/rutamercado/ViewToggle.tsx        (nuevo)
src/components/rutamercado/CategoryRow.tsx       (nuevo)
src/components/rutamercado/MarketCard.tsx        (rewrite)
src/components/rutamercado/MarketGrid.tsx        (ajustar)
src/components/rutamercado/MarketDetailDialog.tsx (rewrite)
src/components/rutamercado/AboutSection.tsx      (rewrite)
src/components/rutamercado/Footer.tsx            (nuevo)
src/components/rutamercado/EmptyState.tsx        (rewrite)
src/components/rutamercado/SkeletonCard.tsx      (nuevo)
src/components/rutamercado/icons/CategoryIcons.tsx (nuevo)
```

Una vez aprobado, implemento todo en bloque y verifico contra el preview en mobile, tablet y desktop.
