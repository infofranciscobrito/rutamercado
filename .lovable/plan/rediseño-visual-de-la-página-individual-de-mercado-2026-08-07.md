# Rediseño visual de la página individual de mercado

Solo cambia la presentación de `/mercados/[slug]`. Los datos, el ruteo, la metadata Open Graph y el JSON-LD de Schema.org se quedan idénticos.

## Tokens reutilizados (ya existentes en el sitio)

- Navy `#18253f`, navy suave `#2d3058`, verde marca `#54b678`, verde hover `#3f9560`, verde profundo `#2f7a4c`
- Fondo `#FAFAF8`, crema `#FFF8EC`, borde `#E5E7EB`, texto secundario `#6B7280`
- Tipografía: `font-display` (DM Serif Display) para nombres de mercado, DM Sans para body
- Radios: `rounded-xl` / `rounded-2xl`; sombra `rm-shadow-warm`
- Badge de categoría: verde `#54b678`, texto navy, mayúsculas, `rounded-md`
- Botón primario: navy con texto blanco; botón secundario: verde con texto navy

## Nueva estructura de la página

1. **Hero en dos columnas** (60/40 en desktop, apilado en móvil)
   - Izquierda: el flyer completo sin recortar (object-contain sobre fondo navy degradado, igual que hoy), esquinas `rounded-2xl`. Funciona con flyers cuadrados, verticales u horizontales.
   - Derecha: tarjeta "boleto de entrada" sticky en desktop, con borde perforado (círculos/dashes) en el lado que mira al flyer. Contiene: badge de categoría, fecha grande, hora, frecuencia si aplica, ubicación con pin, botón "Cómo llegar" y botón "Agregar a mi calendario".

2. **Divisor perforado** una sola vez, entre el hero y el contenido.

3. **Descripción** a ancho de lectura `max-w-[65ch]`, texto sin cambios.

4. **Organizador** igual que hoy (nombre + chips de contacto/redes).

5. **Servicios e instalaciones** convertidos de lista a grid de chips/tarjetas pequeñas con ícono + label.

6. **Otros mercados que te pueden interesar**: 3-4 mercados de la misma categoría o región en fila horizontal, usando la tarjeta compacta existente que ya enlaza a `/mercados/[slug]`.

La sección de intención de asistencia ("¿Piensas ir a este mercado?") se mantiene, ubicada antes de los mercados relacionados.

## Movimiento

- Flyer: fade + escala 0.97 → 1, 500ms ease-out
- Tarjeta de boleto: entrada desde la derecha, 450ms, 100ms de retraso
- Hover de botones: idéntico al resto del sitio
- Todas las animaciones de entrada se desactivan con `prefers-reduced-motion`

## Detalles técnicos

- `src/routes/mercados/$slug.tsx`: se reescribe solo el `component`. El `loader`, `head()` (OG, Twitter, canonical) y el bloque JSON-LD quedan intactos.
- Nuevos componentes en `src/components/rutamercado/`:
  - `MarketTicketCard.tsx` — tarjeta boleto + acciones
  - `TicketPerforation.tsx` — divisor/borde perforado (CSS radial-gradient, sin imágenes)
  - `MarketAmenityChips.tsx` — grid de servicios
  - `RelatedMarkets.tsx` — mercados relacionados
- Descarga de calendario: generación de `.ics` en cliente vía Blob (nuevo helper `src/lib/ics.ts`), usando la próxima fecha, hora, nombre, descripción y dirección ya cargados.
- Mercados relacionados: se obtienen en el `loader` existente con una consulta adicional filtrada por categoría/región, excluyendo el mercado actual (no cambia la metadata).
- `MarketDetailContent.tsx` se conserva para el diálogo de la home; la página usará las nuevas piezas para no afectar el listado ni las páginas de categoría.
- Breakpoints verificados a 375px, 768px y 1440px.

Al terminar, abriré la página de "Mercado en Rio Piedras" para revisión.
