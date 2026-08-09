# Botón "Newsletter" en el header con scroll ancla al bloque de suscripción

Alcance: únicamente el header fijo de la homepage y el bloque de suscripción que ya existe más abajo en la misma página. No se toca el Hero, otras secciones ni otras páginas.

## Contexto verificado

- Los botones "Productores", "Registra tu Negocio", "Enviar mi Mercado" viven en `src/components/rutamercado/Header.tsx` (header sticky, `top-0`, `height: 64px`, `z-50`), no en el Hero.
- Los tres botones usan exactamente el mismo estilo sólido verde: `bg-[#54b678] text-white hover:bg-[#439660]` (escritorio `h-10 px-4 text-sm`; móvil en el Sheet `h-12 text-base`). No hay grupo secundario distinto: el nuevo botón copia ese mismo estilo.
- `Header` se renderiza en varias páginas (index, productores, negocios, mercados/$slug, mercados/index, CategoryPage, política-de-privacidad). El bloque completo de suscripción (`variant="full"`) solo existe en la homepage. Por eso el botón debe aparecer **solo en la homepage**.
- El scroll suave ya está activo globalmente: `html { scroll-behavior: smooth }` en `src/styles.css`. El sitio ya usa anclas con `href="#sobre-nosotros"` y offsets `scroll-mt-24` (ver `ContactSection.tsx`, `FilterBar.tsx`).
- El bloque de suscripción completo (`NewsletterSignup` variante `full`) hoy **no** tiene `id`.

## Cambios

### 1. `src/components/rutamercado/NewsletterSignup.tsx` — ancla del bloque

En la sección de la variante `full` (la del fondo navy con borde verde), agregar:
- `id="newsletter"` al `<section>`.
- `scroll-mt-24` (6rem) al mismo `<section>` para que el bloque quede totalmente visible debajo del header fijo de 64px, igual que ya hacen `ContactSection` y `FilterBar`.

No se toca la variante `compact` (ficha de mercado) ni la lógica de guardado/validación.

### 2. `src/components/rutamercado/Header.tsx` — botón Newsletter

- Detectar si la ruta actual es la homepage con `useRouterState({ select: (s) => s.location.pathname })` (el header ya usa hooks de React).
- En el grupo de navegación de escritorio, **solo cuando `pathname === "/"`**, agregar un botón "Newsletter" como ancla `href="#newsletter"` con exactamente el mismo estilo que los botones vecinos (`inline-flex h-10 items-center justify-center rounded-md bg-[#54b678] px-4 text-sm font-semibold text-white hover:bg-[#439660]`), colocado al final del grupo (después de "Enviar mi Mercado"), antes del `FavoritesTrigger`. No se altera el orden ni el diseño de los botones existentes.
- En el menú móvil (Sheet), también solo cuando `pathname === "/"`, agregar el mismo botón con el estilo móvil (`h-12 text-base`) y `onClick={() => setOpen(false)}` para cerrar el menú antes del scroll.
- Usar ancla nativa `href="#newsletter"` (no navegación de router): el scroll suave lo gestiona `scroll-behavior: smooth` ya activo. No recarga ni cambia la URL de forma permanente (el hash se gestiona por el navegador, igual que el ancla `#sobre-nosotros` existente).

## Qué NO se hace

- No se añade el botón en otras páginas (ficha de mercado, negocios, etc.): queda restringido a `/` por la verificación de pathname.
- No se duplica ni se crea una nueva versión del bloque de suscripción.
- No se cambia el orden o diseño de los botones existentes.
- No se modifica el Hero ni su buscador.
