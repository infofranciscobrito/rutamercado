
## Objetivo
Eliminar la duplicidad en `/productores` separando los productores en sus propias tablas, sin tocar la tabla `markets`.

## Paso 1 — Base de datos (migración Supabase)

Crear dos tablas nuevas en `public`:

**`productores`**
- `id uuid pk default gen_random_uuid()`
- `nombre text not null`
- `email text`, `telefono text`, `instagram text`, `website text`, `region text`, `logo_url text`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()`
- Índice único case-insensitive sobre `lower(nombre)` para evitar duplicados futuros.

**`productor_mercados`**
- `id uuid pk default gen_random_uuid()`
- `productor_id uuid not null references productores(id) on delete cascade`
- `mercado_nombre text not null`
- `created_at timestamptz default now()`
- Único `(productor_id, lower(mercado_nombre))`.

GRANTs + RLS:
- `productores`: `GRANT SELECT TO anon, authenticated` (directorio público); INSERT/UPDATE/DELETE solo `service_role` (admin pasa por server fn con role check). Política `select` abierta.
- `productor_mercados`: igual patrón (`SELECT` público, mutaciones vía service_role).
- `service_role`: `GRANT ALL` en ambas.

Trigger `set_updated_at` en `productores`.

## Paso 2 — Migración de datos (en la MISMA migración SQL, idempotente)

Dentro del mismo archivo de migración, ejecutar un bloque `DO $$ ... $$` que:

1. Inserta en `productores` un registro por cada `organizer_name` único (consolidando por `lower(trim(organizer_name))`) tomando de `markets` (donde `is_active = true` y nombre no vacío) el primer valor no-vacío de `organizer_email`, `organizer_phone`, `organizer_instagram`, `organizer_contact_url` (→ `website`), `organizer_logo_url` (→ `logo_url`), `region`. Usa `ON CONFLICT` sobre el índice único para que sea re-ejecutable sin efecto.
2. Inserta en `productor_mercados` un registro por cada `(productor_id, markets.name)` distinct, con `ON CONFLICT DO NOTHING`.

La tabla `markets` y sus columnas `organizer_*` quedan intactas (siguen siendo la fuente para el formulario público de envío).

## Paso 3 — Server functions nuevas (`src/lib/producers.functions.ts`)

Reescribir el archivo para leer de las nuevas tablas:

- `listProducers()` (público, server publishable client): `SELECT` de `productores` + join a `productor_mercados`. Devuelve `{ id, nombre, region, email, telefono, instagram, website, logo_url, mercados: string[] }[]`, ordenado por nombre.
- Mantener `submitProducerUpdateRequest` (popup público) sin tocar tabla `productores`; solo inserta en `producer_update_requests` y manda email. Añadir al schema Zod el campo `market_names` ya existente (se reutiliza para "Mercados que organizas").

Server functions admin nuevas (`src/lib/admin-producers.functions.ts`, todas con `requireSupabaseAuth` + check `has_role(admin)`):

- `adminListProducers()` — todos los productores con sus mercados.
- `adminUpsertProducer(input)` — crea o actualiza un productor. Zod schema con todos los campos de contacto aceptando `string | "" | null` (normaliza a `string | null`); soporta `logo_base64/logo_mime/logo_filename` opcional (sube a bucket `market-images/producers/`).
- `adminDeleteProducer(id)`.
- `adminAddProducerMarket(productor_id, mercado_nombre)`.
- `adminRemoveProducerMarket(id)`.

## Paso 4 — UI pública `/productores`

`src/components/productores/ProducerCard.tsx`:
- Logo (si existe) en la parte superior, circular/cuadrado con `rounded-2xl`.
- **Título principal**: `nombre` del productor en DM Serif Display.
- Bloque "Mercados que organiza:" con pills (`Badge` shadcn) listando cada `mercado_nombre`.
- Región, email, teléfono, Instagram, website con sus íconos lucide (los actuales).
- Botón "Actualizar información" (sin cambios funcionales).

`src/routes/productores.tsx`: adaptar el tipo `Producer` al nuevo shape, mantener búsqueda + agrupación por región existentes.

`src/components/productores/UpdateProducerDialog.tsx`: ya existe `market_names`; solo cambiar su label a "Mercados que organizas" y el helper text indicando que se separen por coma.

## Paso 5 — Admin `/admin/producers`

Rediseñar el drawer/form de edición:
- Campos contacto: `nombre`, `email`, `telefono`, `instagram`, `website`, `region`, `logo_url` (con upload — reutilizar el uploader actual).
- Nueva sección **"Mercados que organiza"**:
  - Lista actual de pills con `× ` que llama a `adminRemoveProducerMarket`.
  - Input + botón "Añadir" que llama a `adminAddProducerMarket`.
- Botón "Eliminar productor" con confirmación.

La tabla principal de `/admin/producers` pasa a listar `adminListProducers()`.

## Paso 6 — Tipos

`src/integrations/supabase/types.ts` se regenera automáticamente tras la migración. Crear `src/types/producer.ts` con el tipo de dominio `Producer` que consume la UI.

## Restricciones respetadas
- `markets` no se modifica ni se elimina.
- Todos los campos de contacto son opcionales y aceptan `null`/`""` sin romper Zod.
- Migración de datos corre dentro del archivo SQL (automática en deploy), idempotente.
- Estilo visual se mantiene (mismos componentes shadcn, tokens, fuentes).

## Notas técnicas
- El popup público sigue siendo solo "solicitud" — no escribe directo en `productores`. El admin aplica los cambios manualmente desde `/admin/producers`.
- El índice único `lower(nombre)` previene duplicados nuevos al añadir productores desde el admin.
- Para borrar mercados vinculados se cascadea por `on delete cascade`.
