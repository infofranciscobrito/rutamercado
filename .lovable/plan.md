## Objetivo

Corregir la jerarquía visual de `ProducerCard` en `/productores` y `/admin/producers`:

1. Título = `productores.nombre` (nombre real del productor, no del mercado).
2. Subtítulo "Contacto: …" desde nuevo campo `productores.contacto`.
3. Región con ícono pin (sin ciudad).
4. Sección "MERCADOS" con pills, **entre región y contacto**.
5. Links de contacto (web, IG, email, tel).
6. Botón "Actualizar información" al final.

## Cambios

### 1. Base de datos (migración)
- `ALTER TABLE productores ADD COLUMN contacto text` (nullable).
- Re-migrar `productores.nombre` desde `markets.organizer_name` usando el vínculo de `productor_mercados`:
  - Para cada productor, tomar el `organizer_name` del primer mercado vinculado (o el más reciente). Si `organizer_name` es nulo/vacío, dejar el `nombre` actual.
  - Backfill opcional: `contacto` puede quedar NULL inicialmente; lo poblará el admin.
- Sin cambios en RLS (la tabla ya tiene políticas y grants).

### 2. Tipos y server functions
- Regenerar tipos tras la migración (`productores.contacto`).
- `src/lib/producers.functions.ts`: agregar `contacto: string | null` al tipo `Producer` y al `select`/mapeo de `listProducers`.
- `src/lib/admin-producers.functions.ts`: incluir `contacto` en el schema Zod (nullable + literal "") y en create/update.

### 3. UI tarjeta pública (`src/components/productores/ProducerCard.tsx`)
Orden exacto del JSX:
```
[logo opcional centrado]
<h3> producer.nombre </h3>
{contacto && <p>Contacto: {contacto}</p>}
{region && <div><MapPin/> {region}</div>}
{mercados.length>0 && (
  <section>
    <p class="uppercase text-xs">MERCADOS</p>
    <pills/>
  </section>
)}
{links de contacto: web, IG, email, tel}
<Button>Actualizar información</Button>
```
- Mantener tokens visuales actuales (`#18253f`, `#54b678`, `font-display`).
- Cambiar label "Mercados que organiza:" → "MERCADOS".

### 4. Admin (`src/routes/_admin/admin.producers.tsx`)
- Añadir input "Nombre de contacto" en el sheet de edición/creación, mapeado a `contacto`.
- Sin cambios en flujo de logo ni vínculos de mercados.

### 5. (No incluido)
- Popup `UpdateProducerDialog` no cambia (sigue enviando `producer_name` + mercados; el admin actualiza el campo `contacto` manualmente al procesar la solicitud).

## Verificación

- Build pasa con tipos regenerados.
- En `/productores`: las tarjetas muestran el nombre del productor como título (no el del mercado) y los mercados como pills entre región y contacto.
- En `/admin/producers`: se puede editar `contacto` y se persiste.
