## Resumen

La eliminación de mercados ya existe en `/admin/markets`, pero el dialog no usa los textos pedidos, el botón no muestra loading y al borrar no se refrescan dashboard/analytics. Las foreign keys de `market_clicks`, `market_exceptions` y `market_date_overrides` ya tienen `ON DELETE CASCADE` hacia `markets.id` (verificado en la base de datos), así que el `DELETE` actual en `deleteMarket` ya limpia automáticamente todos los datos relacionados — no hace falta migración ni cambios en el servidor.

El trabajo es solo de frontend en `src/routes/_admin/admin.markets.tsx`.

## Cambios

### `src/routes/_admin/admin.markets.tsx`

1. **AlertDialog de confirmación** — actualizar textos y estilos:
   - Título: `¿Eliminar este mercado?`
   - Descripción: `Se eliminará "{nombre}" y TODOS sus datos asociados: vistas, clics, excepciones y cambios de fecha. Esta acción no se puede deshacer.`
   - Botón cancelar: queda como `AlertDialogCancel` (outline gris por defecto).
   - Botón confirmar: texto `Eliminar permanentemente`, fondo `bg-[#DC2626] hover:bg-[#DC2626]/90 text-white`.

2. **Loading + doble-submit**:
   - Mientras `remove.isPending`, el botón confirmar muestra `<Loader2 className="animate-spin" />` + "Eliminando…" y queda `disabled`.
   - Pasar `disabled={remove.isPending}` también a Cancelar y bloquear el cierre del dialog (`onOpenChange={(o) => { if (!remove.isPending && !o) setConfirmDelete(null); }}`).

3. **Toasts**:
   - Éxito (`onSuccess`): `toast.success("Mercado eliminado correctamente junto con todos sus datos asociados")` (reemplaza el actual "Mercado eliminado").
   - Error (`onError`): `toast.error("Error al eliminar el mercado. Intenta de nuevo.")` (reemplaza el `e.message` genérico).

4. **Invalidación de caches** en `onSuccess` del mutation `remove`:
   - `["admin", "markets"]` (ya existe)
   - `["markets"]` (ya existe, usado por el directorio público)
   - `["admin", "dashboard"]` (prefijo — invalida metrics, views, clicks, upcoming)
   - `["admin", "analytics"]` (prefijo — invalida overview, topMarkets, topOrg, dist, traffic)

   React Query invalida por prefijo automáticamente con `queryKey: ["admin", "dashboard"]`.

## Lo que NO cambia

- `deleteMarket` en `src/lib/admin-markets.functions.ts` (ya hace `DELETE FROM markets WHERE id=...`, el CASCADE limpia el resto).
- Esquema de base de datos (las FK ya tienen `ON DELETE CASCADE`).
- Diseño/estructura del resto del admin, directorio público, flujo de crear/editar.
- No se introduce soft-delete ni papelera.

## Verificación

- Eliminar un mercado con clics y vistas → confirmar que desaparece de `/admin/markets`, que las métricas en `/admin/dashboard` bajan, y que ya no aparece en Top Mercados de `/admin/analytics`.
- Verificar que `market_clicks`, `market_exceptions`, `market_date_overrides` ya no tienen filas con ese `market_id` (vía `psql`).
