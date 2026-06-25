# Plan — Directorio de Productores

## Datos disponibles (verificados en `markets`)

Campos del productor que existen en la tabla `markets`:
- `organizer_name`, `organizer_phone`, `organizer_email`, `organizer_instagram`, `organizer_contact_url`
- Asociados: `name` (mercado), `region`, `municipality`, `is_active`

**No existe** un campo "página web" separado — se usará `organizer_contact_url` como "Enlace de contacto / web". No se crean campos nuevos.

No hay una tabla `producers` separada: cada mercado activo lleva la información de su productor. La página agrupará por `organizer_name` (normalizado) para evitar duplicados si un productor organiza varios mercados.

---

## 1. Página pública `/productores`

Archivo nuevo: `src/routes/productores.tsx` (ruta pública, SSR).

- **Loader**: server function pública (`getProducers`) que lee `markets` con cliente publishable y filtro `is_active = true`, proyectando solo columnas seguras (organizer_*, name, region, municipality). Agrupa por `organizer_name` (trim + lowercase como clave); si un productor tiene varios mercados, lista todos.
- **Head**: title y description únicos en español, og:title/og:description.
- **Hero corto**: título "Productores de mercados locales en Puerto Rico" + subtítulo + barra de búsqueda (input controlado, filtra por nombre productor / mercado / región / municipio).
- **Secciones por región**: encabezados Metro, Norte, Sur, Este, Oeste (solo los que tengan resultados). Productores sin región van a "Otros".
- **Grid responsivo**: 1 col mobile / 2 tablet / 3 desktop. Orden alfabético por `organizer_name` dentro de cada región.
- **Card** (`ProducerCard`):
  - Nombre del productor (tipografía DM Serif Display, más prominente)
  - Mercado(s) que produce y región/municipio (DM Sans)
  - Botones de contacto con iconos lucide-react (Phone, Mail, Instagram, Globe), solo si el dato existe; targets ≥ 44px
  - Instagram mostrado como `@handle`, web como URL clicable
  - Si no hay ningún contacto: texto "Contacto no disponible"
  - Botón "Actualizar información" (variant outline) que abre el modal
- **Estilo**: tokens existentes de `src/styles.css` (mismos colores, radius, shadows, hover sutil) — sin nuevas variables. Reutiliza `Card`, `Button`, `Input` de shadcn.

## 2. Modal "Actualizar perfil de productor"

Componente nuevo: `src/components/productores/UpdateProducerDialog.tsx` usando `Dialog` de shadcn.

Campos:
- Nombre productor (read-only, pre-cargado)
- Textarea "¿Qué información deseas actualizar?" (validado con zod, requerido, max 2000)
- Input email "Tu email de contacto" (zod email, requerido)
- Botón "Enviar solicitud"

Al enviar llama a server fn `requestProducerUpdate` que envía email a `productores@rutamercadopr.com`:
- Asunto: `Solicitud de actualización — {organizer_name}`
- Cuerpo: nombre productor, mercado(s), email del solicitante, texto libre

Tras éxito muestra: "Recibimos tu solicitud. Actualizaremos tu información en 24 horas o menos." Modal cierra con X o clic afuera (comportamiento por defecto del Dialog).

### Servicio de email

El proyecto **no tiene email configurado todavía**. Propuesta: usar **Lovable Emails** (built-in, dominio propio). Esto requiere:
1. Configurar dominio de email (`rutamercadopr.com` subdomain) vía el diálogo de setup.
2. `setup_email_infra` + `scaffold_transactional_email`.
3. Crear template `producer-update-request` y enviarlo desde la server fn al destinatario fijo `productores@rutamercadopr.com`.

> Nota: estos pasos requieren acción del usuario (configurar DNS del subdominio). Mientras DNS se verifica, el código queda listo y los envíos arrancan al activarse el dominio.

## 3. Panel admin → "Productores"

Nueva ruta: `src/routes/_admin/admin.producers.tsx` + entrada en `AdminSidebar`.

Como los datos viven en `markets`, "productor" = agrupación por `organizer_name`. El panel ofrece dos modos:

- **Vista lista**: tabla con organizer_name, email, phone, instagram, contact_url, región, # mercados asociados, con buscador.
- **Editar productor**: drawer que edita los campos `organizer_*` y región en **todos los mercados** que comparten ese `organizer_name` (un solo UPDATE filtrado). Confirma cuántos mercados se afectarán.
- **Añadir productor manualmente**: como no hay tabla independiente y un productor sin mercado no aparece en `/productores`, esta acción crea un registro mínimo en `markets` con `is_active=false` (placeholder) usando los datos del productor. Se documenta en el UI: "Se creará un mercado borrador asociado al productor; podrás completarlo luego en Mercados."
- **Eliminar productor**: AlertDialog de confirmación; borra todos los mercados con ese `organizer_name` (o limpia campos organizer_* — el equipo decide). Por seguridad, el plan implementa **soft remove**: pone `is_active=false` en todos los mercados de ese productor y limpia campos organizer_* solo si el usuario marca "borrar también los mercados".

Todas las operaciones via server fns con `requireSupabaseAuth` + check de rol admin (patrón ya usado en `admin-markets.functions.ts`).

## 4. Navegación

Añadir link "Productores" → `/productores` en `src/components/rutamercado/Header.tsx` (desktop nav + mobile menu), usando el patrón existente.

## 5. Restricciones cumplidas

- Sin la palabra "mercaditos".
- Sin nuevos campos en Supabase (se reutilizan los `organizer_*` existentes).
- Solo se muestran productores con `is_active=true`.
- Sin colores/fuentes nuevas — solo tokens y componentes ya presentes.
- Admin integrado en el dashboard existente (mismo layout, mismo sidebar).

## Archivos a crear/editar

Crear:
- `src/routes/productores.tsx`
- `src/components/productores/ProducerCard.tsx`
- `src/components/productores/UpdateProducerDialog.tsx`
- `src/lib/producers.functions.ts` (getProducers pública + requestProducerUpdate)
- `src/routes/_admin/admin.producers.tsx`
- `src/components/admin/ProducerEditDrawer.tsx`
- `src/lib/admin-producers.functions.ts`
- Template email `src/lib/email-templates/producer-update-request.tsx` + registro

Editar:
- `src/components/rutamercado/Header.tsx` (link nav)
- `src/components/admin/AdminSidebar.tsx` (entrada Productores)
- `src/lib/email-templates/registry.ts`

## Pregunta antes de implementar

1. **Email**: ¿OK configurar Lovable Emails con un subdominio de `rutamercadopr.com` (te pediré confirmar DNS)? Si prefieres Resend u otro, dime.
2. **Eliminar productor en admin**: ¿soft-remove (desactivar mercados) o hard-delete (borrar filas)? Por defecto propongo soft-remove con opción explícita de hard-delete.
3. **Añadir productor manual**: ¿OK que cree un mercado borrador `is_active=false`, o prefieres que esta acción quede deshabilitada hasta que exista una tabla `producers` dedicada (requeriría migración)?
