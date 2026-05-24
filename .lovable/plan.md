# Formulario público "Enviar mi Mercado"

## 1. Base de datos — nueva tabla `market_submissions`

Tabla aparte (no escribe en `markets`) para que los envíos pasen por revisión antes de publicarse. Esto protege el directorio de spam y datos incorrectos.

Campos (mismos visibles en la ficha del mercado + control de moderación):

- `id`, `created_at`, `updated_at`
- **Mercado:** `name`, `description`, `category` (enum), `region` (enum), `municipality`, `address`
- **Evento:** `event_date`, `start_time`, `end_time`, `frequency` (enum)
- **Imagen:** `image_url` (texto, URL pública del bucket)
- **Organizador:** `organizer_name`, `organizer_phone`, `organizer_email`, `organizer_instagram`
- **Moderación:** `status` (`pending` | `approved` | `rejected`, default `pending`), `admin_notes`, `reviewed_at`, `reviewed_by`, `published_market_id` (uuid, referencia al `markets.id` creado al aprobar)

### RLS
- `INSERT` permitido a `anon` y `authenticated` (cualquiera puede enviar su mercado).
- `SELECT` / `UPDATE` / `DELETE` solo para admins (`has_role(auth.uid(),'admin')`).

### Almacenamiento de imagen
Reutilizar el bucket existente `market-images` (ya público, con límite 5MB y MIME restringido). Añadir política para que `anon` pueda **subir** a la subcarpeta `submissions/` (lectura pública ya existe vía URL directa).

## 2. Backend — server functions

Archivo nuevo `src/lib/submissions.functions.ts`:

- `createMarketSubmission` (público, sin auth) — valida con Zod (mismos límites que `admin-markets.functions.ts`) e inserta en `market_submissions` vía `supabaseAdmin`. Incluye rate-limit suave: máximo 3 envíos por hora desde la misma IP/email (chequeo por email).
- `listSubmissions` (admin) — lista pendientes.
- `approveSubmission` (admin) — copia los datos a `markets` (is_active=true), marca submission como `approved` con `published_market_id`.
- `rejectSubmission` (admin) — marca como `rejected` con `admin_notes`.

## 3. Frontend — formulario público

### Ruta
Nueva ruta `src/routes/enviar.tsx` (`/enviar`) con `<head>` propio (title/description/og). Mismo lenguaje visual que el resto (Navy/Gold/Crema, tipografía display).

### Formulario `SubmitMarketForm.tsx`
Usa `react-hook-form` + Zod. Campos en este orden, con obligatorios marcados con `*`:

**Obligatorios (mínimo para publicar):**
- Nombre del mercado *
- Categoría * (select)
- Región * (select)
- Municipio *
- Dirección *
- Fecha del evento *
- Hora inicio * / Hora fin *
- Nombre del organizador *
- Al menos **uno** de: teléfono, email o Instagram (validación cruzada en Zod)

**Opcionales:**
- Descripción
- Frecuencia
- Imagen (subida con auto-recorte, ver §4)
- Los otros dos campos de contacto

Tras envío exitoso: mensaje de confirmación ("Recibimos tu mercado. Lo revisaremos en 1-2 días."). Botón para volver al home.

### Botones existentes
Cambiar los `mailto:` de `Header.tsx` (desktop + mobile) y `AboutSection.tsx` por `<Link to="/enviar">`.

## 4. Subida de imagen con auto-ajuste 16:9

La ficha usa `aspect-video` (16:9). Para que **toda** imagen subida calce sin deformar y sin barras, hacemos auto-recorte (center-crop) en el navegador antes de subir:

```text
Archivo seleccionado
   ↓
Validar tipo + magic bytes (igual que admin)
   ↓
Cargar en <img>, dibujar en <canvas> de 1600x900 (16:9)
con object-fit: cover (center-crop, sin deformar)
   ↓
Exportar a WebP calidad 0.85 (fallback JPEG)
   ↓
Subir a bucket market-images/submissions/{uuid}.webp
   ↓
Guardar publicUrl en image_url
```

Componente nuevo `ImageUpload16x9.tsx`:
- Input file con `accept="image/jpeg,image/png,image/webp,image/gif"`.
- Preview en vivo del recorte 16:9 antes de enviar.
- Tamaño final garantizado 1600×900 px → siempre se ve bien en la card y en el detalle.
- Misma validación de magic bytes que `MarketFormDrawer.tsx` (defensa en profundidad).
- Tamaño de salida limitado a ~5MB; si excede, se recomprime.

El admin también podrá reusar este componente si lo quieres, pero por ahora se mantiene `MarketFormDrawer` como está.

## 5. Panel admin (mínimo)

Nueva ruta `src/routes/_admin/admin.submissions.tsx`:
- Tabla con envíos `pending` (nombre, municipio, fecha, organizador, fecha de envío).
- Botón "Ver" abre drawer con todos los datos + imagen.
- Botones **Aprobar** (crea el mercado) / **Rechazar** (con nota opcional).
- Badge con conteo en `AdminSidebar.tsx` indicando envíos pendientes.

## 6. Archivos a crear / modificar

**Crear**
- `supabase/migrations/<timestamp>_market_submissions.sql`
- `src/lib/submissions.functions.ts`
- `src/routes/enviar.tsx`
- `src/components/rutamercado/SubmitMarketForm.tsx`
- `src/components/rutamercado/ImageUpload16x9.tsx`
- `src/routes/_admin/admin.submissions.tsx`
- `src/components/admin/SubmissionReviewDrawer.tsx`

**Editar**
- `src/components/rutamercado/Header.tsx` — botones → `Link to="/enviar"`
- `src/components/rutamercado/AboutSection.tsx` — botón → `Link to="/enviar"`
- `src/components/admin/AdminSidebar.tsx` — nuevo ítem "Envíos" con badge

## Notas técnicas

- Server functions usan `supabaseAdmin` para `INSERT` público (RLS lo bloquearía a `anon` por diseño). La validación Zod en el servidor es la única barrera; por eso límites estrictos de longitud y rate-limit por email.
- El recorte 16:9 ocurre 100% en cliente con `<canvas>` (sin Sharp ni libs nativas — incompatibles con el runtime Worker).
- La ruta `/enviar` es pública (no requiere login).
