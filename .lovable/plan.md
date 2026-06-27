## Plan: Reemplazar dropdown de Pueblo por campo de texto libre

### Problema
Actualmente el campo "Pueblo" en el formulario de registro de productores (`/productores`) usa un `<Select>` con las 6 regiones predefinidas (Metro, Norte, Sur, Este, Oeste, Centro). El usuario quiere que las personas escriban el nombre del pueblo libremente (ej: "Ponce", "Mayagüez", "Vieques").

### Cambios necesarios

1. **Frontend — `RegisterProducerDialog.tsx`**
   - Reemplazar el componente `<Select>` de "Pueblo" por un `<Input>` de texto libre.
   - Conservar el label "Pueblo" y la nota "(pueblo del mercado)".
   - Eliminar la importación de `MARKET_REGIONS` si queda sin uso.

2. **Backend — `producer-registration.functions.ts`**
   - La validación Zod actual usa `z.enum(MARKET_REGIONS)`, lo que rechazaría cualquier pueblo real.
   - Cambiar el schema de `region` para aceptar cualquier string (hasta 100 caracteres) o `null`, igual que el admin (`optText(100)`).
   - Esto alinea la validación del registro público con la del panel de administración.

### Impacto
- Los registros públicos ahora aceptarán nombres de pueblo reales de Puerto Rico en lugar de las 6 regiones genéricas.
- Sin cambios en base de datos ni en otros flujos (admin, `/productores` pública) — el campo `region` ya es `text` en la tabla.
- No se modifica el campo "Región/Pueblo" en el panel de administración (ya usa texto libre).

### Notas
- No se modifica la página `/productores` ni el panel de admin salvo por la validación del registro público.
- El `Select` de "¿Qué tipo de mercado organizas?" se mantiene como categoría (no se toca).