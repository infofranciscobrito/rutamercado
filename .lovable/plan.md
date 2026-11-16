# Tres ajustes a la encuesta RutaLover

## 1. Enlace correcto: /rutalover
- /rutalover pasa a ser la página principal de la encuesta (título, descripción y vista previa al compartir se mantienen).
- /rutralover y /encuesta redirigen a /rutalover conservando ?src, ?m y ?test (los QR impresos siguen funcionando).
- Se cambian todas las menciones de "rutralover": texto "Resultados de rutamercadopr.com/rutalover", botón "Copiar enlace", mensaje de "Todavía no hay respuestas", enlace de compartir, sitemap y enlace canónico.

## 2. Opción de frenos
- Encuesta: "Un descuento de 15% no me mueve" → "Un descuento de 5–15% no me compensa".
- Panel "Freno principal": "Un 15% no los mueve" → "Un descuento de 5–15% no les compensa".
- El valor guardado no cambia, así que las respuestas existentes siguen contando en esa opción.

## 3. Singular y plural en el panel
- "X de N llegó / llegaron por el QR en un mercado" (llegó solo con 1).
- Igual en "dejó / dejaron su email" y en el resto de frases con conteo que aún no lo apliquen ("se anotó / se anotaron", "persona / personas" ya revisadas).

## Detalles técnicos
- Intercambiar archivos de ruta: `rutalover.tsx` contiene la página, `rutralover.tsx` redirige con 301 (igual que `encuesta.tsx`).
- `SURVEY_PATH = "/rutalover"` y `surveyRedirectTarget` acepta `/encuesta` y `/rutralover`; actualizar `encuesta-flow.test.ts` y correrlo.
- `__root.tsx` ya cubre las tres rutas para la privacidad del Pixel.
- Cambiar la etiqueta en `steps.ts` y `encuesta-stats.ts` (clave `descuento_bajo` intacta).
- `admin.encuesta.tsx`: usar el helper `plural` donde falte; revisión con Playwright de /rutralover, /encuesta y el panel.
