# Rediseño visual del Dashboard de Métricas — Directorio de Negocios

Rediseño puramente presentacional de `src/components/admin/BusinessAnalyticsDashboard.tsx`. Se preservan intactos: los server functions (`getBusinessRegistrationAnalytics`, `exportBusinessRegistrationsRows`), el shape de `BusinessAnalytics`, los filtros y su lógica, y el export CSV. Cambia estructura, tipos de gráfico, tokens y microcopy.

## Archivos a modificar

- `src/styles.css` — extender el bloque `.business-analytics-dashboard` con los nuevos tokens (`--accent`, `--bg`, `--surface`, `--surface-2/3`, `--border`, `--border-strong`, `--text`, `--text-2`, `--muted`, rampa `--s1..s5`, categórica `--c1..c6`, estados `--good/warn/crit` con `-bg`, `--glow`). Invertir rampa secuencial en `[data-theme="light"]` vs `[data-theme="dark"]`. Mapear `--accent` a los brand tokens de RutaMercado (`#54b678` acento, `#18253f` para superficies profundas en oscuro). Mantener el bloque `--ba-*` existente sólo si otros componentes lo usan; si no, sustituirlo.
- `src/components/admin/BusinessAnalyticsDashboard.tsx` — reescritura de la capa visual conservando: hooks, queries, `AnalyticsFilters`, cálculo de rango de fechas, chips de filtros activos, ThemeToggle (3 estados con `localStorage['rm-admin-theme']`), botón Export CSV.
- Nuevos subcomponentes en `src/components/admin/analytics/`:
  - `NarrativeHeader.tsx` — frase grande generada de los datos (total, regiones cubiertas, % formalizados, dependientes principales), números en `--accent`.
  - `KpiTile.tsx` — etiqueta 11.5px, número 38/700 con conteo animado 900ms, chip de estado, sparkline opcional (SVG 30px) para "Total registrados".
  - `CoverageMap.tsx` — cartograma SVG de 6 rectángulos (viewBox `-2 -2 174 66`) con coords exactas del brief, fill por rampa secuencial según conteo, regiones vacías con borde punteado + textos muted, hover dim de 34% en el resto, leyenda a la derecha + barra de escala.
  - `ApprovalFunnel.tsx` — titular numérico 44px + barra apilada 100% (14px, radio 7, gap real 2px) con animación `scaleX`, leyenda con ceros en muted, nota interpretativa.
  - `LollipopList.tsx` — filas 32px grid `132px 1fr 62px`, línea base 1px, tallo 2.5px animado, punto 11px con borde del color de superficie y pop `cubic-bezier(.3,1.5,.5,1)`, escala relativa al máximo, conteo + %.
  - `MultiChannelList.tsx` — barra 7px sobre carril, colores categóricos, texto explícito "% de los negocios", nota al pie sobre multi-select.
  - `WaffleChart.tsx` — un cuadro (15px, radio 4, gap 5) por registro, agrupados por categoría en orden desc, pop 350ms con retraso 14ms incremental, tooltip en hover, leyenda inferior. Se usa para Formalidad y Dependencia.
  - `OrdinalBars.tsx` — 4 barras verticales (contenedor 120px), orden natural fijo, rampa claro→oscuro por antigüedad/tamaño, `scaleY` con origen abajo 750ms escalonado, eje anotado "más nuevo — más establecido" con degradado. Se usa para Tiempo operando y Empleados.
  - `FindingBand.tsx` — banda 12-col con degradado del acento, ícono cuadrado 26px, titular + párrafo. Generador `computeFindings(analytics)` con las 3 reglas: región vacía, categoría >30%, pendientes >7 días. Si no dispara ninguna, no renderiza.
  - `SectionDivider.tsx` — etiqueta 11px uppercase letter-spacing .09em + regla horizontal.
  - `Card.tsx` — shell con `::after` glow, header (título 14/650, badge `n = X`, subtítulo obligatorio 11.5px muted), pie opcional con nota.
- `src/routes/__root.tsx` — verificar que Nunito Sans (o la sans única del proyecto) esté cargada; si el toggle actual persiste bajo `rm-admin-theme`, mantener la misma clave.

## Layout bento (grid 12 col, gap 16, max 1440)

```text
┌──────┬──────┬──────┬──────┐   4 KPIs (3 col c/u)
├──────┴───────────┬─────────┤
│  MAPA (7 col)    │ EMBUDO  │   (5 col)
├──────────────────┴─────────┤
│ ▸ QUÉ VENDEN Y DÓNDE VENDEN │
├─────────────┬───────────────┤
│ CATEGORÍA   │  CANALES      │   (6 + 6)
├─────────────┴───────────────┤
│  ⚠ BANDA DE HALLAZGO        │   (12 col, condicional)
├─────────────────────────────┤
│ ▸ PERFIL DEL SECTOR         │
├───────┬───────┬─────────────┤
│FORMAL │ DEPEND│ TIEMPO      │   (4 + 4 + 4, waffle/waffle/ordinal)
└───────┴───────┴─────────────┘
```

Debajo: sección de empleados con `OrdinalBars`, y la sección de tendencia mensual existente (Recharts LineChart) reestilizada con los nuevos tokens.

Responsive: ≥1100 bento completo; 760–1100 los bloques 3/4/5 → 6 y los de 7/8 → 12; <760 una sola columna, lollipop con nombre a 98px, mapa full-width, waffle intacto (15px cabe 18/fila en 375).

## Microinteracción y accesibilidad

- Entrada de tarjetas: `translateY(14px) + opacity`, 550ms, `cubic-bezier(.22,.8,.3,1)`, escalonada 40ms.
- Todas las transiciones de hover <200ms; hover en lollipop pinta fondo de fila completa 150ms.
- Barra superior sticky con `backdrop-filter: blur(16px)`; chips de filtros activos removibles a la izquierda; "Mostrando X de Y negocios registrados" alineado a la derecha.
- `prefers-reduced-motion: reduce` → salta al estado final sin animaciones (counter directo, sin pop, sin scale).
- `tabular-nums` global en el contenedor del dashboard.
- Foco 2px `--accent` con offset 2 en todo lo navegable por teclado.
- Contraste AA verificado en textos de mapa (blanco sobre `--s4/s5`, oscuro sobre `--s1/s2`) en ambos modos.

## Reglas de datos (calculadas desde `BusinessAnalytics`)

- Narrativa: `total`, regiones con conteo > 0 sobre 6, `% aprobados`, cuenta con `dependencia === 'Principal'`.
- KPI "Empleos estimados" = `analytics.empleosEstimados` con nota fija; "Pendientes = 0" → chip verde "Cola al día" + días desde última revisión (usar `updated_at` máximo de pending si está disponible; si no, omitir línea temporal).
- Mapa: `byRegion` mapeado a las 6 regiones canónicas de `MARKET_REGIONS`; regiones ausentes = 0.
- Lollipop Categoría: `byCategoria` ordenado desc, escala al máximo.
- Canales: `byCanalVenta`, cada `count` / `total` = %.
- Waffle: iterar `byFormalidad` / `byDependencia` expandiendo `count` en cuadros individuales.
- Ordinales: `byTiempoOperando` y `byTamanoEquipo` en el orden fijo de `TIEMPO_OPERANDO_OPTIONS` (y el orden canónico de tamaños) — nunca ordenar por magnitud.
- Findings: regla 1 (alguna región con 0), regla 2 (max category share > 30%), regla 3 (pendientes con `created_at` > 7 días — sólo si el dato viene; si no, omitir esa regla).

## Reglas duras (verificación previa a cierre)

Sin pie/dona. Sin eje dual. Color nunca como único portador. Nunca texto pintado del color de serie. Sin colores fuera de los tokens. Categoría fija por identidad, no por ranking. Ordinales en orden natural. Estado vacío por gráfico con "Limpiar filtros". Rampa secuencial invertida entre modos. No se añade librería nueva de gráficos (SVG a mano + Recharts existente).

## Fuera de alcance

- No se toca `src/lib/admin-emprendedores.functions.ts`.
- No se altera el CSV ni las columnas exportadas.
- No se cambian filtros, presets ni su UX de selección (sólo su render como chips activos).
- No se modifican otros dashboards ni el layout de admin fuera de este componente.
