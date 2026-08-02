## Diagnóstico (verificado en el código)

La lógica de la Parte 1 **sí existe** en el preview: `CategoryPage.tsx` ordena destacados primero, `MarketGrid` pasa `featured`, y `MarketCard` pinta la insignia + borde verde + padding mayor. Dos razones probables de que no lo veas:

1. El sitio en `rutamercadopr.com` es la versión **publicada**, que aún no incluye estos cambios.
2. Las **filas por categoría de la homepage** (`CategoryRow.tsx`) NO usan `destacado`: ordenan solo por próxima fecha y ni siquiera pasan la insignia. Ahí el destacado no sale primero.

Primero verifico con capturas en el preview antes de tocar nada más.

---

## Parte 1 — Destacado en los listados

- `CategoryRow.tsx` (homepage): anteponer el grupo `destacado = true` antes del corte a 4 fichas, manteniendo la fecha ascendente dentro de cada grupo, y activar la insignia.
- `MarketGrid.tsx`: en desktop dar `sm:col-span-2` a la ficha destacada (probado primero; si desalinea el grid se revierte al refuerzo de padding/tipografía). En móvil sigue ocupando una columna completa.
- `MarketCard.tsx`: subir el nombre del mercado un paso en la escala tipográfica existente cuando es destacado, y dejar **solo** el borde de 2px en `#54b678` (sin sombra extra). La insignia "Destacado" ya usa el mismo pill/tipografía que el badge de categoría.
- Verificación obligatoria con Playwright: activo destacado en 2 mercados de categorías distintas que hoy no salen primeros, capturo la página de categoría a 1280px y a 375px, y confirmo orden, insignia, tamaño y ausencia de scroll horizontal.

---

## Parte 2 — Medición de mercados destacados

### Base de datos (una migración)

- `markets.destacado_desde timestamptz` + trigger que lo setea a `now()` al pasar `destacado` de false→true y lo limpia al desactivar.
- `market_clicks.era_destacado boolean` y `market_attendance_intentions.era_destacado boolean`, para congelar el estado en el momento del evento. Los eventos ya guardan `market_id`, así que no hay que corregir eso.
- Los registros históricos quedan en `null` (desconocido) y se tratan como "no destacado" en los cálculos, indicándolo en la nota de contexto.

### Captura

`trackMarketClick` y el registro de intención leen el `destacado` actual del mercado y lo escriben en `era_destacado`. No se crean eventos nuevos ni un sistema paralelo.

### Dashboard `/admin/analytics`

Nueva sección con `SectionDivider label="Mercados destacados"`, justo después de "Rendimiento por mercado", con el mismo sistema `ba-card` / bento grid y respetando el filtro de fechas y el toggle de tráfico interno existentes:

1. **Titular narrativo** generado de los datos (vistas de destacados, % del total, tasa de contacto vs. no destacados).
2. **Tarjeta 1 — Resumen comparativo**: dos columnas Destacados / No destacados con vistas totales, promedio por mercado, tasa de contacto y tasa de intención, aplicando la regla de "n bajo" ya existente.
3. **Tarjeta 2 — Tabla de destacados actuales**: mercado + municipio, categoría, vistas, clics de contacto, intención, tasa de contacto y `destacado_desde`; ordenable, por vistas por defecto.
4. **Tarjeta 3 — Nota de contexto** con el promedio real de días con insignia activa.

Un servidor nuevo `getFeaturedPerformance` en `admin-analytics.functions.ts` siguiendo el patrón de `getTopMarkets` (mismo middleware admin y helper de rango).

### Verificación

Activo/desactivo destacados, genero vistas y clics reales en el preview, y confirmo con captura que la sección refleja esos números y que un mercado desactivado conserva su histórico.

---

## Fuera de alcance

Sin pagos, sin asignación automática, sin cambios al toggle del admin ni tokens visuales nuevos.
