## Favoritos sin cuenta (localStorage)

Agregar sistema de favoritos que persiste en `localStorage`, con corazón en cada tarjeta, contador en el header y drawer lateral con los mercados guardados.

### 1. Hook `useFavorites` (nuevo `src/hooks/use-favorites.tsx`)

- Store singleton en memoria + suscripción tipo pub/sub para que todos los componentes se re-rendericen al cambiar.
- API: `{ favorites: string[], isFavorite(id), toggle(id), remove(id), count }`.
- Persistencia:
  - Key: `rutamercado_favorites`, valor `string[]`.
  - Lectura en `useEffect` (post-mount) para evitar mismatch SSR.
  - `try/catch` en cada acceso; si falla (incógnito/lleno), sigue funcionando en memoria durante la sesión.
  - Ignorar JSON corrupto → array vacío.
- Escucha `storage` event para sincronizar entre pestañas.

### 2. Botón corazón en `MarketCard.tsx`

- Nuevo `<FavoriteButton marketId={market.id} />` posicionado `absolute top-3 right-3` sobre la imagen.
- 36×36px, `bg-white/70 backdrop-blur-sm`, `rounded-full`, sombra suave.
- Ícono `Heart` de lucide-react: `fill="#EF4444" stroke="#EF4444"` cuando favorito, outline cuando no.
- Al click: `e.stopPropagation()` + `e.preventDefault()` para no abrir el detalle, `toggle(id)`, animación `scale` (~300ms) con estado local.
- `aria-pressed`, `aria-label="Guardar en favoritos" / "Quitar de favoritos"`.
- Se coloca junto a los badges HOY/MAÑANA existentes (mismo bloque `absolute`, alineado a la derecha, sin solaparse — badge queda a la izquierda del corazón).

### 3. Contador y trigger en `Header.tsx`

- Nuevo botón `<FavoritesTrigger />` con ícono `Heart` + número si `count > 0`.
- Visible tanto en desktop (junto a "Enviar mi Mercado") como en mobile (a la izquierda del botón menú hamburguesa, fuera del `Sheet`).
- Abre el drawer de favoritos (estado controlado, izado a `Header` o vía contexto simple).
- `aria-label="Favoritos ({count})"`.

### 4. Drawer `FavoritesDrawer.tsx` (nuevo)

- Usa `Sheet` de shadcn (`side="right"`, `w-full sm:w-[400px]`), mismo patrón que el menú mobile — ya trae foco atrapado, cerrar con X/Esc/click-fuera, animación slide+fade.
- Header: "Tus mercados guardados" + `{count}` mercados.
- Lee `listMarkets` desde React Query cache (`useQuery(marketsQueryOptions)`), filtra por IDs favoritos preservando el orden en que se guardaron.
- IDs que ya no existen en el fetch → se ignoran silenciosamente (no crash, no auto-limpiar por ahora).
- Estado vacío: emoji ❤️ + texto + botón "Explorar mercados" que cierra el drawer.
- Cada fila:
  - `MarketImage` 48×48 `rounded-lg`.
  - Nombre, `formatDateEs(nextDate)`, municipio.
  - Botón X (`aria-label="Quitar"`) → `remove(id)`.
  - Click en la fila → cierra drawer + navega a `/?market={id}` (abre el `MarketDetailDialog` existente vía search param) y hace `scrollIntoView` si la card está visible.

### 5. Integración

- Compartir estado open/close del drawer entre `Header` y su trigger vía prop drilling local (el `Header` gestiona ambos).
- `queryOptions` de mercados ya está en `src/routes/index.tsx`; extraer a `src/lib/markets-query.ts` para que el drawer lo importe sin ciclos.

### Fuera de alcance

- No se sincroniza con backend ni cuentas.
- No se limpian automáticamente IDs de mercados eliminados (simplemente no se muestran).
- No se agrega el botón corazón en el `MarketDetailDialog` (solo en tarjetas); se puede añadir después si lo pides.

### Archivos

- Nuevos: `src/hooks/use-favorites.tsx`, `src/components/rutamercado/FavoriteButton.tsx`, `src/components/rutamercado/FavoritesDrawer.tsx`, `src/components/rutamercado/FavoritesTrigger.tsx`, `src/lib/markets-query.ts`.
- Editados: `src/components/rutamercado/MarketCard.tsx`, `src/components/rutamercado/Header.tsx`, `src/routes/index.tsx` (importar el `queryOptions` desde el nuevo módulo).
