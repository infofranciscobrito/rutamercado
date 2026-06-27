## Plan: Campo Pueblo + Región dinámica en Productores

### Paso 1 — Migración DB
Migración en Supabase:
- `ALTER TABLE productores ADD COLUMN IF NOT EXISTS pueblo text;`
(El campo no existe actualmente — verificado. No se toca ningún otro campo.)

### Paso 2 — Server functions
- En `src/lib/producers.functions.ts`: añadir `pueblo: string | null` al tipo `Producer` y al SELECT. Nueva server fn pública `getProducerRegions()` que devuelve regiones distintas existentes (`SELECT DISTINCT region FROM productores WHERE status='approved' AND region IS NOT NULL`).
- Extender `submitProducerUpdateRequest` para aceptar campo `pueblo` opcional e incluirlo en el email/registro de la solicitud.
- En `src/lib/producer-registration.functions.ts`: añadir `pueblo` al schema Zod (opcional, string), insertarlo en `productores`, incluirlo en el email a admin.
- En `src/lib/admin-producers.functions.ts`: añadir `pueblo` al schema de update y a la query admin.

### Paso 3 — Componente PuebloTagsInput
Nuevo `src/components/productores/PuebloTagsInput.tsx`:
- Input controlado que al escribir coma o Enter convierte el texto en un tag (pill) removible con X.
- Valor expuesto como string CSV (`"Bayamón, Caguas"`). Al cargar valor inicial CSV lo parsea a tags.
- Atributos anti-autofill: `autoComplete="off"`, `data-lpignore="true"`, `data-form-type="other"`.

### Paso 4 — Dropdown de Región dinámico
- En `RegisterProducerDialog.tsx`, `UpdateProducerDialog.tsx` (popup público) y en el form de admin de `admin.producers.tsx`: reemplazar el input de Región por `<Select>` shadcn poblado con `getProducerRegions()` vía `useQuery`. Incluir opción "Otra (escribir)" que muestre un input libre — para no perder flexibilidad ya que el público registra texto libre.
- Debajo del Región, añadir `PuebloTagsInput` con label "Pueblo" y subtítulo "Puedes añadir uno o más pueblos (presiona coma o Enter)". Atributos anti-autofill aplicados.
- En el popup "Actualizar información" el campo Pueblo viaja dentro del mensaje/solicitud (campo dedicado, opcional).

### Paso 5 — Tarjeta pública
En `ProducerCard.tsx`, debajo de la región actual:
```
<MapPin /> Región · Pueblo1, Pueblo2
```
Si no hay pueblo se muestra solo la región (sin cambios visuales). Mismo color y tipografía actuales.

### Paso 6 — Ordenamiento
Confirmado: la agrupación en `productores.tsx` ya es por región y orden alfabético por nombre. No se modifica la lógica de agrupación; el pueblo es solo informativo en la tarjeta.

### Paso 7 — Mensaje de confirmación
En `RegisterProducerDialog.tsx`, al éxito mostrar exactamente:
> "¡Gracias por registrarte! Revisaremos tu información y en 24 horas o menos tu perfil estará visible en el directorio. Muchas gracias por su registro."

Sin botón "Cerrar", sin auto-cierre, sin redirect. El usuario cierra con la X del dialog (la X nativa del `DialogContent` ya está presente).

### Restricciones respetadas
- Verifiqué que `pueblo` no existe (solo 12 columnas actuales sin `pueblo`).
- No se eliminan ni renombran columnas.
- No se altera el estilo visual del sitio.
- No se usa la palabra prohibida.
- Anti-autofill aplicado a todos los campos nuevos.

### Archivos a modificar/crear
- (migración) `productores.pueblo`
- `src/lib/producers.functions.ts`
- `src/lib/producer-registration.functions.ts`
- `src/lib/admin-producers.functions.ts`
- `src/components/productores/PuebloTagsInput.tsx` (nuevo)
- `src/components/productores/RegisterProducerDialog.tsx`
- `src/components/productores/UpdateProducerDialog.tsx`
- `src/components/productores/ProducerCard.tsx`
- `src/routes/_admin/admin.producers.tsx`
