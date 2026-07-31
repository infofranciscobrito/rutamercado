## Objetivo

Añadir una nueva categoría de negocio: **Mascotas/Productos**, disponible en el formulario de registro, en los filtros de `/negocios` y en el panel de administración.

## Qué cambia

- Se agrega la opción a la lista de categorías de negocios, colocada antes de "Otro" (que siempre queda al final).
- Aparece automáticamente en:
  - El formulario "Registra tu Negocio" (selector de categoría).
  - El filtro de categorías de la página pública `/negocios`.
  - Los filtros, tarjetas y exportación CSV del panel admin de negocios.
  - Las métricas del dashboard de analítica de negocios.

## Detalle técnico

- `src/lib/emprendedores.functions.ts`: añadir `"Mascotas/Productos"` a la constante `EMPRENDEDOR_CATEGORIES`. Esa constante alimenta tanto el enum de validación Zod del registro como todos los selectores/filtros de la UI, así que no hace falta tocar cada componente.
- No se requiere migración de base de datos: `emprendedores.categoria_producto` es una columna de tipo texto, no un enum de Postgres.
- La lógica condicional existente (campo libre para "Otro", pregunta de artesano certificado para "Artesanías") no se ve afectada.

## Verificación

- Typecheck del proyecto.
- Revisar que la nueva categoría aparezca en el selector del formulario y en el dropdown de filtros de `/negocios`.
