# Arreglar el KPI "Vistas del directorio" (marca 0)

## Diagnóstico (verificado)

Ambos números salen de la misma tabla de vistas de página, pero filtran distinto:

- **KPI "Vistas del directorio"**: cuenta solo las filas cuya página es exactamente `home`.
- **"Actividad por Página"**: agrupa todas las filas por su valor de página, sin filtro.

El frontend nunca registra `home`. La home guarda la página como `/` y las páginas de categoría guardan claves como `category_bazar_popup`. Los datos actuales lo confirman:

```text
/                          1831
category_mercado_mixto      154
category_bazar_popup        120
category_mercado_agricola    45
category_feria_artesanal     18
category_food_market          3
category_flea_market          1
home                          0  (no existe)
```

Es decir: el registro funciona bien; lo roto es la consulta del KPI, que busca un nombre de evento que nunca se inserta.

## Corrección

1. Quitar el filtro por `home` en el cálculo del KPI y contar las vistas de la home usando exactamente el mismo criterio que "Actividad por Página" usa para la fila `/`. Una sola fuente, mismo rango de fechas, sin consultas duplicadas con criterios distintos.
2. Añadir además el total de vistas del sitio (suma de todas las páginas) para que la tarjeta cuadre con la tabla de actividad de un vistazo, mostrando la home como valor principal.
3. No se crean tablas ni columnas nuevas; se usan las existentes.

## Detalles técnicos

- `src/lib/admin-analytics.functions.ts` → `getAnalyticsOverview`: reemplazar la consulta `page_views ... .eq("page", "home")` por una lectura de `page_views(page)` en el rango, y derivar de esas filas `homeViews` (filas con `page = '/'`) y `totalPageViews` (todas). Esto elimina la desincronización de raíz porque el KPI y `getPageActivity` leen el mismo conjunto.
- `src/routes/_admin/admin.analytics.tsx`: la tarjeta "Vistas del directorio" sigue mostrando `homeViews`; se le añade un subtexto con el total del sitio.
- No se cambia el frontend de tracking (`trackPageView` en la home y en las categorías sigue igual).

## Verificación

En el panel de analítica, con el mismo rango: el KPI "Vistas del directorio" debe mostrar el mismo número que la fila `/` de "Actividad por Página" (hoy, 687 en ese periodo).

## Arreglo adicional necesario (compilación)

Las 6 rutas de categoría (`/bazares`, `/ferias-artesanales`, `/flea-market`, `/food-market`, `/mercados-agricolas`, `/mercados-mixtos`) no compilan: el arreglo de middlewares compartido de limpieza de URL queda tipado como genérico y no encaja con el tipo de búsqueda de cada ruta.

Corrección: en `src/lib/category-route-helpers.ts`, anotar explícitamente `categorySearchMiddlewares` como `SearchMiddleware<z.infer<typeof categorySearchSchema>>[]`. Sin cambios de comportamiento; las rutas quedan igual.
