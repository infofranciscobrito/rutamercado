# Rediseño visual — /admin/analytics

Solo cambia la presentación. Cero cambios en queries, filtros, permisos, lógica de fechas o exportaciones CSV.

## Lenguaje visual (fijo)

- **Paleta:** fondo `#FAFAF8`, tinta `#18253f`, acento `#54b678`, superficie suave `#FFF8EC`. Verde solo como acento de dato, nunca como fondo grande.
- **Tipografía:** JetBrains Mono para titulares de sección y todos los números; Work Sans para cuerpo, labels y tablas. Cargar JetBrains Mono en `__root.tsx` (Work Sans ya está).
- **Estructura:** informe editorial de una columna centrada (`max-w-6xl mx-auto`), capítulos numerados separados por regla horizontal navy fina. Sin tarjetas con sombra, sin glassmorphism, sin gradientes. Bordes hairline `border-[#18253f]/10` y reglas `border-[#18253f]` para separadores fuertes.
- **Motion:** fade+rise sutil al entrar en viewport, counters que suben en los KPIs. Respetar `prefers-reduced-motion`.

## Estructura de la página (mismas secciones, mismo orden)

1. **Header editorial** — Título "Analíticas" grande en mono + rango de fechas en subhead + selector "Últimos 30 días" (se conserva tal cual está el control) alineado a la derecha.
2. **Capítulo 01 · Alcance** — Grid 4 columnas con los 4 KPIs primarios (Vistas Directorio, Vistas Detalle, Cómo llegar, Engagement). Números XL en JetBrains Mono, label uppercase pequeño.
3. **Capítulo 02 · Interacción** — Grid 4 columnas con los 4 KPIs de clics (Teléfono, Email, Instagram, URL Contacto).
4. **Capítulo 03 · Intención & Estado** — Grid 4 columnas: ¡Voy a ir!, Me interesa, Mercados activos/inactivos, Submissions pendientes.
5. **Top 10 Mercados por Vistas** — Tabla editorial con numeración `01–10` a la izquierda, filas altas, hover crema, botón CSV en el header de sección.
6. **Top Organizadores** — Misma familia de tabla editorial + CSV.
7. **Análisis de Clicks por Tipo** — Barras horizontales limpias (una sola serie verde, ejes navy hairline).
8. **Distribución por Categoría / por Región** — Dos pies lado a lado con leyenda tipográfica debajo (mono para números, uppercase para labels).
9. **Tráfico Diario** — Line chart en verde con área translúcida, ejes hairline, tooltip navy.
10. **Fuentes de Tráfico** — Pie + tabla auxiliar, misma familia visual.
11. **Actividad por Página** — Tabla editorial.
12. **Submissions de Mercados** — Tabla editorial con badges de estado (Pendiente/Aprobado/Rechazado) en pill outline navy/verde/navy-muted.
13. **Servicios e Instalaciones** — 6 grupos en grid 3 col, cada uno con filas: label · barra progreso hairline · % en mono a la derecha. Sección envuelta en fondo `#FFF8EC` con regla superior.
14. **Intención de Asistencia** — 4 KPIs + tabla Top 10 con la misma familia editorial.
15. **Intención por Mercado / por Día** — Dos gráficos lado a lado (barras + línea) con la misma paleta.

## Detalles técnicos

- **Archivo principal a reescribir:** `src/routes/admin.analytics.tsx` (o el componente que renderiza actualmente). Mantener todas las llamadas de datos, hooks, cálculos y `Route.head`.
- **Nuevos componentes internos** (mismo archivo o `src/components/admin/analytics/`): `SectionHeader`, `KpiTile` (con `useCountUp`), `EditorialTable`, `HBarList`, `ProgressRow`, `Pie` (thin wrapper Recharts con colores locked). Ninguno maneja datos: reciben props.
- **Charts:** seguir usando Recharts (ya integrado). Sobrescribir colores: `stroke="#18253f"` en ejes/grid con `strokeOpacity={0.1}`, series en `#54b678` y `#18253f`, tooltip fondo `#18253f` texto blanco. Tipografía `Work Sans 11px` en ticks, `tabular-nums`.
- **Tokens CSS:** añadir a `src/styles.css` bajo `@theme`: `--font-mono: "JetBrains Mono", ui-monospace, monospace;` si falta, y utilities auxiliares `@utility rule-hair`/`rule-strong` si simplifica el markup (opcional — Tailwind arb classes también sirven).
- **Accesibilidad:** `tabular-nums` en todos los números, contraste AA (navy `#18253f` sobre crema pasa), roles ARIA de tabla preservados, `prefers-reduced-motion` gatea el counter y el fade-in.
- **Responsive:** grids 4-col → 2-col → 1-col en mobile. Tablas con `overflow-x-auto`.

## Verificación

- `tsgo` limpio.
- Playwright en `/admin/analytics` con sesión inyectada: screenshot desktop 1440 y mobile 375 confirma los 15 bloques presentes, números coinciden con la vista actual, y CSV funciona en Top 10 Mercados / Top Organizadores / Análisis de Clicks / Fuentes / Actividad / Servicios / Top 10 Intención.
