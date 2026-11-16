# Panel /admin/encuesta: números más honestos con muestras pequeñas

## 1. Quitar
- El titular de veredicto ("Sí, hay buena señal" / "Hay señal, pero moderada" / "Todavía no hay suficiente señal") y su punto de color.
- La frase "De cada 10 personas…".
- La tarjeta de resumen "Si 1,000 visitantes ven la oferta".
- El bloque superior queda con la pregunta "¿Pagarían $24 al año?", la proporción principal con su rango y la barra de 4 segmentos.

## 2. Qué se cuenta
- Solo respuestas completas, de la versión elegida en el filtro, sin pruebas. El interruptor "Ver respuestas de prueba" se mantiene apagado por defecto.
- Cada tarjeta y cada gráfica muestra "n = X" (las personas que contestaron esa pregunta; por ejemplo, "Cómo la pagarían" usa solo a quienes vieron la pregunta del plan).

## 3. Muestras pequeñas (n < 30)
- En ese bloque se ven conteos ("2 de 3") en lugar de porcentajes, con la nota "Muestra muy pequeña".
- Las barras siguen dibujándose con su tamaño.

## 4. Tablas por edad, género, zona y canal
- Se ocultan los grupos con menos de 5 personas y se juntan en una fila "Otros (n<5)".
- "Más interés" solo puede salir en grupos visibles (y sigue exigiendo el mínimo actual de 15).

## 5. Rango de confianza (Wilson 95%)
- En las proporciones principales: "Pagarían $24", "Pagarían y dejaron email", "Lista de espera", "Acepta $24 o más" y la columna "pagaría" de cada grupo.
- Formato: "67% · rango 21–94%". Con n < 30: "2 de 3 · rango 21–94%".

## 6. Gráficas de selección múltiple
- Subtítulo: "% que lo puso entre sus opciones (hasta 3)" en "En qué gastan más" y "Qué los haría ir a más mercados"; "(hasta 2)" en "Cómo deciden a qué mercado ir", que es su máximo real.

## 7. Descargar todas las respuestas
- Botón nuevo "Descargar todas las respuestas (CSV)" junto al de lista de espera.
- Incluye todas las columnas de las respuestas que se ven con los filtros actuales (versión, pruebas), completas y parciales con su columna "completed".
- Pregunta abierta resuelta así: incluye el email solo de quienes dieron permiso, porque ya bajas la lista de espera con correos. Si prefieres sin correos, se quita.

## Detalles técnicos
- `encuesta-stats.ts`: helpers `wilson(k, n)`, `fmtProp(k, n)` (conteo si n<30, % si no, + rango), `collapseSmall(groups, 5)`; `dist`/`segment` devuelven conteos `c` y `n` además de `v`; quitar `verdict`, `por1000` y la tarjeta de 1,000; pruebas para Wilson (2 de 3 → 21–94%), umbral 30 y agrupado n<5.
- `encuesta.functions.ts`: nueva `exportTodasRespuestas` (admin, todas las columnas, email solo con consentimiento).
- `admin.encuesta.tsx`: Tile/BarCard/SegCard reciben n y usan `fmtProp`; nota "Muestra muy pequeña"; nuevo botón CSV.
- Verificación: insertar respuestas de prueba a mano no es posible desde aquí, así que se prueba con las pruebas automáticas y una revisión en pantalla del panel con las respuestas actuales.
