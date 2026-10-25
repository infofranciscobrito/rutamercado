# Fase 2 de 4 — Página pública /encuesta

Ya tengo el HTML completo de la encuesta. Solo faltan las **11 imágenes**: las 8 poses de MrMercado, los 2 logos y el ícono. Puedo construir todo ahora, pero hasta que subas las imágenes esos espacios saldrán vacíos. No voy a inventarlas.

## Qué se hará
- Crear la página /encuesta a pantalla completa, sin el menú ni el pie del sitio. Será idéntica al HTML: textos, colores, letras DM Serif Display + DM Sans, animaciones, poses por pregunta, reacciones y cálculo final.
- Tendrá su propio estilo con el prefijo "enc-", sin tocar el estilo general del sitio.
- Cambiar el envío del HTML por la función de la Fase 1. Las preguntas de varias opciones se envían como listas. Se envía al llegar a la pantalla final y otra vez si la persona se anota en la lista de espera, con el mismo código de respuesta.
- Las preguntas de varias opciones avanzan solas al marcar 3, 2 y 3. "Nada, voy lo que quiero ir" avanza en el acto. Se quita "Listo, sigamos".
- Reglas de salto exactas, borrando la respuesta de cada pregunta que se salte.
- Sin formularios: "Avísame primero" y "Anótame en la lista" funcionan al hacer clic, y Enter en el campo de correo hace lo mismo.
- Leer `?origen=` del enlace (si no hay, "directo"). Se quitan el modo de prueba y el panel de datos.
- Medición en Google Analytics (encuesta completada y lista de espera) y en Meta (Lead), solo si esas herramientas están cargadas.
- Título, descripción e imagen para compartir como indicaste. Enlace para compartir: https://rutamercadopr.com/encuesta?origen=compartido.
- Siempre "mercados" o "mercados locales", nunca "mercaditos".
- Cuando lleguen las 11 imágenes, se guardan en la carpeta `encuesta/` del sitio con los nombres exactos. La página ya las buscará ahí.

## Verificación
- Pantalla completa, sin menú ni pie del sitio.
- Completar la encuesta: se guarda una sola fila, y al anotarse al final se actualiza esa misma fila.
- "No pagaría nada" va directo a "¿Qué es lo que más te haría dudar?".
- Celular a 390 px sin desplazamiento hacia los lados.
- "Avísame primero" sin marcar la casilla muestra el aviso.
- Las 8 poses y el logo se revisarán cuando subas las imágenes.
- Al final borro las respuestas de prueba.

## Detalles técnicos
- `src/routes/encuesta.tsx` con su `head()`, más `src/routes/encuesta.css` con todo el estilo prefijado "enc-".
- Las letras se cargan con un enlace en el `head()` de la propia ruta, no en `__root.tsx`.
- El estado de la encuesta vive en React. `submitEncuesta` se llama con `useServerFn`, y `window.gtag?.()` y `window.fbq?.()` solo si existen.
- No se tocan Header, Footer, HomeView, `__root.tsx`, `styles.css`, las demás rutas, el admin ni el sitemap.
