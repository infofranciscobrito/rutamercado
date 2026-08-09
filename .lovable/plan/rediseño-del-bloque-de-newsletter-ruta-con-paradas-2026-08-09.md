# Rediseño del bloque de newsletter: ruta con paradas

Solo presentación de `NewsletterSignup` (homepage y versión compacta de la ficha). No se toca validación, guardado ni el panel de suscriptores.

## Versión homepage

Franja de ancho completo con:

- Fondo azul marino de marca (#18253f) con degradado sutil de esquina a esquina.
- Borde superior e inferior de 4px sólido en el verde de acento (#54b678), siempre visible sin depender de las secciones vecinas.
- Contenido centrado con ancho máximo ~760px y padding vertical amplio (mayor que el resto de secciones).

Contenido de arriba hacia abajo:

1. Stepper de ruta: 5 paradas — Metro, Norte, Sur, Este, Tu correo — conectadas por línea punteada. Las 4 primeras con punto pequeño azul grisáceo apagado y nombre en mayúsculas, tamaño pequeño, gris azulado tenue. "Tu correo" con punto más grande en verde, halo suave alrededor (estático, sin animación) y nombre en verde con peso más fuerte. Bajo ~600px los nombres se ocultan y queda solo la línea con los puntos.
2. Separación amplia y luego el título: "Los mercados de la semana, directo en tu correo" — blanco, centrado, tamaño de H2 destacado.
3. Subtítulo: "Cada semana seleccionamos los mercados activos en Puerto Rico y te los mandamos antes del fin de semana. Sin spam, cancelas cuando quieras." — gris azulado claro (#C7D0DE), ancho máximo limitado.
4. Formulario en una fila (input + botón "Suscribirme →"), apilado a ancho completo en mobile. Input con fondo más oscuro que el bloque y borde claro sutil, texto blanco y placeholder atenuado. Botón en verde de acento con texto navy, misma altura que el input.
5. Texto pequeño: "Al suscribirte aceptas nuestra Política de Privacidad", con enlace a /politica-de-privacidad en verde subrayado.

## Versión compacta (ficha de mercado)

Misma paleta: tarjeta navy con borde verde de 4px arriba y abajo, mismo radio actual. Sin stepper. Título corto "¿Quieres enterarte de mercados como este?", input + botón en línea, enlace de privacidad. Estados de carga, éxito y error idénticos a los actuales, sobre el fondo oscuro.

## Detalles técnicos

- Un solo archivo: `src/components/rutamercado/NewsletterSignup.tsx`.
- El stepper es un sub-componente local del mismo archivo, marcado `aria-hidden` por ser decorativo; línea punteada con bordes discontinuos, sin SVG externo ni dependencias nuevas.
- Sin cambios de tipografía ni de border-radius; sin animaciones nuevas (el glow es una sombra estática).
- El fondo navy queda confinado a este componente.
