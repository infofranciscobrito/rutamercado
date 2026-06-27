## Contexto
El usuario quiere mostrar el campo `tipo_mercado` en las tarjetas de productores de la página `/productores`. Sin embargo, el campo **no existe actualmente** en la tabla `productores` según `information_schema.columns`.

## Plan

### Paso 1 — Migración de base de datos
- Añadir columna `tipo_mercado` (tipo `text`, nullable) a la tabla `productores`.
- No requiere cambios de RLS ni de formularios; solo es un campo de visualización.

### Paso 2 — Actualizar tipos y consulta
- Actualizar el tipo `Producer` en `src/lib/producers.functions.ts` para incluir `tipo_mercado: string | null`.
- Incluir `tipo_mercado` en el `select` de la función `listProducers`.
- Parsear el valor en el mapeo: si contiene comas, dividir en array; si está vacío, dejar como array vacío.

### Paso 3 — Renderizar tags en ProducerCard
- En `src/components/productores/ProducerCard.tsx`, añadir una sección de tags justo debajo del nombre del productor y encima de la región.
- Usar el mismo estilo visual de los mercados: `Badge` con borde verde (`border-[#54b678]/40`), texto verde (`text-[#54b678]`), fondo con opacidad baja (`bg-[#54b678]/15`).
- Si `tipo_mercado` está vacío o es `null`, no renderizar nada.

### Paso 4 — Verificación
- Confirmar en el preview que las tarjetas muestran los tags correctamente y que no hay errores de build.

## Alcance limitado (según instrucciones del usuario)
- **No** se modifica el formulario de registro (`RegisterProducerDialog`).
- **No** se modifica el panel de administración (`admin.producers.tsx`).
- Solo se toca la visualización pública de las tarjetas en `/productores`.