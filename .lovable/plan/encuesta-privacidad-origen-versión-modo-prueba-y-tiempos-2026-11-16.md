# Encuesta: privacidad, origen, versión, modo prueba y tiempos

Aplica igual en /encuesta y /rutralover (es la misma encuesta).

## 1. Privacidad (Meta Pixel)
- En las páginas de la encuesta, el Pixel arranca con los eventos automáticos apagados (`autoConfig` en false antes de `init`), así no se envían textos de botones ni respuestas a Facebook.
- Se mantiene el `PageView`.
- Al llegar a la pantalla final se envía solo `SurveyComplete` (evento personalizado), sin datos.
- Se quitan los eventos `Lead` que hoy se envían al dejar el correo.
- Si alguien entra a la encuesta navegando desde otra página del sitio (donde el Pixel ya arrancó con eventos automáticos), la página de la encuesta se recarga completa para que arranque limpia.
- Google Analytics no cambia.

## 2. Origen
- Se leen `?src=` (qr, newsletter, instagram; cualquier otro o vacío = directo) y `?m=` (slug del mercado).
- Se guardan en columnas nuevas `source` y `market_slug`.
- "Canal de llegada" en el panel pasa a usar `source`. Las respuestas viejas sin `source` usan su `origen` actual como respaldo.
- El botón "Copiar enlace" comparte sin `?origen=` (queda directo), salvo que me digas otro valor.

## 3. Versión
- Columna `survey_version`: las existentes quedan "v1", las nuevas "v2".
- Filtro de versión en el panel (v2 / v1 / todas), v2 por defecto.

## 4. Modo prueba
- `?test=1` marca la respuesta con `is_test = true`.
- El panel las excluye por defecto; interruptor "Ver respuestas de prueba".
- Botón "Borrar respuestas de prueba" con confirmación (solo borra filas con `is_test = true`).
- La descarga de lista de espera también excluye pruebas.

## 5. Tiempos y respuestas parciales
- `started_at` al tocar "Empezar"; `completed_at` y `completed = true` al terminar.
- Se guarda la respuesta parcial después de cada pregunta contestada (misma fila, sin duplicar), con `completed = false`.
- El panel y la tarjeta del dashboard solo cuentan las completas.
- Las existentes quedan con `completed = true` y copian sus fechas actuales.

## Detalles técnicos
- Migración en `encuesta_respuestas`: `source text`, `market_slug text`, `survey_version text not null default 'v2'` (backfill v1 a filas existentes), `is_test boolean not null default false`, `started_at`, `completed_at timestamptz`, `completed boolean not null default false` (backfill true + fechas desde `iniciada_en`/`completada_en`). Columnas viejas quedan sin uso nuevo.
- `__root.tsx`: el script del Pixel llama `fbq('set','autoConfig',false,ID)` antes de `init` cuando la ruta es /encuesta o /rutralover.
- `encuesta.functions.ts`: schema acepta campos nuevos y parciales (preguntas opcionales si `completed=false`); upsert por `id_respuesta` sin pisar `completed=true`; nueva función admin `deleteTestRespuestas`; listado devuelve campos nuevos.
- `EncuestaApp.tsx`: lectura de parámetros, guardado parcial por paso, `SurveyComplete`.
- `encuesta-stats.ts` + pruebas: canal desde `source`; filtros versión/prueba/completas en `admin.encuesta.tsx`.
- Verificación: recorrido con `?test=1&src=qr&m=prueba`, revisar fila, panel, filtro, borrado, y que el Pixel no envíe `SubscribedButtonClick`.
