# Newsletter "Mercados de la semana" — captura de correos

Objetivo: capturar y guardar correos en el sitio (sin envío todavía), con un bloque público en la home y otro compacto en la ficha de mercado, más una vista de administración para ver y exportar la lista.

## Diseño

Se reutilizan exactamente los estilos ya existentes: mismos colores de marca (#18253f, #54b678, fondos #FAFAF8 / blanco), la tipografía `font-display` para títulos, los componentes `Input` y `Button` del sitio, `rounded-2xl` y `rm-shadow-warm` como en las tarjetas actuales. No se añaden colores, fuentes, radios ni sombras nuevas.

## Bloque público

Homepage (ancho completo, después del grid del directorio y antes de "Conoce RutaMercado"/footer):
- Título: "Recibe los mercados de la semana en tu correo"
- Subtítulo: "Cada semana te mandamos los mercados activos en Puerto Rico. Sin spam, cancelas cuando quieras."
- Input de email + botón "Suscribirme"
- Texto pequeño: "Al suscribirte aceptas nuestra Política de Privacidad" (enlace a /politica-de-privacidad)

Ficha de mercado /mercados/[slug] (compacto, al final del contenido antes del footer):
- Título: "¿Quieres enterarte de mercados como este?"
- Mismo input + botón, sin subtítulo
- Enlace a la política de privacidad en texto más pequeño

Comportamiento:
- Validación de formato de email en el navegador antes de enviar.
- Botón con estado de carga (mismo patrón que el formulario de contacto).
- Éxito (correo nuevo o repetido): el formulario se reemplaza en el sitio por "¡Listo! Ya estás en la lista." sin recargar.
- Correo ya existente: nunca se revela; muestra el mismo mensaje de éxito.
- Error de red/servidor: mensaje breve debajo del input y el formulario queda disponible para reintentar.

## Datos

Nueva tabla `newsletter_subscribers`: `id`, `email` (único, guardado en minúsculas), `source` ('homepage' | 'ficha_mercado'), `market_slug` (opcional), `status` ('activo' por defecto), `created_at`, `updated_at`.

Acceso: nadie puede leer la lista públicamente; el alta se hace desde el servidor y la lectura sólo desde el panel de administración autenticado.

## Panel de administración

Nueva página "Newsletter" en el menú de admin: tabla con correo, origen, mercado (si aplica), estado y fecha; contador total; botón "Exportar CSV" reutilizando el helper de CSV que ya existe en el proyecto.

## Detalles técnicos

- Migración: `CREATE TABLE public.newsletter_subscribers` con `UNIQUE (email)`, GRANTs (`service_role` full; `authenticated` SELECT), RLS activo, política de lectura para administradores vía `has_role(auth.uid(),'admin')`, y trigger `set_updated_at`.
- `src/lib/newsletter.functions.ts`:
  - `subscribeToNewsletter` — server fn pública, valida con zod (email trim/lowercase, max 255; source enum; market_slug opcional), inserta con `supabaseAdmin` usando `upsert`/`onConflict: email` ignorando duplicados, y devuelve siempre `{ ok: true }`. Límite simple anti-abuso por email.
  - `listNewsletterSubscribers` — server fn con `requireSupabaseAuth`, lectura ordenada por fecha.
- `src/components/rutamercado/NewsletterSignup.tsx` — componente único con prop `variant: "full" | "compact"`, estados `idle | submitting | success | error`, usando `useServerFn`.
- Inserción: `src/routes/index.tsx` (antes de `<AboutSection />`) y `src/routes/mercados/$slug.tsx` (después de `RelatedMarkets`).
- Admin: `src/routes/_admin/admin.newsletter.tsx` + entrada en `AdminSidebar.tsx`.
