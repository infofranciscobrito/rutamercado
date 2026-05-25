
# Eliminación completa de mercados — de TODAS partes

## Estado actual

- `markets.delete` ya tiene FK CASCADE en `market_clicks`, `market_exceptions`, `market_date_overrides` → estos se borran solos en BD.
- **Faltan dos rastros**: la imagen en bucket `market-images` y los registros en `market_submissions` con `published_market_id` apuntando al mercado eliminado.
- El frontend público es una sola página (`/`) con modal — al invalidar `["markets"]` el mercado desaparece de grid, category rows, búsqueda, contador y modal (porque `selected = markets.find(...)` retorna `null`). No hay ruta de detalle, ni sitemap, ni JSON-LD por mercado.
- El admin ya cachea por query keys `["admin","markets"]`, `["admin","dashboard"]`, `["admin","analytics"]`, `["admin","submissions"]`.

## Cambios

### 1. `src/lib/admin-markets.functions.ts` — `deleteMarket` atómico y completo

Reescribir el handler así (mismo nombre/firma, todo server-side con el cliente autenticado del middleware):

1. Cargar el mercado para obtener `image_url`. Si no existe → error.
2. `delete` en `market_submissions` con `eq("published_market_id", id)` (no hay CASCADE; hay que borrar manualmente para que el envío desaparezca de la sección Envíos).
3. `delete` en `markets` con `eq("id", id)` — CASCADE limpia `market_clicks`, `market_exceptions`, `market_date_overrides`.
4. Si `image_url` apunta al bucket `market-images`, extraer el path (`...storage/v1/object/public/market-images/<path>`) y llamar `supabase.storage.from("market-images").remove([path])`. Errores de storage se loguean pero NO revierten — el archivo huérfano es preferible a dejar el mercado a medio borrar; el commit en BD ya ocurrió.
5. Si cualquier paso de BD (2 o 3) falla, lanzar error inmediatamente para que el cliente vea el toast de error. (Postgres no nos da una transacción multi-tabla desde el cliente JS, pero el orden submissions → markets es seguro: si markets falla, las submissions ya borradas no dejan inconsistencia visible al usuario — re-intento es idempotente. Documentar este trade-off con un comentario.)

### 2. `src/routes/_admin/admin.markets.tsx` — texto del dialog e invalidaciones

- Título: `"¿Eliminar este mercado permanentemente?"`
- Descripción: `"Se eliminará "{nombre}" de todas las secciones del sitio — directorio público, panel de administración, envíos, analíticas y estadísticas. También se eliminará su imagen. Esta acción no se puede deshacer."`
- Toast success: `"{nombre} ha sido eliminado completamente del sistema"`
- Toast error: `"Error al eliminar. No se borró nada. Intenta de nuevo."`
- Botón confirmar: `"Eliminar de todo el sistema"` (mantener `bg-[#DC2626]` + spinner)
- Añadir invalidación de `["admin", "submissions"]` en `onSuccess` (las otras claves ya están).

### 3. `src/routes/index.tsx` — manejar URL directa a mercado eliminado

Cuando `search.market` existe pero `markets.find(...)` retorna `undefined`, en `MarketsContent` añadir un `useEffect` que:
- Dispara `toast.info("Este mercado ya no está disponible. Descubre otros mercados en nuestro directorio.")` (importar `sonner`).
- Llama `onClose()` para limpiar `?market=` del URL.

Esto cubre tanto el caso "modal abierto cuando se elimina" (la invalidación de `["markets"]` re-renderiza y `selected` se vuelve null → effect dispara) como "URL/bookmark directo a mercado borrado". El botón "Ver todos los mercados" del enunciado es redundante porque al limpiar el param el usuario YA está en el directorio; un toast informativo cumple el requerimiento sin añadir un estado vacío de página completa.

## Lo que NO cambia

- Esquema de BD (las CASCADE ya existen para clicks/exceptions/overrides).
- Diseño visual del admin o del frontend.
- Flujo de crear/editar mercados.
- `listMarkets`, analytics functions — al re-ejecutarse no encontrarán el mercado y sus métricas/gráficos se recalculan automáticamente.
- No hay sitemap ni rutas públicas por mercado que requieran cambio.

## Verificación

1. Eliminar un mercado con imagen, clicks, excepciones, overrides y un submission asociado.
2. Confirmar en `psql`: 0 filas en `markets`, `market_clicks`, `market_exceptions`, `market_date_overrides`, `market_submissions` para ese `id` / `published_market_id`.
3. Confirmar que el archivo ya no existe en el bucket `market-images`.
4. `/admin/markets`, `/admin/dashboard`, `/admin/analytics`, `/admin/submissions` ya no muestran rastro.
5. Recargar `/` → no aparece en grid/categorías. Visitar `/?market=<id-eliminado>` → toast informativo, URL limpia.
