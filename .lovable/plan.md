# Focal point para imágenes de mercados

Nota: en este proyecto los "eventos" son `markets`. Aplico el cambio sobre esa tabla.

## 1. Base de datos (migración)

Agregar dos columnas a `public.markets`:

- `focal_x` — `real`, nullable, default `50`, con `CHECK (focal_x BETWEEN 0 AND 100)`
- `focal_y` — `real`, nullable, default `50`, con `CHECK (focal_y BETWEEN 0 AND 100)`

Los mercados existentes quedan automáticamente en `50/50` (centro), o sea sin cambio visual.

No se tocan permisos ni RLS (las políticas actuales ya cubren las columnas nuevas).

## 2. Componente nuevo: `FocalPointSelector`

Archivo: `src/components/admin/FocalPointSelector.tsx`.

Props:

```
{ src: string; valueX: number; valueY: number;
  onChange: (x: number, y: number) => void; disabled?: boolean }
```

Comportamiento:

- Muestra la imagen completa (`object-contain`) dentro de un contenedor 16:9 con fondo oscuro semitransparente encima (overlay).
- En hover, una mira/círculo blanco con borde amarillo sigue al cursor sobre la imagen.
- Al hacer clic o arrastrar, el indicador se fija en esa posición y llama `onChange(x, y)` con porcentajes 0–100 calculados desde `getBoundingClientRect()`. Soporta mouse y touch.
- Indicador persistente en `valueX/valueY` cuando no hay hover activo.
- Etiqueta arriba: "Arrastra o haz clic para elegir el área de preview".
- A la derecha (o debajo en mobile) un **mini-preview** 16:9 (~200px) que usa la misma imagen con `object-fit: cover` y `object-position: ${x}% ${y}%`, mostrando exactamente cómo se verá en el card.
- Botón pequeño "Centrar" para resetear a 50/50.

Es puramente UI: no sube archivos, no toca Supabase Storage; solo emite coordenadas.

## 3. Integración en el formulario admin

Archivo: `src/components/admin/MarketFormDrawer.tsx`.

- Añadir `focal_x: number` y `focal_y: number` al tipo `FormValues`, defaults `50/50`, e incluirlos en `marketToForm`.
- Justo después del bloque de "Imagen del mercado", cuando `imageUrl` no está vacío, renderizar `<FocalPointSelector />` enlazado a `focal_x`/`focal_y` vía `Controller` o `setValue`.
- Si el usuario cambia la imagen (nuevo upload o pega otra URL), resetear `focal_x/focal_y` a 50/50.
- Enviar `focal_x` y `focal_y` en el payload de `upsertMarket`.

## 4. Server function

Archivo: `src/lib/admin-markets.functions.ts`.

- Extender `MarketInputSchema` con `focal_x: z.number().min(0).max(100).default(50)` y `focal_y` igual.
- Incluir ambos campos en el `payload` de `upsertMarket` (insert y update).

No se toca el flujo público de `submissions` (fuera de scope).

## 5. Card de listado

Archivos: `src/components/rutamercado/MarketCard.tsx` y `src/components/rutamercado/MarketImage.tsx`.

- `MarketImage` recibe un prop opcional `objectPosition?: string` y lo aplica en el `style` del `<img>` cuando `fit === "cover"` (default `"50% 50%"`).
- `MarketCard` pasa `objectPosition={\`${market.focal_x ?? 50}% ${market.focal_y ?? 50}%\`}` a `<MarketImage>`.

El tipo `Market` viene de `Database["public"]["Tables"]["markets"]["Row"]`, así que tras la migración los nuevos campos aparecen automáticamente en `types.ts` (regenerado).

## 6. Detalle del mercado

`MarketDetailDialog` ya usa `MarketImage` con `fit="contain"`, que no aplica `object-position` ni recorta — la imagen original se sigue mostrando completa, sin cambios. No se modifica.

## Fuera de scope

- Formulario público `SubmitMarketForm` (el usuario pidió "admin edits or creates").
- Cualquier reprocesado o recorte real del archivo en storage — el original queda intacto, el "recorte" es puramente visual vía CSS.
