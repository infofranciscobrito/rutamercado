# Corregir enlaces internos rotos del footer

## Qué cambia

En la sección "Explorar" del footer, actualizar los 4 enlaces para que apunten a las rutas reales de categoría:

- Mercados Agrícolas: `/mercado-agricola` → `/mercados-agricolas`
- Bazares: `/bazar-pop-up` → `/bazares`
- Ferias Artesanales: `/feria-artesanal` → `/ferias-artesanales`
- Mercados Mixtos: `/mercado-mixto` → `/mercados-mixtos`

Nada más del footer ni del diseño se toca.

## Resultado de la revisión del resto del sitio

Búsqueda en todo el código por esas 4 rutas viejas: los únicos enlaces de navegación que las usan están en el footer. El resto de coincidencias no son enlaces rotos y se quedan igual:

- `src/routes/mercado-agricola.tsx`, `bazar-pop-up.tsx`, `feria-artesanal.tsx`, `mercado-mixto.tsx`: rutas que solo hacen redirección 301 a las nuevas (se mantienen para no romper enlaces externos ya indexados).
- `src/lib/category-pages.ts`: tabla de equivalencias que alimenta esas redirecciones.

El header, los botones y las demás secciones ya apuntan a las rutas nuevas.

## Detalle técnico

Un único archivo editado: `src/components/rutamercado/Footer.tsx`, líneas 67, 72, 77 y 82 — solo el valor de `to` en cada `<Link>`.
