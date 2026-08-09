# Clasificar el origen de los clics y extender el toggle "Excluir tráfico interno"

## Situación actual (verificada)

- `detailViews` y `engagementRate` salen de la tabla de clics de mercado (`market_clicks`, tipo `view_detail` + clics de contacto). Esa tabla guarda `market_id`, `click_type`, `era_destacado` y fecha — **no guarda referrer**, por eso el toggle no los mueve.
- Las visitas de página sí guardan `referrer` y ya se clasifican al leer con `classifyReferrer`.

## Cambios

### 1. Guardar el origen en cada clic (desde hoy)

- Añadir una columna `traffic_source` (texto) a la tabla de clics de mercado, sin valor por defecto (los ~registros históricos quedan vacíos = "sin clasificar").
- Lo mismo para la tabla de intenciones de asistencia, para mantener coherencia con las tarjetas que usan clics.
- El navegador envía `document.referrer` junto al clic; el servidor lo clasifica con la misma función `classifyReferrer` (`interno` / `desarrollo` / `externo`) y guarda la etiqueta ya calculada. No se guarda la URL completa, solo la etiqueta.

### 2. Aplicar el toggle a los clics

- Cuando "Excluir tráfico interno" está activo, las lecturas de clics descartan las filas etiquetadas `interno` y `desarrollo`. Las filas históricas sin etiqueta **se siguen contando** (no se pueden clasificar), para no borrar el histórico de golpe.
- Afecta a: "Vistas de detalle", "Engagement", clics de contacto/direcciones y el desglose por mercado.

### 3. Nota en las tarjetas

- Bajo "Vistas de detalle" y "Engagement", una línea discreta en el mismo estilo de las notas existentes:
  `Los datos anteriores al 9 de agosto de 2026 no están clasificados por este filtro.`
- Sin cambios de color, tipografía ni diseño.

## Detalles técnicos

- Migración: `ALTER TABLE public.market_clicks ADD COLUMN traffic_source text` y lo mismo en `market_attendance_intentions`.
- `src/lib/analytics.functions.ts`: `trackMarketClick` acepta un `referrer` opcional, lo clasifica en el servidor y lo guarda.
- `src/lib/attendance.functions.ts`: igual para `recordAttendanceIntention`.
- `src/components/rutamercado/MarketDetailContent.tsx` y `MarketDetailDialog.tsx`: pasan `document.referrer` (o la URL actual cuando no hay referrer) al llamar al tracking.
- `src/lib/admin-analytics.functions.ts`: mover `classifyReferrer` a un helper reutilizable; seleccionar `traffic_source` en las consultas de clics e intenciones y filtrar cuando `excludeInternal` está activo, conservando las filas con valor nulo.
- `src/routes/_admin/admin.analytics.tsx`: añadir la nota en las dos tarjetas.

Sin librerías nuevas y sin tocar "Vistas al Directorio" / "Actividad por Página".
