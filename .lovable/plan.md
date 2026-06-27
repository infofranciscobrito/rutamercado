## Objetivo
Añadir un campo **Tipo de mercado** (multi-select) tanto en el formulario público de registro como en el formulario de edición del admin. Los valores se cargan dinámicamente desde la base de datos y se guardan en la columna existente `productores.tipo_mercado` como string separado por coma.

## 1. Server function pública: listar tipos de mercado dinámicamente
En `src/lib/producers.functions.ts`, añadir:

```ts
export const listMarketTypes = createServerFn({ method: "GET" }).handler(async () => {
  // Cliente publishable (mismo patrón que listProducerRegions)
  const { data, error } = await supabasePublic
    .from("markets")
    .select("category")
    .eq("status", "approved")
    .not("category", "is", null);
  if (error) throw new Error(error.message);
  const set = new Set<string>();
  (data ?? []).forEach((r) => { if (r.category) set.add(r.category); });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
});
```

Devuelve los tipos de mercado distintos ya existentes en la tabla `markets`. No se crean valores nuevos.

## 2. Componente multi-select reusable
Crear `src/components/productores/TipoMercadoMultiSelect.tsx`:

- Trigger tipo `Select` (Popover + Button con estilos shadcn equivalentes al `SelectTrigger` actual) que muestra:
  - "Selecciona uno o más tipos" si está vacío
  - chips/badges con cada tipo seleccionado
- Contenido: lista de checkboxes con los tipos cargados desde `listMarketTypes`
- Props: `value: string` (CSV), `onChange: (csv: string) => void`, `id`
- Internamente parsea por coma → `string[]`, al cambiar emite CSV (`"a, b"`).
- Atributos anti-autofill (`autoComplete="off"`, `data-lpignore="true"`, `data-form-type="other"`) en el botón/inputs ocultos.

## 3. Formulario público — `RegisterProducerDialog.tsx`
- Añadir estado `const [tipoMercado, setTipoMercado] = useState("")`.
- Insertar el componente **debajo de Región y encima de Pueblo** con label "Tipo de mercado".
- Incluir `tipoMercado` en `reset()`.
- Enviar `tipo_mercado: tipoMercado || null` en el payload de `submitFn`.

### `src/lib/producer-registration.functions.ts`
- Añadir `tipo_mercado: optText(500)` al `RegisterSchema`.
- Persistirlo en el `insert` de `productores`.
- Incluirlo en el email de notificación de Resend.

*(El campo existente "¿Qué tipo de mercado organizas?" que escribe en `productor_mercados` queda intacto — gestiona la lista de mercados del productor, no el campo `tipo_mercado`.)*

## 4. Formulario admin — `src/routes/_admin/admin.producers.tsx`
- Añadir `tipo_mercado: string | null` a `AdminProducer` y a `UpsertVars`.
- En `EditForm`: `const [tipoMercado, setTipoMercado] = useState(initial.tipo_mercado ?? "")` (preselecciona los valores guardados).
- Renderizar `TipoMercadoMultiSelect` debajo del campo Región (o cerca del bloque región/pueblo) con label "Tipo de mercado".
- Incluirlo en el payload de `onSubmit`.

### `src/lib/admin-producers.functions.ts`
- Añadir `tipo_mercado: optText(500)` en `UpsertSchema`.
- Incluirlo en el `select` de `adminListProducers` y en el mapeo del retorno.
- Persistirlo en el `payload` de `adminUpsertProducer`.

## 5. Fuera de alcance (no se toca)
- Visualización de tarjetas públicas en `/productores` (ya muestra `tipo_mercado` como tags).
- Estilos visuales del sitio.
- Esquema de Supabase (la columna `tipo_mercado` ya existe).
- El campo existente del formulario público que escribe en `productor_mercados`.
