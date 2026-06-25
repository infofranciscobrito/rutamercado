
## 1. Cambios visuales en la tarjeta (`ProducerCard.tsx`)

- Mantener una tarjeta por productor (agrupado por `organizer_name`).
- Nuevo encabezado:
  - **Título grande** (DM Serif / `font-display text-2xl`) = nombre del **primer mercado** del productor (`producer.markets[0].name`).
  - Debajo, en texto pequeño y secundario (`text-sm text-[#18253f]/60`): `Contacto: {organizer_name}`.
- Si hay logo del productor, mostrar thumbnail circular 56–64 px a la izquierda del título.
- Eliminar el duplicado en la línea de ubicación: la primera fila de mercado ya no repite el nombre (porque ya es el título). Mostrar solo municipio · región para el mercado principal, y para los demás mercados sí mostrar `nombre · municipio · región`. Se agrega un check para nunca renderizar dos veces el mismo `m.name`.

## 2. Base de datos (una migración)

- `ALTER TABLE public.markets ADD COLUMN organizer_logo_url text;` — compartido entre todos los mercados del mismo `organizer_name`.
- `ALTER TABLE public.producer_update_requests ADD COLUMN logo_url text;` para registrar el archivo adjunto enviado desde el popup.
- Sin cambios de RLS (las políticas existentes cubren los nuevos campos).
- Reutilizar el bucket existente `market-images` con la subcarpeta `producers/`. Ya es público y tiene los límites de tamaño/MIME correctos.

## 3. Server functions

- `producers.functions.ts`:
  - Añadir `organizer_logo_url` al `select` y al objeto `Producer`. Tomar el primer valor no vacío al agrupar.
  - Ampliar `submitProducerUpdateRequest` para aceptar opcionalmente `logo_base64` + `logo_filename` + `logo_mime`. Si llega:
    1. Validar tamaño ≤ 5 MB y MIME (`image/jpeg` / `image/png`).
    2. Subir a `market-images/producers/updates/{uuid}-{filename}` con el cliente service-role (cargado dentro del handler).
    3. Guardar la URL pública en `producer_update_requests.logo_url`.
    4. Adjuntarla en el correo de Resend (`attachments: [{ filename, content: base64 }]`).
- `admin-producers.functions.ts`:
  - Aceptar `organizer_logo_url` en `updateAdminProducer` y propagarlo a todos los mercados del productor.
  - Devolver `organizer_logo_url` en `listAdminProducers`.

## 4. Popup `UpdateProducerDialog.tsx`

Nueva sección "Logo o imagen del mercado":
- Subtexto: "Sube el logo o imagen de tu mercado. Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB."
- Botón estilizado (verde con icono `ImagePlus` de lucide) "Seleccionar imagen" que dispara un `<input type="file" hidden>` con `accept="image/jpeg,image/png"`.
- Al elegir archivo: validar tamaño/MIME en cliente y mostrar mensajes exactos pedidos.
- Preview: thumbnail 96×96 con botón "X" para remover.
- Al enviar: leer como base64 y enviarlo en el payload al server fn. Campo opcional — no bloquea el envío.

## 5. Admin (`/admin/producers`)

En `EditForm`, añadir una nueva sección "Logo del productor":
- Reutilizar `ImageUpload16x9` (ya existe en el proyecto) o un componente local más sencillo que suba al bucket `market-images` bajo `producers/{producer_key}-{uuid}.{ext}` usando el cliente browser de Supabase, mostrando thumbnail si ya existe.
- Guardar `organizer_logo_url` y pasarlo a `updateAdminProducer` — se replica a todos los mercados del productor.

## 6. Restricciones respetadas

- El logo en el popup es opcional; el envío funciona sin imagen.
- Sin cambios al resto de la funcionalidad existente de `/productores`.
- Estilo visual consistente con la paleta actual (`#18253f`, `#54b678`, `font-display`).

## Detalles técnicos

- Bucket: `market-images` (público, ya existe, límite 5 MB, MIME jpg/png/webp ya configurado).
- Email Resend: misma ruta actual; añadir `attachments` cuando exista logo (`content` = base64 sin prefijo data URL).
- Para evitar saturar el payload RPC, el límite de 5 MB se valida tanto en cliente como en servidor antes de subir.
- `producer_update_requests.logo_url` permite que admin vea la imagen aun si el correo falla.
