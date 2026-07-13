# Servicios e instalaciones en `/enviar`

Nueva sección opcional "Servicios e instalaciones" en el formulario de envío de mercados, con 6 campos que se guardan en la base de datos, se muestran al admin al revisar el envío, y se copian al mercado publicado cuando se aprueba.

## Alcance

- Formulario público `/enviar` (`SubmitMarketForm.tsx`): nueva sección entre "Foto del mercado" y "Contacto del organizador".
- Base de datos: nuevas columnas en `market_submissions` y `markets`.
- Server function `createMarketSubmission`: aceptar y guardar los nuevos campos.
- Aprobación (`approveSubmission`): copiar los campos al mercado publicado.
- Drawer de revisión en admin (`SubmissionReviewDrawer.tsx`): mostrar los valores capturados.

Fuera de alcance (no lo pediste): mostrarlos en el detalle público del mercado, en tarjetas, ni añadir filtros. Tampoco se editan desde el formulario de admin de mercados en esta iteración.

## Nueva sección en el formulario

Orden y tipo de control:

1. **¿Aceptan mascotas?** — radio · `Sí, son bienvenidas` / `Solo en áreas designadas` / `No se permiten mascotas`
2. **¿Hay estacionamiento?** — radio · `Sí, gratuito` / `Sí, de pago` / `Limitado (llega temprano)` / `No hay estacionamiento`
3. **¿Es accesible?** — radio · `Totalmente accesible` / `Parcialmente accesible` / `No es accesible`
4. **Métodos de pago** — checkboxes múltiples · `Efectivo` / `Tarjeta de débito/crédito` / `ATH Móvil` / `PayPal / transferencia`
5. **¿Es familiar?** — radio · `Sí, ideal para familias` / `Parcialmente` / `No es familiar` (tercera opción añadida por paridad — confírmame si prefieres otra)
6. **¿Tiene área de comida?** — radio · `Sí, múltiples opciones` / `Sí, opciones limitadas` / `No tiene`

Todos opcionales: el usuario puede enviar el formulario sin tocar ninguno. Cada campo lleva su emoji junto al label como se especificó.

## Detalles técnicos

**Migración** (agrega columnas a las dos tablas, todas nullable):

```text
market_submissions + markets:
  pets              text
  parking           text
  accessibility     text
  payment_methods   text[]
  family_friendly   text
  food_area         text
```

Sin CHECK constraints (los valores válidos se validan en Zod en el server function, para poder ajustarlos sin migraciones).

**`src/lib/submissions.functions.ts`**
- Ampliar `SubmissionInputSchema` con los 6 campos opcionales (`z.string().max(...).optional()` y `z.array(z.enum([...])).optional()` para `payment_methods`, restringiendo a los valores permitidos).
- Insertar los nuevos campos en `market_submissions`.
- En `approveSubmission`, copiar los 6 campos del `sub` al `insert` en `markets`.

**`src/components/rutamercado/SubmitMarketForm.tsx`**
- Añadir los 6 campos al tipo `FormValues` y a `defaults` (strings vacías; array vacío para `payment_methods`).
- Nueva `<Section title="Servicios e instalaciones">` entre "Foto del mercado" y "Contacto del organizador", con nota "Opcional" arriba.
- Controles: `RadioGroup`/`RadioGroupItem` de shadcn para los 5 radios, `Checkbox` para métodos de pago (controlado vía `Controller` que mantiene un array).
- Mapear valores al payload de `mutation.mutationFn` (enviar `undefined` cuando estén vacíos, array vacío como `undefined`).

**`src/components/admin/SubmissionReviewDrawer.tsx`**
- Añadir un bloque "Servicios e instalaciones" que renderiza los 6 campos cuando tienen valor (omite los vacíos para no ensuciar la vista).

## Archivos afectados

- `supabase/migrations/<timestamp>_market_services.sql` (nuevo)
- `src/lib/submissions.functions.ts` (editar)
- `src/components/rutamercado/SubmitMarketForm.tsx` (editar)
- `src/components/admin/SubmissionReviewDrawer.tsx` (editar)
- `src/integrations/supabase/types.ts` se regenera automáticamente tras aprobar la migración.
