# Fase 3 — Dashboard de la encuesta en /admin/encuesta

Esta vez el archivo trae el dashboard de referencia completo. Se construye siguiendo sus textos, cálculos y reglas, con los colores del admin.

## Qué vas a ver
- **"Encuesta"** en el menú lateral del admin, justo debajo de "Dashboard".
- Página **/admin/encuesta**, en este orden y sin filtros:
  1. Respuesta principal "¿Pagarían $24 al año por la membresía?": veredicto con punto de color, frase "De cada 10 personas…" y barra de 4 segmentos con leyenda. Botón "Ir al resumen ↓".
  2. 5 tarjetas: Respuestas, Gastan por visita, Van a mercados, Mercados distintos, Lista de espera.
  3. "Quiénes respondieron y quiénes pagarían": 4 tablas (edad, género, zona, canal), etiqueta "más interés" y grupos de menos de 15 personas atenuados.
  4. "Cómo van a los mercados", "Qué compran y qué los mueve" y "La membresía".
  5. Resumen final con borde verde: título según la señal, 6 hallazgos y "Qué hacer ahora".
- Botón **"Descargar lista de espera (CSV)"** arriba a la derecha.
- Si no hay respuestas: el mensaje indicado y un botón para copiar el enlace de la encuesta.
- En /admin/dashboard, **una sola tarjeta nueva**, "Encuesta de membresía", que lleva a /admin/encuesta. El resto queda igual.
- No se muestra ningún correo en pantalla. Los correos solo salen en el CSV.

## Lo que no se toca
El resto de /admin/dashboard, las demás páginas de admin, las funciones de analíticas y la página pública /encuesta.

## Detalles técnicos
- Archivos nuevos: `src/routes/_admin/admin.encuesta.tsx` y un helper puro `src/lib/encuesta-stats.ts` con todos los cálculos (puntos medios, "pagarían" = plan anual/mensual, "lo están pensando", umbrales de señal 15% / 8%, regla de "más interés" con mínimo de 15 personas). Ese helper se prueba en `encuesta-stats.test.ts`.
- Los datos vienen de `listEncuestaRespuestas` (no trae correos) y el CSV de `exportListaEspera` + `src/lib/csv.ts`.
- Cambios puntuales: añadir un ítem en `AdminSidebar.tsx` (ícono ClipboardList) y una `MetricCard` en `admin.dashboard.tsx`.
- Verificación con Playwright como admin: estado vacío, datos de prueba temporales (se borran al final), descarga del CSV y que no aparezcan correos.
