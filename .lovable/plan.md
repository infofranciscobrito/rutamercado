
# Directorio de Emprendedores

Tercera sección del sitio, al mismo nivel que Mercados y Productores. Auto-registro con aprobación admin, luego listado público filtrable.

## Base de datos (migración)

Nueva tabla `emprendedores`:

```
- id (uuid, pk)
- nombre_negocio (text, requerido)
- logo_url (text, nullable) — foto/logo subida a bucket market-images
- descripcion (text, requerido, máx ~280 chars)
- categoria_producto (text) — enum-like: Comida y Repostería, Artesanías,
  Ropa y Accesorios, Arte, Productos Agrícolas, Cuidado Personal, Otro
- region (text) — Metro/Norte/Sur/Este/Oeste (misma lista que Productores)
- municipio (text, nullable)
- instagram (text, nullable)
- email (text, nullable)
- telefono (text, nullable)
- persona_contacto (text, nullable)
- mercados_interes (text[], nullable) — lista libre (nombres de mercados
  donde ha participado o le interesa)
- status (text, default 'pending') — 'pending' | 'approved' | 'rejected'
- created_at, updated_at (timestamptz)
```

Validación mínima: al menos un contacto (instagram, email o teléfono).

### RLS + GRANTs
- `anon` + `authenticated`: SELECT solo filas con `status = 'approved'`.
- `anon` + `authenticated`: INSERT permitido (auto-registro público) forzando `status = 'pending'` vía policy WITH CHECK.
- `service_role`: ALL (admin server functions con `supabaseAdmin`).
- Trigger `update_updated_at`.

## Server functions

Nuevo `src/lib/emprendedores.functions.ts`:
- `listEmprendedores()` — público, retorna aprobados con filtros opcionales (categoría, región).
- `getEmprendedor(id)` — público, aprobado.
- `submitEmprendedor(input)` — público, valida con Zod, inserta como `pending`.

Nuevo `src/lib/admin-emprendedores.functions.ts` (protegidos con `requireSupabaseAuth` + admin check, patrón idéntico a `admin-producers.functions.ts`):
- `adminListEmprendedores({ status? })`
- `approveEmprendedor(id)`
- `rejectEmprendedor(id)`
- `updateEmprendedor(id, patch)`
- `deleteEmprendedor(id)`
- `pendingEmprendedoresCount()` — para badge en sidebar.

## Rutas y componentes

### Público
- `src/routes/emprendedores.tsx` — página del directorio. Hero con el copy dado ("Directorio de Emprendedores" / "Tu negocio, visible ante los organizadores…"), sección "¿Por qué registrarte?" con las 3 razones, CTA "Regístrate como Emprendedor" que abre el dialog. Grid de tarjetas (logo, nombre, categoría badge, municipio/región) con filtros de categoría y región (mismo patrón que `/productores`). Click abre dialog con perfil completo.
- `src/components/emprendedores/EmprendedorCard.tsx` — tarjeta estilo consistente con `ProducerCard` (fondo navy, borde verde 2px).
- `src/components/emprendedores/EmprendedorDetailDialog.tsx` — perfil completo: descripción, contactos clickeables (IG, mailto, tel), mercados de interés.
- `src/components/emprendedores/RegisterEmprendedorDialog.tsx` — formulario de auto-registro con todos los campos, subida de logo al bucket `market-images` (patrón de `ImageUpload16x9`), anti-autofill como los otros formularios, submit → toast de éxito indicando "pasa por aprobación".

### Header + Footer
- `src/components/rutamercado/Header.tsx`: añadir link "Emprendedores" entre "Productores" y "Enviar mi Mercado", en desktop y en el sheet mobile.
- `src/components/rutamercado/Footer.tsx`: añadir "Emprendedores" en la columna Explorar.
- `src/routes/index.tsx` sección Contacto: añadir "Emprendedor" al dropdown "Soy" (si aplica).

### Admin
- `src/routes/_admin/admin.emprendedores.tsx` — lista con tabs Pendientes / Aprobados / Rechazados, tabla con nombre, categoría, región, contacto, acciones (aprobar / rechazar / editar / eliminar). Drawer de revisión estilo `SubmissionReviewDrawer`.
- `src/components/admin/AdminSidebar.tsx`: nuevo item "Emprendedores" con badge de pendientes.

### Sitemap
- `src/routes/sitemap[.]xml.ts`: añadir `/emprendedores`.

## Copy exacto (hero de `/emprendedores`)

- H1: "Directorio de Emprendedores"
- Subtítulo: "Tu negocio, visible ante los organizadores de mercados de Puerto Rico."
- Descripción: "Regístrate una vez y queda disponible para que los organizadores de mercados, bazares y popups te encuentren, conozcan tu negocio y te inviten a participar en sus próximos eventos."
- CTA: "Regístrate como Emprendedor"
- Beneficios (3 tarjetas): Más invitaciones · Cero costo, un solo registro · Presencia seria (textos completos del brief).

## Diseño

Misma identidad visual: fondo `#18253f`, acento `#54b678`, tipografías existentes. Tarjetas idénticas en estructura a `ProducerCard` para consistencia.

## Fuera de alcance (confírmame si lo quieres incluir)

- Notificación por email al admin cuando llega un registro nuevo.
- Que los organizadores puedan "invitar" directamente desde la plataforma (por ahora solo ven el contacto y escriben por fuera).
- Analítica de vistas/clics de emprendedores.
- Edición del perfil por parte del propio emprendedor (por ahora solo el admin edita después de aprobar).

## Suposiciones

- El auto-registro es abierto (sin login), igual que `/productores`.
- Se reutiliza el bucket `market-images` para logos (subcarpeta `emprendedores/`).
- Validación: `nombre_negocio`, `descripcion`, `categoria_producto`, `region` son obligatorios; al menos uno de `instagram`, `email`, `telefono`.

## Archivos afectados

- `supabase/migrations/<ts>_emprendedores.sql` (nuevo)
- `src/lib/emprendedores.functions.ts` (nuevo)
- `src/lib/admin-emprendedores.functions.ts` (nuevo)
- `src/routes/emprendedores.tsx` (nuevo)
- `src/routes/_admin/admin.emprendedores.tsx` (nuevo)
- `src/components/emprendedores/EmprendedorCard.tsx` (nuevo)
- `src/components/emprendedores/EmprendedorDetailDialog.tsx` (nuevo)
- `src/components/emprendedores/RegisterEmprendedorDialog.tsx` (nuevo)
- `src/components/rutamercado/Header.tsx` (editar)
- `src/components/rutamercado/Footer.tsx` (editar)
- `src/components/admin/AdminSidebar.tsx` (editar)
- `src/routes/sitemap[.]xml.ts` (editar)
