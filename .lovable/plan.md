# Vista previa al compartir de Mesas Aliadas

**Causa:** la imagen que se usa hoy (MrMercado saludando) es vertical, de 516×1000. WhatsApp la recorta y solo se ve el torso.

## Cambios
1. Crear una imagen horizontal de 1200×630 en `public/og-mesas-aliadas.png`. Se arma con piezas que ya existen:
   - fondo con los colores de la marca, navy #18253f con un toque de verde #54b678
   - MrMercado saludando completo a la derecha, sin recortes
   - logo de RutaMercado y el título "¿Te interesa ser Mesa Aliada?" a la izquierda, con la frase "6 preguntas · menos de 2 minutos"
   - todo lo importante va en la zona central, que tampoco se corta en las vistas cuadradas
2. Usar esa imagen en og:image y twitter:image de `/mesas-aliadas/interes`, y añadir og:image:width, og:image:height y og:image:alt.
3. Acortar la descripción para que WhatsApp no la corte: "Programa de descuentos para clientes de mercados locales. Contesta 6 preguntas rápidas."

## Nota
WhatsApp guarda la vista previa vieja. Para ver la nueva hay que publicar y luego compartir el enlace con otra variación, por ejemplo `?prueba=1&v=2`.
