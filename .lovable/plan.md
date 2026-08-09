# Ficha de mercado: servicios en la tarjeta + newsletter reubicado

Solo cambia `/mercados/[slug]`. No se tocan otras páginas ni el schema.

## Cambio 1 — "Servicios e instalaciones" dentro de la tarjeta tipo boleto

- Se elimina el botón "Agregar a mi calendario" y su generación de `.ics` de la tarjeta. Queda solo "Cómo llegar".
- En su lugar, dentro de la misma tarjeta (mismo borde perforado, tipografía y colores), aparece un bloque "Servicios e instalaciones" separado por el mismo divisor fino que ya usa la tarjeta.
- Filas mostradas, en este orden, usando los campos existentes del mercado: Mascotas, Estacionamiento, Familiar, Área de comida, Accesibilidad y Métodos de pago.
- Cada fila es ícono + etiqueta + valor real del mercado. Los métodos de pago se muestran como chips pequeños.
- Cualquier campo sin dato se omite por completo (sin "N/A" ni filas vacías). Si no hay ningún dato, el bloque no aparece.

### Color según si el servicio ayuda o no

Basado en los valores reales que ya existen en los datos:

- Verde de acento (positivo): "Sí, son bienvenidas", "Sí, gratuito", "Sí, ideal para familias", "Sí, múltiples opciones", "Totalmente accesible".
- Gris/muted (limitado o negativo): "Solo en áreas designadas", "Limitado (llega temprano)", "Sí, de pago", "Parcialmente", "Sí, opciones limitadas", "Parcialmente accesible", "No se permiten mascotas", "No tiene".

Regla: valores que empiezan con "No", o que contienen "limitad", "parcial", "de pago" o "solo en", se tratan como muted; el resto de valores afirmativos van en verde.

- La sección "Servicios e instalaciones" que hoy aparece en la columna izquierda de la página se elimina para no duplicar la información.

## Cambio 2 — Posición del bloque de newsletter

Hoy el bloque de suscripción está **después** de "Otros mercados que te pueden interesar". Se mueve para que quede justo antes de esa sección, es decir: información del mercado → bloque de suscripción → otros mercados. El diseño del bloque (navy, bordes verdes de 4px, título, input + botón, enlace de privacidad) y su comportamiento no cambian.

## Detalles técnicos

- `src/components/rutamercado/MarketTicketCard.tsx`: quita `downloadIcs`/`handleCalendar` y el botón; renderiza el nuevo bloque de servicios.
- `src/components/rutamercado/MarketAmenityChips.tsx`: se reescribe como lista compacta para la tarjeta, añadiendo `food_area` y `payment_methods`, con helper de tono positivo/muted (íconos de lucide ya usados en el sitio).
- `src/routes/mercados/$slug.tsx`: elimina la sección de amenidades de la columna izquierda e intercambia el orden de `NewsletterSignup` y `RelatedMarkets`.
- `src/lib/ics.ts` queda sin uso desde esta página; se deja en el proyecto por si otra vista lo usa.
