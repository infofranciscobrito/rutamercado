## Cambio

Agrandar el logo en el header (que ocupe toda la altura de la franja) y aumentar significativamente el tamaño del logo en el footer para que sea protagonista.

## Header (`src/components/rutamercado/Header.tsx` y `src/routes/enviar.tsx`)

- Header actual: 64 px de alto, logo `h-12` (48 px).
- Cambio: logo a `h-16` (64 px) para que ocupe toda la franja del header de pared a pared vertical, sin padding visible arriba/abajo.
- Como el logo ahora tiene fondo transparente, no genera un bloque opaco al expandirse.
- En móvil se mantiene también `h-16` (el header sigue siendo de 64 px en todos los breakpoints).

## Footer principal (`src/components/rutamercado/Footer.tsx`)

- Footer actual: logo `h-8` (32 px) con `opacity-80`.
- Cambio: logo a `h-24` md:`h-28` (96–112 px), quitar la opacidad (`opacity-100`) para que se vea con fuerza y sea el elemento dominante del footer.
- Mantener el resto del layout (línea verde superior, copyright, links).

## Footer de la página `/enviar` (`src/routes/enviar.tsx`)

- Footer actual: logo `h-8`.
- Cambio: a `h-24` md:`h-28`, sin opacidad, para mantener consistencia con el footer principal.

## Fuera de alcance

- AdminSidebar: el logo del panel admin queda como está (la barra lateral tiene un ancho limitado y ya luce bien con `h-14`). Si quieres también agrandarlo allí, dímelo.
- No se tocan colores, tipografía ni estructura — solo tamaños y opacidad del logo.
