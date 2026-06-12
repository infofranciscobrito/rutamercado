# Agregar "Enlace de contacto" del productor

## 1. Base de datos
Nueva columna `organizer_contact_url` (text, nullable) en la tabla `markets`. También en `market_submissions` para que los formularios públicos puedan enviarla.

## 2. Formulario admin (`MarketFormDrawer.tsx`)
Dentro de la sección "Información del productor", debajo de "Perfil de redes sociales", agregar un nuevo `Field` con label **"Enlace de contacto"**:
- Input tipo texto, bindeado vía `Controller` a `organizer_contact_url`.
- Placeholder: `https://...` (Linktree, WhatsApp, web, etc.).
- Atributos anti-autofill: `autoComplete="off"`, `data-lpignore="true"`, `data-1p-ignore="true"`, `data-form-type="other"`, `readOnly`+`onFocus` para quitar readonly, `name`/`id` neutros (`contact-field-url`).
- Al guardar: si el valor no está vacío y no empieza con `http://` o `https://`, anteponer automáticamente `https://`.
- Validación: si tiene valor, debe ser URL válida (Zod `.url()`); si está vacío se guarda `null`. Campo opcional.

## 3. Formulario público de envío (`SubmitMarketForm.tsx`)
Mismo campo opcional con la misma normalización y atributos anti-autofill, para que nuevos mercados puedan registrarlo desde el inicio.

## 4. Validación servidor
- `admin-markets.functions.ts`: agregar `organizer_contact_url: z.string().trim().url().max(500).nullable().optional()` y mapear en el upsert.
- `submissions.functions.ts`: agregar el mismo campo en el schema de creación y en la promoción de submission a market.

## 5. Vista pública (`MarketDetailDialog.tsx`)
En la tarjeta "Organizador", junto a los botones existentes (Llamar / Email / Redes), agregar **solo si `market.organizer_contact_url` tiene valor**:

```
<a href={market.organizer_contact_url} target="_blank" rel="noopener noreferrer"
   onClick={() => track(market.id, "click_contact")}
   className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#18253f] transition-colors hover:border-[#54b678]">
  Contactar al productor
</a>
```

Mismo estilo que los botones secundarios actuales (Email/Redes): mismo radio, tipografía y paleta. Si la URL está vacía/null, no se renderiza.

## 6. Tipos y tracking
- Después de la migración, los tipos de Supabase se regeneran automáticamente.
- Agregar `"click_contact"` a `ClickType` en `src/types/market.ts` (opcional, para tipado del tracking).

## Notas
- No se modifica diseño general ni otros campos.
- El campo es opcional en todos los puntos.
- En `MarketDetailDialog` no se importa ningún icono nuevo, se mantiene el estilo de los botones secundarios existentes.
