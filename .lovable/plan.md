# Rediseño visual del bloque de newsletter (fondo azul marino)

Solo cambia la presentación de `NewsletterSignup` (homepage y versión compacta de la ficha). Sin tocar validación, guardado ni mensajes.

## Colores (ya existentes en el sitio)

- Fondo: `#18253f` — el mismo azul marino del footer.
- Acento/CTA: `#54b678` — el verde que ya usan los botones principales.
- Título: blanco. Subtítulo y texto legal: gris azulado claro (`#C7D0DE`), legible pero por debajo del título.
- Enlace de Política de Privacidad: verde de marca con subrayado.
- Input: fondo blanco, texto oscuro, mismo `rounded` y altura que el resto de inputs del sitio.

Contraste: blanco sobre `#18253f` ≈ 14:1, `#C7D0DE` ≈ 9:1, verde `#54b678` sobre azul ≈ 6:1, y el texto `#18253f` dentro del botón verde ≈ 5.4:1 — todos por encima de AA.

## Composición

- Versión homepage: franja de ancho completo en azul, contenido centrado con ancho máximo controlado y padding vertical bastante mayor al actual (aire real arriba y abajo).
- Versión compacta (ficha de mercado): misma tarjeta `rounded-2xl` de hoy, pero en azul de esquina a esquina, con más padding interno.
- Input y botón en la misma fila en escritorio, misma altura; el botón mantiene un peso visual claro como acción principal.
- Un único detalle decorativo: línea de acento verde delgada en el borde superior del bloque. Sin degradados extra, sin ilustraciones.
- Icono: círculo con el verde de marca a opacidad suficiente y el símbolo en claro, para que no se apague sobre el azul.

## Detalles técnicos

- Un solo archivo: `src/components/rutamercado/NewsletterSignup.tsx` (clases de color, padding y contenedor).
- Sin cambios de tipografía ni de border-radius.
- El fondo oscuro se limita a este componente; ninguna otra sección lo hereda.
