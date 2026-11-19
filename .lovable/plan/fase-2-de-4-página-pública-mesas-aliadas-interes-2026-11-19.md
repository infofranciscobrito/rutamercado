# Fase 2 de 4 — Página pública /mesas-aliadas/interes

Página a pantalla completa, con su propio encabezado y footer (sin el menú del sitio, igual que /rutalover), con el texto exacto de tu documento.

## Qué se hará
1. **Página nueva `/mesas-aliadas/interes`** con el mismo formato de título, descripción y vista previa al compartir que /rutalover (imagen de MrMercado saludando, tipografías DM Sans y DM Serif Display).
2. **Cuestionario completo** con estas secciones, en orden: portada, aviso de "no es una inscripción", la idea (3 tarjetas + 4 beneficios), cuestionario de 6 preguntas, preguntas rápidas y footer.
   - Una pregunta a la vez, con barra de progreso y "← Atrás" que conserva las respuestas. Las preguntas de una sola opción avanzan solas a los 280 ms.
   - Pregunta 5: máximo 2 opciones (si escoge una tercera, se quita la más vieja); no deja seguir sin al menos una.
   - "Sí" o "Me interesa" llevan a la pantalla de contacto. "Por ahora no" guarda una respuesta anónima y pasa al final.
   - En la pantalla de contacto se valida el correo y la casilla. "Ahora no, terminar" borra lo escrito y guarda la respuesta como anónima.
   - La pantalla final cambia el mensaje según el caso y tiene el botón "Copiar enlace" (con `?origen=compartido`).
3. **Guardado:** se guarda una sola vez al llegar al final, usando la función de la Fase 1. El origen se toma de `?origen=` y las pruebas se marcan con `?prueba=1`. Si el guardado falla, la persona igual ve su pantalla final.
4. **Medición:** eventos de Google (completada / contacto) y Lead de Meta solo al enviar con contacto. No se envía nada en modo prueba.
5. **Accesibilidad:** botones de 44 px o más, foco visible, animaciones suaves que se desactivan si la persona lo prefiere, y sin scroll horizontal en 375 px.

## No se toca
/rutalover, /encuesta, componentes y archivos de la encuesta, mesas-aliadas.ts, emprendedores, Header, Footer, estructura general del sitio, estilos globales, admin ni sitemap.

## Detalles técnicos
- Archivos: `src/routes/mesas-aliadas.interes.tsx` y `src/components/mesas-aliadas-interes/MesasAliadasInteresApp.tsx`.
- Los colores de la marca van directamente en el componente, como pediste en el documento. Es una excepción a la regla de usar los colores del tema del sitio, igual que hace /rutalover.
- Logo: `src/assets/rutamercado-logo-white.png`. Imágenes: `/encuesta/mrmercado-saludo.png` y `/encuesta/mrmercado-feliz.png` (ya existen).
- `id_respuesta = "m_" + crypto.randomUUID()` recortado a 40 caracteres o menos. Para no repetir el guardado se usa una marca con `useRef`.

## Verificación
Se harán con `?prueba=1` los tres recorridos (con contacto, "Me interesa" + "Ahora no", y "Por ahora no"), confirmando una sola fila por recorrido con los datos correctos. Además se revisará:
- Que la pregunta 5 respete sus límites y que "Atrás" conserve las respuestas.
- Que las imágenes carguen y que ningún texto diga "RutaLover", "mercaditos" ni tenga un correo de contacto.
- Que se vea bien en 375 px sin errores en consola, y que /rutalover siga igual.

Al final se borran las filas de prueba.
