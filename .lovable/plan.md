# Encuesta v2: ajustes de preguntas, correo y textos

## 1. Selección múltiple "Escoge hasta N"
- «¿En qué se te va más el dinero?» (hasta 3), «¿Cómo decides a qué mercado ir?» (hasta 2) y «¿Qué te haría ir a más mercados?» (hasta 3) dicen «Escoge hasta N».
- El botón «Siguiente» se activa con 1 selección; no deja pasar del máximo.
- «Nada, voy lo que quiero ir» sigue siendo exclusiva.

## 2. «Otro» en «¿Cómo decides a qué mercado ir?»
- Nueva opción «Otro» con un campo de texto corto (160 caracteres), igual que en «Lo que más te frena».

## 3. Pregunta nueva: mesas favoritas
- Antes de «¿Por dónde vives?»: «¿Cuáles son tus mesas favoritas? (nombre de la mesa o negocio)».
- Texto libre (300 caracteres), con «Siguiente» y «Saltar».
- Se ve en el panel como lista de las mesas más mencionadas (sin correos).

## 4. Correo con doble confirmación
- La casilla de permiso queda separada y solo es obligatoria si la persona escribe un correo.
- Al dejar el correo se envía un email desde RutaMercado con el botón «Confirmar mi correo».
- Al tocarlo se abre una página «¡Correo confirmado!» y la respuesta queda con `email_confirmed = true` (antes queda en false).
- El enlace es único por respuesta y no revela el correo.
- La lista de espera descargable incluye la columna «confirmado» (sí/no).
- Las respuestas de prueba (`?test=1`) también envían el correo, para poder probarlo.

## 5. Conteo y plurales
- El recorrido real tiene 14 o 15 preguntas según las respuestas (contando la nueva de mesas favoritas; la pantalla de la idea no cuenta). La portada dirá «15 preguntas rápidas» → «Menos de 15 preguntas».
- Plurales correctos en la encuesta, el panel y la tarjeta del dashboard: «1 persona / 2 personas», «1 se anotó / 2 se anotaron», «1 respuesta», «pagaría/pagarían», «dejó/dejaron».

## Detalles técnicos
- Migración en `encuesta_respuestas`: `descubrimiento_otro text`, `mesas_favoritas text`, `email_confirmed boolean not null default false`, `confirm_token uuid` (índice único).
- `steps.ts`: hints, opción `otro` + `other: true` en descubrimiento, paso `mesas_favoritas` (tipo texto, opcional).
- `EncuestaApp.tsx`: lógica multi (mínimo 1), componente de texto con «Saltar», casilla de permiso independiente, texto de portada.
- `encuesta.functions.ts`: campos nuevos en el schema; al guardar un correo con permiso, genera token y envía el email por Resend (`RESEND_API_KEY` existente, remitente @rutamercadopr.com), solo si el correo cambió.
- Ruta pública `src/routes/encuesta.confirmar.tsx` (`?t=token`) que llama a una función pública que marca `email_confirmed` por token.
- Helper `plural(n, uno, varios)` en `encuesta-stats.ts` con pruebas; usarlo en panel y dashboard.
- Verificación: recorrido con `?test=1`, revisar multi con 1 selección, «Otro», saltar mesas, correo sin casilla bloqueado, confirmar por enlace y ver `email_confirmed = true`.
