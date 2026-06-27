## Plan: Reorganizar botón de registro en /productores

### Objetivo
Mover el botón "Registro de productores" para que aparezca alineado a la derecha del subtítulo, dejando la barra de búsqueda sola en una fila inferior.

### Cambios en `src/routes/productores.tsx`

1. **Fila del subtítulo + botón**
   - Agrupar el `<p>` del subtítulo y el `<button>` en un contenedor flex.
   - Desktop (`sm:`): subtítulo a la izquierda, botón a la derecha, misma fila (`flex-row justify-between items-center`).
   - Mobile: botón debajo del subtítulo, ancho completo (`w-full`), centrado.

2. **Fila de la barra de búsqueda**
   - La barra de búsqueda pasa a su propia fila debajo, sin elementos a los lados (`w-full`).
   - Mantiene su estilo actual.

3. **Estilo del botón**
   - Sin cambios: conserva fondo `#54b678`, texto blanco, hover `#439660` y transición `200ms`.

### Diagrama de la nueva estructura

```
Desktop:
[Título principal]                          
[Subtítulo ..............] [Registro de productores]
[------------------ Barra de búsqueda ------------------]

Mobile:
[Título principal]
[Subtítulo]
[      Registro de productores      ]
[------------------ Barra de búsqueda ------------------]
```

Solo se toca `src/routes/productores.tsx`. Sin cambios de backend ni de otros archivos.