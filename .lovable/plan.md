## Objetivo

1. Simplificar la columna "Para Organizadores" del footer (quitar Guía y FAQ).
2. Añadir un formulario de contacto funcional que envíe mensajes al dashboard admin, con confirmación al usuario.

---

## 1. Footer — limpiar columna "Para Organizadores"

**Archivo:** `src/components/rutamercado/Footer.tsx`

Eliminar los links:
- "Guía para organizadores" (`#guia-para-organizadores`)
- "Preguntas frecuentes" (`#preguntas-frecuentes`)

Dejar solo:
- Registrar mi mercado (`/enviar`)
- Contacto (ahora apunta a `#contacto` en la home, donde estará el nuevo formulario)

---

## 2. Base de datos — tabla `contact_messages`

Migración con:

**Tabla `public.contact_messages`**
- `name` (texto)
- `role` (enum: `productor` | `vendor` | `publico_general`)
- `email`
- `phone`
- `message`
- `status` (enum: `new` | `read` | `archived`, default `new`)
- `created_at`, `updated_at`

**Políticas RLS:**
- INSERT abierto (público puede enviar mensajes, sin auth)
- SELECT/UPDATE solo para admins (usando `has_role(auth.uid(), 'admin')`)
- GRANTs: `INSERT` a `anon` y `authenticated`; `SELECT, UPDATE` a `authenticated`; `ALL` a `service_role`

Trigger `updated_at` reutilizando `public.set_updated_at()`.

---

## 3. Server functions

**Nuevo archivo:** `src/lib/contact.functions.ts`

- `submitContactMessage` — pública (sin auth middleware). Zod valida todos los campos (nombre 1–100, email válido, teléfono 7–20, mensaje 5–2000, role enum). Inserta vía cliente publishable (server) y devuelve `{ success: true }`.
- `listContactMessages` — protegida con `requireSupabaseAuth` + check `has_role admin`. Devuelve mensajes ordenados por `created_at desc`.
- `markContactMessageRead` — protegida, cambia `status` a `read`.
- `countNewContactMessages` — protegida, devuelve `{ count }` de mensajes con `status = 'new'` (para badge en sidebar).

---

## 4. Formulario de contacto público

**Nuevo componente:** `src/components/rutamercado/ContactForm.tsx`

Campos:
1. Nombre (input)
2. Soy (Select shadcn con opciones Productor / Vendor / Público en general)
3. Correo electrónico (input email)
4. Número de teléfono (input tel)
5. ¿Cómo le ayudamos? (textarea)
6. Botón "Enviar"

- Validación con `zod` + `react-hook-form`.
- Al enviar: llama `submitContactMessage`, muestra loading en el botón.
- En éxito: abre un `AlertDialog` (shadcn) con mensaje: *"¡Tu mensaje fue enviado exitosamente! Nos estaremos comunicando contigo pronto para atender tu consulta."*, y limpia el formulario.
- En error: `toast.error` con mensaje genérico.

**Nueva sección en la home:** `src/components/rutamercado/ContactSection.tsx`

- Contenedor con `id="contacto"` y `scroll-mt-24`.
- Título "Contáctanos" + subtítulo corto + `<ContactForm />`.
- Se monta en `src/routes/index.tsx` entre `<AboutSection />` y `<Footer />`.

---

## 5. Dashboard admin — nueva sección "Mensajes"

**Nueva ruta:** `src/routes/_admin/admin.messages.tsx`

- Lista de mensajes en `Table` (Fecha, Nombre, Soy, Email, Teléfono, Estado, Acciones).
- Click en fila abre un `Drawer`/`Dialog` con el mensaje completo y botón "Marcar como leído".
- Filtro simple por estado (todos / nuevos / leídos).
- Refetch cada 60s.

**Sidebar (`src/components/admin/AdminSidebar.tsx`):**

- Añadir item `{ to: "/admin/messages", label: "Mensajes", icon: Mail }`.
- Badge con `countNewContactMessages` (mismo patrón que Solicitudes de Mercados).

---

## Archivos

**Nuevos:**
- `src/lib/contact.functions.ts`
- `src/components/rutamercado/ContactForm.tsx`
- `src/components/rutamercado/ContactSection.tsx`
- `src/routes/_admin/admin.messages.tsx`
- Migración SQL (tabla + RLS + GRANTs + trigger)

**Editar:**
- `src/components/rutamercado/Footer.tsx` (quitar 2 links)
- `src/components/admin/AdminSidebar.tsx` (item Mensajes + badge)
- `src/routes/index.tsx` (montar `<ContactSection />`)

## Fuera de alcance

- No se envían emails/SMS de notificación externos; la "notificación al dashboard" es la aparición del mensaje en la nueva sección con badge de conteo.
- No se implementa respuesta desde el dashboard (solo lectura + marcar como leído).
