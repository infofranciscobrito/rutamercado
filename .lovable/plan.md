## Cambios

### 1. Renombrar "Envíos" → "Solicitudes de Mercados"

- `src/components/admin/AdminSidebar.tsx` — cambiar `label: "Envíos"` por `"Solicitudes de Mercados"` en el item del menú.
- `src/routes/_admin/admin.submissions.tsx` — cambiar el `<h1>` de "Envíos" a "Solicitudes de Mercados". (La URL `/admin/submissions` se mantiene para no romper enlaces; no hay breadcrumbs en el admin.)

### 2. Botón "Borrar Solicitud" en el panel de aprobación

**Backend — `src/lib/submissions.functions.ts`:**
- Agregar nueva server function `deleteSubmission` (POST, `requireSupabaseAuth`) que valida `{ id: uuid }` y ejecuta `delete` sobre `market_submissions` por id. Las RLS ya permiten DELETE solo a admins, y el borrado de una solicitud no afecta la tabla `markets` (no hay FK), así que mercados ya publicados quedan intactos.

**UI — `src/components/admin/SubmissionReviewDrawer.tsx`:**
- Importar `AlertDialog` (y subcomponentes) de `@/components/ui/alert-dialog`, y la nueva `deleteSubmission`.
- Agregar `useMutation` para borrar, que invalida `["admin","submissions"]` y `["admin","submissions","pending-count"]`, muestra toast `"Solicitud eliminada correctamente"` y cierra el drawer.
- Agregar un tercer botón "Borrar Solicitud" con fondo `#DC2626` / texto blanco / hover más oscuro, junto a Aprobar y Rechazar (mismo contenedor flex; se mostrará también para solicitudes ya revisadas para permitir limpieza).
- Al hacer click, abrir `AlertDialog`:
  - Título: "¿Borrar esta solicitud?"
  - Descripción: `Esta acción eliminará permanentemente la solicitud de ${submission.name}. No se puede deshacer.`
  - Cancel: variante outline.
  - Action: fondo `#DC2626`, texto blanco → ejecuta la mutación.

### Notas técnicas

- No se necesita migración: las políticas RLS de `market_submissions` ya incluyen `Admins can delete submissions`.
- El delete es independiente de `markets`: aprobar copia datos a `markets` y guarda `published_market_id`, pero no hay FK, así que borrar la solicitud no toca el mercado publicado.
