# Fase 3 de 4 — Panel /admin/mesas-aliadas

Implementar exactamente lo descrito en el documento, usando las funciones de la Fase 1 (`listMesasAliadasInteres`, `exportContactosMesasAliadas`, `deleteTestMesasAliadas`).

## Qué se construye
1. **Cálculos** (`src/lib/mesas-aliadas-interes-stats.ts` + prueba): `filtrar`, `resumen`, `conteo`, `descuentoInteresados`, `porDia` (hora de Puerto Rico, 30 días) y `LABELS` con los mismos textos de la landing. La prueba cubre: excluir pruebas, % de interesados, interesados sin contacto, % de "recibir" sobre personas y descuento solo entre interesados.
2. **Página** `src/routes/_admin/admin.mesas-aliadas.tsx`: mismo estilo que la encuesta (copiando `Section` y `BarCard`), interruptor "Mostrar pruebas", botones de CSV y "Borrar pruebas", 5 tarjetas, gráfica por día (línea #18253f), 7 tarjetas de barras, tabla de contactos sin email ni teléfono, y estado vacío con botón de copiar enlace. Título y noindex según el documento.
3. **CSV** `contactos-mesas-aliadas-AAAA-MM-DD.csv` con aviso si está vacío.
4. **Borrar pruebas** con confirmación, aviso del total borrado y recarga.
5. **Menú**: solo el ítem "Mesas Aliadas · Interés" (Handshake) debajo de la encuesta.
6. **Dashboard**: una tarjeta tras "Encuesta de membresía" con respuestas sin pruebas y "X interesados · Y dejaron contacto".

## No se toca
admin.encuesta.tsx, encuesta-stats.ts, admin.emprendedores.tsx, mesas-aliadas.ts, el resto del dashboard, otras páginas admin, analíticas ni la página pública.

## Verificación
Correr la prueba de cálculos; con sesión de administrador en el navegador: menú, estado vacío, datos con filas de prueba (ocultas hasta encender el interruptor), borrar pruebas, CSV con email/teléfono y tarjeta del dashboard. Borrar las filas de prueba al terminar.
