## Objetivo
Reposicionar la imagen de fondo del hero para que el letrero "RIO VIVE" (lado derecho de la ilustración) sea más visible tanto en escritorio como en móvil, sin romper la legibilidad del texto del hero.

## Diagnóstico actual
- La imagen original tiene "RIO VIVE" en el tercio derecho, aproximadamente a mitad de altura.
- En desktop el letrero se ve parcialmente cortado/arriba; en mobile, con `bg-center` y zoom 220%, el recorte se centra en la calle y apenas se aprecia "RIO VIVE".
- El overlay `bg-[#18253f]/65 mix-blend-multiply` atenúa los colores rojos del letrero.

## Cambios propuestos

### 1. Reposicionar el fondo (`src/components/rutamercado/Hero.tsx`)
- Reemplazar `bg-center` por posiciones que bajen/acentúen el lado derecho:
  - Mobile: `bg-[center_70%]` (baja el punto focal para mostrar más la parte baja-derecha).
  - Tablet: `sm:bg-[center_65%]`.
  - Desktop: `lg:bg-[right_30%_bottom_40%]` o `lg:bg-[center_60%]` según prueba visual.
- Reducir ligeramente el zoom en mobile de `bg-[length:220%_auto]` a `bg-[length:200%_auto]` para dar más contexto sin perder el letrero.

### 2. Reducir opacidad del overlay multiply (opcional, a validar)
- Bajar `bg-[#18253f]/65` a `bg-[#18253f]/55` para que el rojo de "RIO VIVE" resalte más.
- Mantener el gradiente inferior para no perder contraste del texto blanco.

### 3. Verificación visual
- Tomar screenshots en desktop (1280px) y mobile (390px) después del cambio.
- Confirmar que:
  - "RIO VIVE" es claramente legible en ambos viewports.
  - El texto del hero (título, subtítulo, buscador) sigue siendo legible.
  - No se genera distorsión ni se cortan elementos importantes.

## Alcance
Solo ajustes de CSS en el componente `Hero.tsx`. No se toca la imagen, el resto de la página ni la lógica de filtros.