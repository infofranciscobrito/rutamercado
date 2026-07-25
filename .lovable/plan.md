# Rediseño visual — Business Analytics Dashboard

Rediseño **puramente visual** de `src/components/admin/BusinessAnalyticsDashboard.tsx`. No se tocan métricas, consultas, filtros, orden de secciones, ni el export a CSV. Se sustituye la capa de presentación por el sistema Cloud Tower adaptado a la marca RutaMercado.

## Alcance

- Archivo principal a reescribir a nivel de UI: `src/components/admin/BusinessAnalyticsDashboard.tsx`.
- Tokens: reemplazar el bloque `.business-analytics-dashboard { --ba-* }` en `src/styles.css` por el nuevo sistema `--ba-*` (canvas, surface, seq, cat, status) + variante `[data-theme="dark"]` scoped al dashboard.
- Nuevos subcomponentes (todos dentro de `src/components/admin/analytics/`, sin nueva librería de gráficos — se sigue usando Recharts que ya está):
  - `Card.tsx` (cabecera con título + `n = X` + subtítulo + divisor + slot + nota).
  - `KpiTile.tsx` (etiqueta, número 32/700, chip de delta).
  - `HBarList.tsx` (barras horizontales 8px con carril `--gridline`, valor + %, rampa secuencial descendente, orden desc, ceros visibles, ancho de carril máx 480px).
  - `StackedBar100.tsx` (barra 14px, gap real 2px, etiqueta interna solo si segmento > 48px, contraste ≥4.5:1, leyenda `● Nombre — 12 · 39%`).
  - `ApprovalFunnel.tsx` (barra apilada 12px con colores de estado, resumen textual cuando un estado = 100%).
  - `FiltersBar.tsx` (sticky, chips removibles, "Limpiar todo", contador "Mostrando X de Y negocios").
  - `ThemeToggle.tsx` (Claro / Oscuro / Sistema, persiste en `localStorage` con la misma clave-pattern que ya usa el proyecto).
  - `EmptyState.tsx`, `Skeleton.tsx`, `Tooltip.tsx` (Recharts custom content).

## Sistema de diseño

- Escala de espaciado 4px (4/8/12/16/24/32/48/64). Nada arbitrario.
- Grid 12 col, gutter 24px desktop / 16px tablet.
- 3 niveles de elevación: canvas, card, floating (tooltip/dropdown/modal).
- Tipografía única: Nunito Sans. Se retira la serif (`--font-display` DM Serif) de los títulos **dentro del dashboard** (no se toca el resto del sitio). `font-variant-numeric: tabular-nums` en todos los números.
- Colores estrictamente por token (ver §Tokens abajo). Un solo hue secuencial para gráficos de una serie; paleta categórica fija (orden = categoría, nunca ranking) para series múltiples; estados solo para embudo/deltas. Texto siempre `--text-primary`/`--text-secondary`, nunca del color de la serie.

## Correcciones por sección

- **KPIs**: fila 5 col desktop / 2 tablet / 1 móvil. Etiqueta 12/500, número 32/700, chip de delta con fondo de estado + flecha + valor + "vs. mes anterior". Sin íconos decorativos.
- **Categoría de producto / Región / Canales de venta**: `HBarList` con conteo + %, rampa secuencial descendente `--seq-700 → --seq-500` (mínimo `--seq-300`), ceros visibles en muted, ancho carril ≤ 480px.
- **Embudo de aprobación**: ocupa 6/12 col junto a otra métrica; barra apilada 12px con colores de estado; leyenda inline; mensaje-resumen cuando un estado = 100% ("Los 31 negocios registrados están aprobados. No hay registros pendientes de revisión.").
- **Perfil del sector** (tiempo operando, empleados, dependencia económica): tres `StackedBar100` alineadas al mismo ancho izquierdo. Variables ordinales conservan orden natural y usan rampa secuencial claro→oscuro por antigüedad/tamaño. Etiqueta % dentro solo si segmento >48px, si no vive únicamente en leyenda.
- **Barra de filtros**: sticky top, chips removibles con ×, "Limpiar todo", contador "Mostrando X de Y negocios" en 12px muted.
- **Tabla completa**: densidad 12px, filas alternas `--bg-surface-subtle`, en móvil se convierte en tarjetas apiladas (label/value), sin scroll horizontal.

## Interacción / estados

- Tooltip Recharts custom: fondo `--brand-primary`, texto blanco, radio 6, padding 8/12, 12px, delay 100ms, fade 120ms; contenido = categoría + conteo + %.
- Hover barra: resto del gráfico a 40% opacidad, 120ms.
- Transiciones <200ms globalmente.
- Estado vacío por gráfico: "No hay negocios que cumplan estos filtros" + link "Limpiar filtros".
- Skeletons con la altura final; sin spinners.
- Foco: outline 2px `--brand-accent` con offset 2. Navegación por teclado completa.

## Modo oscuro

- Toggle en la barra del dashboard con 3 estados (Claro/Oscuro/Sistema), persistido.
- Aplica `data-theme="dark"` **scoped al contenedor del dashboard** (`.business-analytics-dashboard[data-theme="dark"]`) para no afectar el resto del admin.
- Rampa secuencial **invertida** (claro = más magnitud). Estados aclarados. Sin `#000`/`#FFF` puros. Contraste AA verificado.

## Responsive

- ≥1280: 12 col, KPIs ×5, distribuciones 6+6, perfil full-width.
- 768–1279: KPIs ×2, gráficos apilados full-width, filtros colapsan en botón "Filtros" (panel lateral con `Sheet` de shadcn).
- <768: 1 col, etiquetas de barras horizontales encima del carril, KPIs con etiqueta izq/número der, tabla → tarjetas apiladas. Ningún texto <11px.

## Reglas duras

- Sin pie/dona. Sin eje dual. Sin color como único portador. Sin texto pintado del color de serie. Sin colores fuera de los tokens. Se mantiene Recharts (no se añade otra librería).

## Detalles técnicos

- Tokens marca a mapear: `--brand-primary` = `#18253f` (navy RutaMercado), `--brand-accent` = `#54b678` (verde marca). El resto de tokens (`--bg-canvas`, `--bg-surface`, `--text-*`, `--seq-*`, `--cat-*`, `--status-*`) se añaden tal cual al bloque `.business-analytics-dashboard` en `src/styles.css`, reemplazando el bloque `--ba-*` existente. Los componentes solo consumen `var(--...)`.
- Fuente Nunito Sans: si no está ya cargada, añadir `<link>` en `src/routes/__root.tsx` (nunca `@import` remoto en `styles.css`) y usar `font-family: 'Nunito Sans', var(--font-sans)` dentro del contenedor del dashboard.
- El toggle usa `localStorage['rm-admin-theme']` con valores `light|dark|system`; `system` escucha `matchMedia('(prefers-color-scheme: dark)')`.
- Tooltip de Recharts: `content={<CustomTooltip/>}`. Hover-dim en barras: mapear `activeIndex` y setear `fillOpacity` por `<Cell>`.
- El texto interno de segmentos usa `<LabelList>` con `content` custom que decide render según ancho del segmento medido vía `viewBox`.
- No se modifica ningún archivo bajo `src/lib/admin-emprendedores.functions.ts`, filtros, ni el CSV.

## Verificación final

Antes de cerrar se recorre la checklist del brief: métricas intactas, cada card con `n=` + subtítulo, filtros sticky con contador, barras con conteo+%, sin etiquetas recortadas, ordinales en orden natural, tabular-nums, toggle persiste, rampa invertida en oscuro, contraste AA en ambos modos, keyboard-nav con foco visible, tooltip + empty state por gráfico, espaciado 4px, sombras solo en flotantes/hover-clickable, render correcto a 375 / 768 / 1440.
