Cambio visual puntual en `src/components/rutamercado/MarketCard.tsx`:

1. Eliminar el `<span>` de categoría (líneas 33-35) que está posicionado de forma absoluta sobre la imagen (`absolute left-3 top-3`).
2. Insertar ese mismo `<span>` (mismas clases y estilos) dentro de la sección de información, justo debajo del bloque de ubicación (después de la línea con `<MapPin>` y `{market.municipality}, {market.region}`).

No se modifica ningún otro elemento, clase, tipografía o diseño del badge.