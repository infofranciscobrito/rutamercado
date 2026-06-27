## Registro público de productores en /productores

### Schema verificado

`productores`: id, nombre (NOT NULL), email, telefono, instagram, website, region, logo_url, contacto, created_at, updated_at.
`productor_mercados`: id, productor_id, mercado_nombre, created_at.

No existe columna `status` ni equivalente. Para soportar el flujo "pendiente → aprobado" sin que aparezcan en el directorio público hasta ser aprobados, **necesito añadir una columna `status` a `productores`** (valores: `pending` | `approved`, default `approved` para preservar los productores existentes). Esto es la única adición de schema; no se crean tablas ni otras columnas.

También se actualiza RLS para permitir `INSERT` anónimo en `productores` y `productor_mercados` (server function con publishable key), y la lectura pública se filtra a `status='approved'`.

### Paso 1 — Migración

- `ALTER TABLE productores ADD COLUMN status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved'))`.
- Backfill: filas existentes quedan `approved`.
- Nueva policy `INSERT` para rol `anon` en `productores` con `with_check (status = 'pending')`.
- Nueva policy `INSERT` para rol `anon` en `productor_mercados` que solo permita insertar filas cuyo `productor_id` apunte a un productor `pending`.
- Ajustar la SELECT pública de `productores` a `USING (status = 'approved')` (la policy de admin sigue viendo todo).

### Paso 2 — Storage

Reutilizar bucket existente `market-images` bajo prefijo `producers/registrations/`. Server function valida tamaño ≤5MB y MIME `image/jpeg`|`image/png`.

### Paso 3 — Server function pública

Nueva `src/lib/producer-registration.functions.ts`:
- `registerProducer` (POST, sin auth) con Zod: `nombre` requerido, resto opcional, `region` validada contra `MARKET_REGIONS`, `mercados[]` opcional, logo opcional (base64).
- Sube logo con `supabaseAdmin` (carga dinámica dentro del handler), inserta productor con `status: 'pending'`, inserta filas en `productor_mercados`.
- Envía notificación por email a `productores@rutamercadopr.com` vía Resend si `RESEND_API_KEY` existe (mismo patrón que `submitProducerUpdateRequest`).

### Paso 4 — UI pública

`src/routes/productores.tsx`:
- Reorganizar el hero: la barra de búsqueda y un nuevo botón **"Registro de productores"** quedan en la misma fila (`flex` con `items-center`, search a la izquierda crece, botón a la derecha). En mobile se apilan.
- El botón reutiliza exactamente las clases del CTA "Enviar mi mercado" (verificaré en `Hero.tsx`/`Header.tsx` y copiaré la misma variante — verde `#54b678`, mismo radius y tamaño).
- Al click abre un nuevo componente `RegisterProducerDialog.tsx` (basado en el patrón de `UpdateProducerDialog.tsx`).

### Paso 5 — `RegisterProducerDialog.tsx`

Campos exactos:
- Nombre del productor (requerido)
- Contacto (persona de contacto — campo `contacto` ya existe en la tabla)
- Región (Select con Metro / Norte / Sur / Este / Oeste)
- Email
- Teléfono
- Página web
- Logo (upload JPG/PNG ≤5MB con preview, mismo helper que `UpdateProducerDialog`)
- "¿Qué mercados organizas? (separa con comas si organizas más de uno)" → string, se parte por coma en el server

Todos los inputs con `autoComplete="off"`, `data-lpignore="true"`, `data-form-type="other"`. Validación cliente: `nombre.trim().length > 0`. Cierra con X / click fuera. Tras éxito muestra: *"¡Gracias por registrarte! Revisaremos tu información y en 24 horas o menos tu perfil estará visible en el directorio."*

### Paso 6 — Panel admin

`src/routes/_admin/admin.producers.tsx` + `src/lib/admin-producers.functions.ts`:
- `adminListProducers` devuelve `status`.
- Añadir tabs/filtro **"Pendientes" / "Aprobados" / "Todos"** arriba de la lista.
- En cada productor pendiente: botones **Aprobar** (nueva server fn `adminApproveProducer` → `update status='approved'`) y **Rechazar** (reusa `adminDeleteProducer`, con confirm).
- Badge visual "Pendiente" en la tarjeta admin.
- Invalidar queries `["producers"]` y `["admin","producers"]` tras aprobar/rechazar.

### Restricciones respetadas

- Solo se añade una columna (`status`) — imposible cumplir el flujo aprobado/pendiente sin ella; se documenta claramente.
- No se usa la palabra "mercaditos".
- Estilo navy/verde/blanco conservado; botón idéntico al CTA existente.
- Productores `pending` invisibles en `/productores` (RLS + filtro server).

### Archivos a tocar

- Migración Supabase (nueva).
- `src/lib/producer-registration.functions.ts` (nuevo).
- `src/lib/producers.functions.ts` — filtrar `status='approved'`.
- `src/lib/admin-producers.functions.ts` — incluir `status`, añadir `adminApproveProducer`.
- `src/components/productores/RegisterProducerDialog.tsx` (nuevo).
- `src/routes/productores.tsx` — layout hero + botón + dialog.
- `src/routes/_admin/admin.producers.tsx` — tabs + acciones.
