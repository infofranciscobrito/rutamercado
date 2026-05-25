## Plan

Corregiré el modal para que la imagen nunca dependa de un alto implícito ni de `object-cover` cuando se muestra el detalle.

### Cambios propuestos

1. **Ajustar `MarketImage` solo para modo detalle**
   - Mantener el comportamiento actual por defecto para las cards (`cover`).
   - En `fit="contain"`, forzar una caja estable con `width: 100%`, `height: 100%`, `object-fit: contain`, `object-position: center`.
   - Esto evita que el `<img>` use su propio alto natural y quede recortado por el `max-height` del contenedor.

2. **Cambiar el contenedor de imagen del modal**
   - Reemplazar `max-height` por una altura real y responsiva según orientación:
     - móvil: `h-[50vh]`
     - desktop landscape: `h-[400px]`
     - desktop portrait: `h-[500px]`
     - desktop square: `h-[450px]`
   - Mantener el fondo degradado para las bandas laterales/superiores.
   - Mantener badge de categoría y botón cerrar exactamente como overlays absolutos.

3. **No tocar lo demás**
   - No modificar cards del directorio.
   - No modificar categorías/filas.
   - No modificar contenido bajo la imagen.
   - No modificar overlay ni animaciones del modal.

### Por qué esto corrige el problema

El cambio anterior usaba `object-contain`, pero la imagen seguía teniendo `h-auto` dentro de un contenedor con `max-height`; eso puede dejar que el navegador pinte la imagen más grande y la corte por `overflow-hidden`. Con una altura real en el contenedor y la imagen ocupando `h-full w-full object-contain`, el navegador escala la foto completa dentro de la caja, sin recortarla.