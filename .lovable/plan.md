## Cambio de esquema de colores en /productores

Aplicar el rediseño únicamente en `src/routes/productores.tsx` y `src/components/productores/ProducerCard.tsx`. Usar los tokens existentes: `#18253f` (navy del sitio) y `#54b678` (verde primario). No tocar `src/styles.css`, datos, ni el popup.

### 1. `src/routes/productores.tsx` — fondo navy

- Contenedor raíz: `bg-[#18253f]` en lugar de `bg-[#FAFAF8]`.
- Sección hero: quitar `bg-white`; usar el mismo navy. Borde inferior `border-white/15`.
- H1, párrafo y contador: texto blanco / `text-white/80`.
- Input de búsqueda: fondo `bg-white/10`, borde `border-white/20`, texto blanco, placeholder `placeholder:text-white/50`; icono `text-white/60`.
- Estado vacío: caja con `border-white/20 bg-white/5` y texto `text-white/70`.
- Encabezados de región (`h2`): `text-white`; contador `text-white/60`.
- Añadir `<div className="mt-4 h-px bg-white/20" />` dentro del bloque de cada región para el separador sutil.

### 2. `src/components/productores/ProducerCard.tsx` — tarjeta verde sobre navy

Reemplazar todos los tonos navy/blanco internos manteniendo la estructura JSX actual:

- `<article>`: fondo `bg-[#54b678]`, borde `border-white/15`, sombra base `shadow-[0_2px_12px_rgba(0,0,0,0.2)]`, hover `hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]`, transición 200ms.
- Header oscurecido: envolver el avatar circular en un bloque superior con `bg-black/15` y márgenes negativos (`-mx-6 -mt-6 px-6 pt-6 pb-4`) para crear profundidad sin nuevos colores.
- Avatar:
  - Con logo: `border-2 border-white` (rounded-full), fondo blanco si la imagen es transparente.
  - Sin logo: placeholder circular `bg-white` con iniciales del productor en `text-[#54b678] font-display`.
- Tipografía dentro de la tarjeta:
  - Nombre: `text-white` (DM Serif Display).
  - "Contacto:", región, etiqueta "MERCADOS": `text-white/85`.
  - Icono MapPin: `text-white`.
- Sección mercados:
  - Separador superior: `border-t border-white/20`.
  - Pills `Badge`: `bg-white/15 text-white hover:bg-white/25` (sin colores nuevos).
- Links de contacto:
  - Texto `text-white`, iconos `text-white`, hover `hover:bg-white/10` y subrayado del texto (`hover:[&_span]:underline`).
- Separador antes del botón: `border-t border-white/20`.
- Botón "Actualizar información": variant `outline` con `border-white text-white bg-transparent hover:bg-white hover:text-[#54b678] transition-colors duration-200 ease-out`.
- Mensaje "Contacto no disponible": `text-white/70 italic`.

### Restricciones cubiertas

- Solo se editan los dos archivos de la página /productores; el resto del sitio queda intacto.
- Se reutilizan los tokens existentes (`#18253f`, `#54b678`); los valores `rgba(0,0,0,…)` y `white/xx` son sombras/opacidades, no colores de marca nuevos.
- No se modifica la estructura de datos ni el `UpdateProducerDialog` (sólo el botón que lo dispara cambia de estilo).
- No se usa la palabra "mercaditos".
