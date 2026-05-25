Sí, esto se resuelve.

El problema no es la foto ni los datos existentes: es el diseño actual del modal. Aunque la imagen usa `object-contain`, el contenedor de arriba sigue teniendo una altura fija limitada (`50vh`, `400px`, `500px`) y por eso una imagen promocional alta no cabe completa; se corta visualmente y aparece esa franja azul/oscura del fondo.

Plan mínimo para arreglarlo sin tocar lo demás:

1. Cambiar solo el bloque superior de imagen en `MarketDetailDialog.tsx`.
   - Quitar la altura fija que fuerza el recorte.
   - Usar un contenedor adaptable que permita que la imagen vertical muestre su proporción completa.
   - Mantener ancho completo del modal.

2. Ajustar `MarketImage.tsx` solo para el modo `fit="contain"` del modal.
   - La imagen debe renderizarse con `width: 100%`, `height: auto`, `max-height: none` para retratos.
   - Para imágenes horizontales, seguir usando `contain` sin deformar.
   - No tocar el modo `cover`, que usan las cards.

3. Quitar la línea/franja azul visible.
   - El fondo oscuro solo debe verse si realmente sobra espacio lateral por `contain`.
   - No debe aparecer una barra horizontal debajo de la imagen.

4. Verificación visual obligatoria antes de decir que está resuelto.
   - Abrir el modal en el preview.
   - Comparar contra la captura que enviaste.
   - Confirmar que el cartel promocional se ve completo, sin cortar texto superior/inferior.

No voy a modificar:
- Cards del directorio.
- Categorías.
- Contenido debajo de la imagen.
- Overlay ni animaciones del modal.