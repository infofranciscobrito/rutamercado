Cambios solo de UI en `src/components/productores/RegisterProducerDialog.tsx` (modal "Registro de productores" en `/productores`). No se modifica el esquema ni la lógica del servidor.

## Cambios

1. **Campo "Página web"** → renombrar el label a **"Página de redes sociales"**. Se mantiene el input tipo `url`, el placeholder `https://...` y el envío al campo `website` del servidor sin cambios.

2. **Campo "Región"** → renombrar el label a **"Pueblo"** y añadir debajo del label una nota pequeña en gris: *"(pueblo del mercado)"*. Se conserva el `<Select>` con las mismas opciones actuales (MARKET_REGIONS: Metro, Norte, Sur, Este, Oeste, Centro) y se sigue guardando en `region`. Si más adelante quieres reemplazar las regiones por pueblos reales de PR, será otra tarea (requiere migración).

3. **Campo "Nombre del productor o entidad"** → renombrar el label a **"Nombre del Mercado"**. Sigue siendo obligatorio y se envía como `nombre`.

4. **Campo "¿Qué mercados organizas?"** →
   - Reemplazar el `<Input>` por un `<Select>` (dropdown).
   - Opciones = `MARKET_CATEGORIES` de `src/types/market.ts`: Mercado Agrícola, Bazaar/Pop Up, Feria Artesanal, Food Market, Mercado Mixto, Flea Market.
   - Eliminar el texto de ayuda "(separa con comas si organizas más de uno)".
   - El valor seleccionado se sigue enviando en el campo `mercados` del payload (string simple), por lo que la lógica de servidor que hace `split(",")` continúa funcionando sin cambios.

## Notas

- Cambios localizados a un solo archivo de presentación.
- No se tocan rutas, funciones de servidor, validaciones Zod ni base de datos.
- El admin (`/admin/producers`) no cambia en esta tarea.