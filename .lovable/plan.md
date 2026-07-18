## Objetivo

Añadir un dashboard analítico interno en el panel administrativo, en la misma sección donde el equipo revisa el "Registro de negocios" (tabla `emprendedores`). Solo accesible para admins autenticados. Consume la tabla `emprendedores` existente sin crear columnas nuevas.

## Ubicación

Nueva pestaña/sección **"Analítica"** dentro de `src/routes/_admin/admin.emprendedores.tsx`, mediante un toggle en la parte superior (Tabla | Analítica). La tabla actual con revisión/aprobación se mantiene sin cambios y sirve como la "Vista de tabla completa" (sección 8) que ya cumple el requisito de alternativa accesible.

## Server function nueva

`getBusinessRegistrationAnalytics` en `src/lib/admin-emprendedores.functions.ts` (protegida con `requireSupabaseAuth` + verificación admin vía `has_role`). Recibe filtros: `{ from, to, region, categoria, status }` — todos opcionales — y devuelve en una sola respuesta:

- `kpis`: total, aprobados, pendientes, rechazados, nuevos mes actual, nuevos mes anterior
- `trendMonthly`: `[{ month: 'YYYY-MM', count }]` últimos 12 meses (independiente del rango de fechas, para no perder la tendencia larga)
- `funnel`: `{ approved, pending, rejected }`
- `byCategoria`, `byRegion`: `[{ label, count }]` desc
- `byCanalVenta`: `[{ label, count }]` (multi-valor, expandir `canales_venta[]`)
- `byFormalidad` (`registro_comerciante`), `byDependencia` (`fuente_ingreso`), `byTiempoOperando`, `byTamanoEquipo`: `[{ label, count }]` con orden natural fijo definido en el server
- `empleosEstimados`: suma de puntos medios (1 · Solo yo, 4 · 2-5, 6 · 6+)
- `topMercados`: top 10 nombres extraídos de `mercados_interes[]` (split por coma, trim, lowercase para agrupar, preservar caso original más común)

Todos los conteos se agregan en el server function; los filtros se aplican vía `.gte/.lte(created_at)`, `.eq('region')`, `.eq('categoria_producto')`, `.eq('status')`.

Adicionalmente, un `exportBusinessRegistrationsCSV` que devuelve todas las filas con todos los campos (incluyendo internos) respetando los mismos filtros, para el botón de exportar.

## Estructura del dashboard (componente `BusinessAnalyticsDashboard.tsx` en `src/components/admin/`)

**Fila de filtros (sticky arriba):**
- Rango de fechas (Select con presets + rango personalizado con date pickers)
- Región · Categoría · Estado (Selects)
- Botón "Exportar CSV" a la derecha (reutiliza `src/lib/csv.ts::downloadCSV`)

**1. KPIs (5 tarjetas):** Total, Aprobados (con %), Pendientes (con %), Rechazados (con %), Nuevos este mes (con delta vs mes anterior). Los tres de estado usan un pequeño chip/ícono en `--status-good/warning/critical`; el número queda en `--text-primary`.

**2. Tendencia mensual:** `LineChart` de recharts, una serie azul (`--sequential-400`), tooltip con crosshair, últimos 12 meses.

**3. Embudo de aprobación:** Barra horizontal apilada 100% con 3 segmentos (good/warning/critical), etiquetas de % directas, 2px de gap entre segmentos.

**4. Distribuciones (grid 2 col desktop, 1 mobile):**
- Categoría de producto — `BarChart` horizontal, un solo hue azul, orden desc
- Región — mismo tratamiento
- Canales de venta — mismo tratamiento + nota "Un negocio puede seleccionar más de un canal…"

**5. Perfil del sector:** 3 barras apiladas 100% independientes (`div` con flex, no recharts — más simple y controlable):
- Formalidad: paleta categórica (`--series-1/2/4`)
- Dependencia: paleta categórica
- Tiempo operando: **rampa de un solo hue azul en orden ordinal fijo** (más oscuro = más antiguo), NO reordenado por magnitud

**6. Empleos:**
- `BarChart` horizontal ordinal (Solo yo → 2-5 → 6+), rampa azul secuencial
- Stat tile "Empleos estimados generados por el sector" + nota secundaria explicando el cálculo

**7. Top 10 mercados mencionados:** tabla simple con nombre + conteo, orden desc.

**8. Vista de tabla completa:** ya existe en la pestaña "Tabla" de la misma página; el botón "Exportar CSV" también se coloca ahí. Se reutiliza sin cambios funcionales — solo se añade el botón de exportar si aún no está.

## Tokens de color

Se añaden como variables CSS **con scope al contenedor del dashboard** (no globales, para no interferir con el resto del admin) en `src/styles.css` bajo un selector `.business-analytics-dashboard { ... }`. Todos los gráficos leen los tokens vía `var(--…)`.

## Reglas visuales aplicadas

- Sin pies/donas en ninguna parte
- Sin ejes duales
- Color por categoría fijo (orden estable independiente del filtro)
- Un solo hue azul para conteos comparativos; paleta categórica solo en las apiladas de "Perfil del sector"
- Tooltip en todos los charts, leyenda solo cuando hay >1 serie
- Texto siempre en `--text-primary`/`--text-secondary`, nunca pintado del color de la serie
- Barras con 2px radius y 2px gap entre segmentos apilados

## Fuera de alcance

- No se toca el formulario público, ni la ficha pública, ni la tabla `emprendedores` (sin migraciones)
- No se añade modo oscuro (el admin actual no lo soporta hoy)
- No se modifican los flujos de aprobar/rechazar existentes

## Archivos

- Nuevo: `src/components/admin/BusinessAnalyticsDashboard.tsx`
- Modificado: `src/lib/admin-emprendedores.functions.ts` — añadir `getBusinessRegistrationAnalytics` y `exportBusinessRegistrationsCSV`
- Modificado: `src/routes/_admin/admin.emprendedores.tsx` — toggle Tabla/Analítica + botón Exportar CSV
- Modificado: `src/styles.css` — bloque de tokens con scope `.business-analytics-dashboard`
