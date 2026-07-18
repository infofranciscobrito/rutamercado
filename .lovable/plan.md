## Plan: Fondo oscuro para toda la página `/emprendedores`

### Objetivo
Convertir el fondo de toda la página `/emprendedores` a oscuro, manteniendo la legibilidad y coherencia visual con el hero existente.

### Cambios propuestos

1. **Wrapper principal**
   - Cambiar `bg-white` del contenedor raíz a `bg-[#18253f]`.
   - Cambiar el color base del texto a blanco/blanco con opacidad.

2. **Secciones interiores**
   - **Métricas**: fondo `#18253f`, números y textos en blanco/verde.
   - **Beneficios**: fondo `#18253f` (o un tono ligeramente diferente como `#141628` para crear profundidad), tarjetas con fondo oscuro y borde sutil, iconos/textos en blanco/verde.
   - **Proceso**: fondo `#18253f`, pasos numerados en verde, textos en blanco.
   - **Directorio**: fondo `#18253f`, título y contador en blanco, barra de filtros con inputs/selects de fondo oscuro y texto claro.
   - **Estado vacío**: fondo oscuro con borde punteado claro y texto claro.

3. **Componentes afectados**
   - `src/routes/emprendedores.index.tsx`: todos los cambios de fondo y color de texto.
   - No se modifica `EmprendedorCard.tsx` porque ya usa fondo `#18253f` con texto blanco (encaja con el fondo oscuro).
   - `Header` y `Footer` se mantienen sin cambios; el footer ya es oscuro.

4. **Accesibilidad**
   - Asegurar contraste suficiente entre texto blanco y fondo oscuro.
   - Mantener estados `hover` y `focus` visibles.

### Verificación
- Typecheck (`bunx tsc --noEmit` o `tsgo`).
- Vista previa de `/emprendedores` para confirmar que toda la página se ve oscura y legible.