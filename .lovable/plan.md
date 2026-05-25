## Problema

El backend del sistema de recurrencia ya está migrado (BD, server functions, motor de cálculo), pero la **UI nunca se migró**. Los formularios y vistas siguen enviando/leyendo los campos viejos `event_date` y `frequency`, que ya no existen en la BD.

El error que viste:
```
[{ expected: "'unico' | 'semanal' | 'quincenal' | 'mensual_por_dia'",
   path: ["recurrence_type"], message: "Required" },
 { expected: "string", path: ["recurrence_start_date"], message: "Required" }]
```
viene del schema Zod de `createMarketSubmission` rechazando el payload del formulario público.

## Qué arreglar

Voy a migrar las 4 piezas de UI que quedaron rotas y limpiar los tipos legacy:

### 1. `SubmitMarketForm` (`/enviar` — formulario público)
Reemplazar el bloque "Fecha y horario" con el selector de recurrencia:
- Tipo: `Único / Semanal / Quincenal / Mensual por día`
- Día de la semana (condicional para semanal/quincenal/mensual)
- Semana del mes (condicional para mensual)
- Fecha de inicio (siempre) + fecha fin opcional (para recurrentes)
- Hora inicio / fin

Enviar `recurrence_type`, `recurrence_day_of_week`, `recurrence_week_of_month`, `recurrence_start_date`, `recurrence_end_date` en lugar de `event_date` / `frequency`.

### 2. `MarketFormDrawer` (admin — crear/editar mercados)
Mismo selector de recurrencia. Quitar `event_date` / `frequency`, leer/escribir los 5 campos nuevos. El server fn `upsertMarket` ya los acepta.

### 3. `SubmissionReviewDrawer` (admin — revisar envíos)
Mostrar `recurrence_label` (o calcularlo) + `recurrence_start_date` + horario, en vez de `event_date` y `frequency`.

### 4. `MarketDetailDialog` (público — modal de detalle)
Cambiar el `MiniFact` de Fecha para usar la próxima fecha calculada del `EnrichedMarket` (`nextDate`, `nextStartTime`, `nextEndTime`) y el `recurrence_label` en vez de `frequency`. Actualmente recibe `Market`; pasaremos `EnrichedMarket` desde `index.tsx` (que ya los tiene).

### 5. Limpieza de tipos
Quitar `LegacyMarketFields` (`event_date`, `frequency`) de `src/types/market.ts` y la extensión equivalente en `Submission` (`src/lib/submissions.functions.ts`), una vez que ninguna UI los lea.

## No tocar

- La BD ya está bien.
- Los server functions (`createMarketSubmission`, `upsertMarket`, `approveSubmission`) ya están migrados.
- El motor `recurrence.ts` ya está completo.

Resultado: el formulario `/enviar` envía correctamente, el admin puede crear/editar mercados con recurrencia, las submissions se revisan con sus datos correctos, y el detalle público muestra la próxima fecha real + etiqueta de recurrencia.