# Rediseño de /admin/analytics — Estilo "Cloud Tower" (igual a /admin/emprendedores)

Descartamos por completo la propuesta editorial anterior. El objetivo es que `/admin/analytics` se vea, se sienta y se comporte igual que el dashboard de `/admin/emprendedores` (`BusinessAnalyticsDashboard.tsx`).

## Sistema visual a replicar (tal cual está en emprendedores)

- **Tokens y paleta** ya definidos en `src/styles.css` bajo el sistema Cloud Tower: superficies `--surface-*`, tinta `--ink-*`, acento navy/verde, secuencias `--seq-100..900` y categóricos `--cat-1..6`. No se crean tokens nuevos.
- **Tipografía**: sans del sistema para lectura, `font-display` para titulares, `tabular-nums` en todos los números. Sin JetBrains Mono ni cambios en `__root.tsx`.
- **Layout**: bento grid ancho (`max-w-[1400px]`), bloques con `rounded-2xl border bg-card`, hairlines suaves, sin sombras dramáticas ni gradientes.
- **Header narrativo**: título grande + subtítulo + barra de filtros (preset de fechas, rango custom, tema claro/oscuro/sistema, botón Exportar CSV) idéntica en estructura a la de emprendedores.
- **Charts**: Recharts con la misma configuración visual — ejes hairline, `tabular-nums` en ticks, colores desde `SEQ`/`CAT`, tooltip navy sobre blanco. Barras horizontales, áreas translúcidas y pies con leyenda tipográfica al estilo emprendedores.
- **Modo tema**: reutilizar el mismo toggle `light/dark/system` con `THEME_KEY` propio (`rm-analytics-theme`) para no colisionar con el de emprendedores.

## Alcance funcional (sin tocar datos)

Se preservan al 100% los hooks, server functions, cálculos, filtros de fecha y exportaciones CSV que ya existen en `src/routes/_admin/admin.analytics.tsx`. Solo cambia la presentación.

Bloques a renderizar, en este orden, dentro del bento:

1. Header + filtros globales (rango de fechas, tema, export general si aplica).
2. KPIs de alcance (Vistas Directorio, Vistas Detalle, Cómo llegar, Engagement).
3. KPIs de interacción (Teléfono, Email, Instagram, URL Contacto).
4. KPIs de intención y estado (¡Voy a ir!, Me interesa, Mercados activos/inactivos, Submissions pendientes).
5. Top 10 Mercados por Vistas (tabla + CSV).
6. Top Organizadores (tabla + CSV).
7. Análisis de Clicks por Tipo (barras horizontales).
8. Distribución por Categoría y por Región (dos pies con leyenda).
9. Tráfico Diario (area/line chart).
10. Fuentes de Tráfico (pie + tabla auxiliar + CSV).
11. Actividad por Página (tabla + CSV).
12. Submissions de Mercados (tabla con badges pill Pendiente/Aprobado/Rechazado).
13. Servicios e Instalaciones (6 grupos, filas con label · barra · % · CSV).
14. Intención de Asistencia — KPIs + Top 10 (tabla + CSV).
15. Intención por Mercado y por Día (barras + línea lado a lado).

Cada bloque adopta el mismo lenguaje de card/borde/tipografía que los bloques equivalentes de emprendedores.

## Archivos afectados

- `src/routes/_admin/admin.analytics.tsx` — reescritura completa de la UI. Se mantienen todos los `useServerFn` / `useQuery` / cálculos existentes; se reemplaza el JSX y los helpers de presentación.
- Componentes internos nuevos, colocados en el mismo archivo o bajo `src/components/admin/analytics/` (según convenga): `SectionCard`, `KpiTile`, `DataTable`, `HBarList`, `AmenityRow`, `PieBlock`, `StatusPill`, `ThemeToggle`, `RangePicker`. Todos son "tontos": reciben props.
- `src/routes/__root.tsx` y `src/styles.css` — sin cambios (los tokens Cloud Tower ya existen).

## Detalles técnicos

- Reutilizar `downloadCSV` de `@/lib/csv` para todas las exportaciones existentes.
- Charts con `ResponsiveContainer`, ejes navy `strokeOpacity={0.15}`, series desde `SEQ`, tooltips con fondo `--surface-1` y borde hairline.
- Persistir el preset de rango en state local; sin cambios en la firma de las funciones de datos.
- `prefers-reduced-motion` respetado (sin counters animados salvo que ya existan en emprendedores).
- Accesibilidad: roles ARIA en tablas, contraste AA, foco visible.

## Verificación

- `tsgo` limpio.
- Playwright autenticado en `/admin/analytics`: screenshots desktop 1440 y mobile 375 confirman los 15 bloques con el mismo lenguaje visual que `/admin/emprendedores`, y CSV descarga en Top 10 Mercados, Top Organizadores, Análisis de Clicks, Fuentes, Actividad, Servicios y Top 10 Intención.
