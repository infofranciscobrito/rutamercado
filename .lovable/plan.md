## Diagnóstico

Revisé la tabla `productores` en Supabase: existe **un solo** campo de tipo de mercado, `tipo_mercado` (text). No hay columna duplicada, así que no se requiere migración ni borrado de datos en Supabase.

El campo redundante vive solo en el **formulario público de registro** (`RegisterProducerDialog.tsx`), bajo el label **"¿Qué tipo de mercado organizas?"**. Internamente usa el estado `mercados` (un `Select` con `MARKET_CATEGORIES`) y se envía a `registerProducer`, que lo inserta como una fila en la tabla `productor_mercados` (lista de mercados vinculados al productor). Esto duplica la información que ya cubre el multi-select **"Tipo de mercado"** añadido recientemente.

En el **dashboard admin** (`admin.producers.tsx`) **no existe** el campo "¿Qué tipo de mercado organizas?". Lo que ahí se llama `mercados` es la lista de mercados específicos vinculados al productor (gestionada vía `productor_mercados` con nombre libre, no categoría) — es una funcionalidad distinta y la dejo intacta.

## Cambios

### 1. `src/components/productores/RegisterProducerDialog.tsx`
- Eliminar el bloque JSX del `Select` "¿Qué tipo de mercado organizas?".
- Eliminar el estado `mercados`, su `setMercados`, el reset y dejar de enviarlo en `submitFn`.
- Eliminar el import no usado `MARKET_CATEGORIES`.

### 2. `src/lib/producer-registration.functions.ts`
- Quitar `mercados` del `RegisterSchema`.
- Quitar el bloque que parsea `mercadosList` e inserta en `productor_mercados`.
- Quitar la línea `Mercados: ...` del email de notificación (se mantiene `Tipo(s) de mercado:` que sí refleja `tipo_mercado`).

### 3. Sin cambios
- `admin.producers.tsx` y `admin-producers.functions.ts`: el campo "Tipo de mercado" (multi-select sobre `tipo_mercado`) ya es el único para esta información; la sección "Mercados vinculados" es otra cosa y se conserva.
- `ProducerCard.tsx`: no se toca la visualización pública.
- Base de datos: sin migración, sin borrado de datos.

## Resultado
Tanto en el registro público como en la edición admin, la única fuente para "tipo de mercado" es el multi-select **"Tipo de mercado"** que escribe en `productores.tipo_mercado`.