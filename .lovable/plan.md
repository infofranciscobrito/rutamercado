## Objetivo

Que el modal de detalle muestre la imagen del mercado completa (sin recortes), adaptándose a su orientación. Las cards del directorio no se tocan.

## Cambios

### 1. `src/components/rutamercado/MarketImage.tsx`
Añadir una prop opcional `fit?: "cover" | "contain"` (default `"cover"` para no afectar a las cards) y, cuando sea `"contain"`, renderizar `<img>` con `object-contain`, `w-full`, `h-auto`, y detectar orientación con `onLoad` (comparando `naturalWidth` vs `naturalHeight`) para exponerla al padre vía un callback opcional `onOrientation?: (o: "landscape" | "portrait" | "square") => void`. El placeholder (sin `src`) sigue igual.

### 2. `src/components/rutamercado/MarketDetailDialog.tsx`
Reemplazar el contenedor actual de la imagen:

Antes:
```
<div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#FFF8EC]">
  <MarketImage ... />
  <span className="...categoria">...</span>
  <button ...cerrar />
</div>
```

Después:
- Contenedor con `position: relative`, `overflow: hidden`, `rounded-t-none sm:rounded-t-[20px]`, sin `aspect-video`.
- Fondo: `style={{ background: "linear-gradient(135deg, #1c1e37 0%, #2d3058 100%)" }}`.
- Estado local `orientation` (`"landscape" | "portrait" | "square"`, default `"landscape"`).
- Altura máxima del contenedor según orientación, con override mobile:
  - mobile (`max-h-[50vh]`)
  - `sm:` desktop: `landscape` → `max-h-[400px]`, `portrait` → `max-h-[500px]`, `square` → `max-h-[450px]`.
- Imagen renderizada con `<MarketImage fit="contain" onOrientation={setOrientation} />`, que internamente aplica `w-full h-auto max-h-full object-contain mx-auto block`.
- Mantener los overlays existentes (badge de categoría arriba-izquierda, botón cerrar arriba-derecha) con `position: absolute`.

Resetear `orientation` cuando cambia `market` (en el `useEffect` ya existente sobre `[open, market]`, o uno nuevo) para evitar que la altura previa quede aplicada al abrir otro mercado.

### 3. No tocar
- `MarketCard.tsx`, `CategoryRow.tsx`, `MarketGrid.tsx` ni ningún otro consumidor de `MarketImage` (siguen con el default `cover` 16:9).
- Resto del contenido del modal, animaciones ni overlay del Dialog.

## Resultado
- Landscape: imagen completa, hasta 400px de alto, fondo de marca a los lados si sobra ancho.
- Portrait: imagen completa, hasta 500px de alto, centrada horizontalmente con gradiente a los lados.
- Square: hasta 450px.
- Mobile: como mucho 50vh para dejar ver el contenido debajo.
- Las cards del directorio quedan intactas.
