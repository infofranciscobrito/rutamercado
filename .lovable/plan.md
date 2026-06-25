## Problema

En `src/lib/admin-producers.functions.ts`, el `EditSchema` valida los campos de contacto con un helper (`optStr`) que **no acepta `null`**. El formulario en `src/routes/_admin/admin.producers.tsx` envía `null` cuando un campo está vacío (línea 294: `phone.trim() || null`), por eso Zod lanza:

- `Expected string, received null` (para `organizer_phone`, `organizer_instagram`)
- `Invalid literal value, expected ''` (la rama `.or(z.literal(""))` tampoco coincide con `null`)

Los campos `organizer_email`, `organizer_contact_url` y `organizer_logo_url` sí tienen `.nullable()`, pero la combinación con `.or(z.literal("").transform(...))` es frágil y conviene normalizarla.

## Cambio

Reescribir los helpers de validación en `src/lib/admin-producers.functions.ts` para que **todos los campos de contacto opcionales** acepten `string`, `""` o `null` y siempre normalicen a `string | null`:

```ts
// Texto opcional: acepta string, "", null, undefined -> string | null
const optText = (max: number) =>
  z.preprocess(
    (v) => (v == null ? null : typeof v === "string" ? v.trim() : v),
    z.union([z.string().max(max), z.null()]).transform((v) => (v && v.length > 0 ? v : null)),
  );

// Email opcional: acepta email válido, "", null -> string | null
const optEmail = z.preprocess(
  (v) => (v == null || v === "" ? null : typeof v === "string" ? v.trim() : v),
  z.union([z.string().email().max(255), z.null()]),
);

// URL opcional: acepta URL válida, "", null -> string | null
const optUrl = (max: number) =>
  z.preprocess(
    (v) => (v == null || v === "" ? null : typeof v === "string" ? v.trim() : v),
    z.union([z.string().url().max(max), z.null()]),
  );
```

Aplicar al `EditSchema`:

- `organizer_phone: optText(500)`
- `organizer_instagram: optText(500)`
- `organizer_email: optEmail`
- `organizer_contact_url: optUrl(500)`
- `organizer_logo_url: optUrl(1000)`

No se cambia nada del componente cliente ni la lógica de subida a Storage; el upload del logo ya ocurre antes de invocar la server function y solo se envía la URL pública, así que al desbloquear la validación el guardado y la subida funcionan correctamente.

## Verificación

1. Editar un productor dejando `organizer_phone` vacío → guarda sin error.
2. Editar con `organizer_email` vacío y con un email válido → ambos casos guardan.
3. Subir un logo nuevo (≤5MB, JPG/PNG) → se sube a `market-images` y la URL persiste en todos los mercados del productor.