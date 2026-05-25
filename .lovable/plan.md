## Plan

### Objetivo
1. Eliminar la regla que obliga a proveer al menos un medio de contacto (teléfono, email o Instagram) en el formulario público de envío.
2. Renombrar el campo visible "Instagram" a "Perfil de redes sociales" en todos los formularios y vistas.

### Cambios

1. **Backend — Validación del envío**
   - Archivo: `src/lib/submissions.functions.ts`
   - Quitar el `.refine()` del `SubmissionInputSchema` que exige `organizer_phone || organizer_email || organizer_instagram`.
   - Con esto, teléfono, email e Instagram pasan a ser 100 % opcionales (solo `organizer_name` permanece requerido).

2. **Formulario público — `/enviar`**
   - Archivo: `src/components/rutamercado/SubmitMarketForm.tsx`
   - Quitar el texto informativo "Provee al menos un medio de contacto".
   - Cambiar el label del campo de "Instagram" a "Perfil de redes sociales".
   - Eliminar el bloque de error condicional `contactError` que ya no tiene sentido.

3. **Formulario admin — Mercado**
   - Archivo: `src/components/admin/MarketFormDrawer.tsx`
   - Cambiar el label del campo de "Instagram" a "Perfil de redes sociales".

4. **Detalle del mercado — Público**
   - Archivo: `src/components/rutamercado/MarketDetailDialog.tsx`
   - Cambiar el texto del botón de contacto de "Instagram" a "Redes".

5. **Revisión de envíos — Admin**
   - Archivo: `src/components/admin/SubmissionReviewDrawer.tsx`
   - Cambiar el label del mini-campo de "Instagram" a "Redes sociales".

### Notas
- No se toca la base de datos; el campo `organizer_instagram` sigue existiendo con el mismo nombre interno, solo cambia el texto visible.
- No se modifica el esquema Zod de `admin-markets.functions.ts` porque el admin ya no tenía la regla de contacto obligatoria.