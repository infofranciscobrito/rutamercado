## Objetivo

Permitir marcar mercados como "Destacado" y que aparezcan primero, con una ficha ligeramente más grande y una insignia, solo en las páginas de categoría (`/mercados-agricolas`, `/bazares`, `/ferias-artesanales`, `/food-market`, `/mercados-mixtos`, `/flea-market`).

## 1. Base de datos

Migración sobre la tabla existente `markets`:
- Nueva columna `destacado boolean not null default false`.
- Ningún otro campo se toca; todos los registros actuales quedan en `false`.

## 2. Panel admin

En `/admin/markets` (tabla), nueva columna "Destacado" con el mismo componente `<Switch>` que ya usa "Activo", con el mismo patrón de guardado inmediato:
- Nueva server function `toggleMarketDestacado` (misma forma que `toggleMarketActive`, con `requireSupabaseAuth`).
- Al cambiar, invalida `["admin","markets"]` y `["markets"]` igual que el toggle actual.
- El campo también se incluye en el formulario de edición solo si hace falta; el toggle de la fila es la vía principal. Sin límite de cantidad y sin expiración.

## 3. Orden

En `CategoryPage` (`src/components/rutamercado/CategoryPage.tsx`), el orden actual es por `nextDate` ascendente. Se antepone el grupo destacado:
- Primero `destacado = true`, ordenados entre sí por `nextDate` (criterio actual, sin cambios).
- Luego el resto, con el mismo criterio.

No se modifica el orden de la homepage ni de otras vistas.

## 4. Ficha destacada (visual)

Se reutiliza `MarketCard` con un prop opcional `featured`; las fichas normales quedan idénticas byte a byte. Cuando `featured`:

- **Insignia**: badge en la esquina superior del área de imagen, con el mismo patrón visual que el badge de categoría existente (`rounded-md`, `px-2.5 py-1`, `text-[11px] font-bold uppercase tracking-wide`, misma sombra), en el verde de marca `#54b678` con texto `#18253f`. Texto "Destacado" con el ícono `Star` de lucide-react (ya en uso en el sitio). Se coloca a la izquierda; si ya hay badge "HOY"/"MAÑANA", el de Destacado se ubica debajo para no solaparse.
- **Tamaño**: sin tocar el grid — padding interno un paso mayor (`px-6 pb-6 pt-5`) y el nombre del mercado un paso arriba en la escala tipográfica ya existente. Esto da ~8–12% de crecimiento y en móvil (1 columna) no altera el ancho.
- **Resalte**: solo un borde de 2px en `#54b678` (no se añade sombra extra), coherente con los bordes verdes que ya usa el sitio.
- Contenido, orden de campos, hover y clic/modal: sin cambios.

## 5. Fuera de alcance

Modal de detalle, formulario de registro, panel de aprobación, footer, homepage y cualquier otra vista quedan intactos. No se introducen colores, fuentes, radios ni sombras nuevos.

## Verificación

Revisión en preview a 1338px y 375px: varios destacados en una misma categoría, sin scroll horizontal ni desalineación, y fichas normales sin cambios visuales.
