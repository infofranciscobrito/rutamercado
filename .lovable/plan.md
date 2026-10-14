# Sustituir la categoría de la ficha por "Ver más información del mercado"

## Qué cambia

- En cada ficha de mercado, la píldora verde que hoy muestra el nombre de la categoría (Mercado Agrícola, Bazar, Feria Artesanal...) pasa a decir **"Ver más información del mercado"**.
- Conserva el estilo actual: mismo verde, mismo tamaño, mismo redondeo, misma sombra y la misma posición debajo de la ubicación.
- El nombre de la categoría deja de aparecer dentro de la ficha.

## Dónde se nota

Todas las fichas del sitio, porque las generan las mismas piezas:

- Página principal (secciones por categoría)
- Directorio de mercados
- Páginas de cada categoría
- "Mercados que te pueden interesar"
- Fichas destacadas (las de fondo oscuro)

## Dónde no cambia

- Filtros, chips activos, títulos de las páginas de categoría y la página individual de cada mercado siguen mostrando la categoría.
- Fechas, horas, pueblo/región, foto, favoritos y botones de las fichas quedan exactamente igual.

## Detalles técnicos

- Archivo único: `src/components/rutamercado/MarketCard.tsx`, líneas 101-103. El `<span>` con `bg-[#54b678]` que renderiza `{market.category}` pasa a renderizar el texto fijo "Ver más información del mercado", con las mismas clases.
- Ese `span` vive en el bloque `inner` compartido, así que el cambio cubre a la vez la ficha normal y la destacada, y los dos envoltorios (enlace cuando el mercado tiene página, y el elemento pulsable cuando no).
- Sin cambios en `src/styles.css`, en `src/components/ui/button.tsx` ni en la base de datos.
- Ninguna prueba depende del badge de categoría; la única prueba existente (`src/lib/category-preview.test.ts`) no lo usa.
- Actualizo la regla guardada de "Presentación de categorías" para que conste que la ficha ya no muestra la categoría y que la píldora verde lleva el texto nuevo.

## Verificación

- Revisar en la vista previa: página principal (ficha normal y ficha destacada), `/mercados`, una página de categoría y "Mercados que te pueden interesar".
- Confirmar que el texto no se corta ni deforma la ficha en pantalla de móvil.
- Confirmar que sigue habiendo una sola píldora verde por ficha y que la ficha abre la misma página de antes.

## Nota

Recuerda publicar para que el cambio se vea en rutamercadopr.com.
