# Fase 4 de 4 — Revisión final de la encuesta

Solo revisión. El único cambio de código es añadir una línea al sitemap.

## Qué se hará
1. **Sitemap:** añadir `/encuesta` con prioridad 0.6 (frecuencia mensual) en `src/routes/sitemap[.]xml.ts`. No se cambia nada más en ese archivo.
2. **Carga:** abrir /encuesta en un celular de 390 px y en escritorio (1280 px). Revisar que no haya desplazamiento hacia los lados ni errores en la consola, y sacar capturas.
3. **Tres recorridos de prueba en el preview**, cada uno con un `?origen=` distinto para identificarlo:
   - A: "No pagaría nada" → debe ir directo a "¿Qué es lo que más te haría dudar?"
   - B: "Hasta $24" → debe ir directo a "¿Qué plan escogerías?", luego a dudas
   - C: "Hasta $36" + "Probablemente sí" → plan, luego dudas
   Te diré la secuencia de pantallas y en cuál terminó cada recorrido (pantalla final de gracias).
4. **Confirmación:** comprobar que cada recorrido dejó UNA sola fila en las respuestas, y que /admin/encuesta los muestra (3 respuestas) al entrar como administrador.
5. **Limpieza:** borrar solo esas 3 filas de prueba, identificadas por su origen, y confirmar que la tabla quedó como estaba antes.

## Lo que no se toca
Nada más: ni la página de la encuesta, ni el admin, ni el estilo, ni otras rutas.

## Si algo falla
Si un recorrido no va a la pantalla esperada o hay errores en consola, no lo arreglo: te informo lo que vi y espero tu decisión.
