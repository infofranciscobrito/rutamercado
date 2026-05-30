## Iconos sociales en el footer

Editar `src/components/rutamercado/Footer.tsx` para agregar una fila de iconos sociales debajo del copyright (encima de los enlaces de texto existentes).

### Cambios

1. Importar `Instagram` y `Facebook` desde `lucide-react`.
2. Agregar un bloque nuevo después del `<p>` del copyright:
   - Contenedor `flex` centrado con `gap-4`, `mt-4`.
   - Dos `<a>` con:
     - `href` correspondiente (instagram.com/rutamercadopr y facebook.com/rutamercadopr)
     - `target="_blank"` y `rel="noopener noreferrer"`
     - `aria-label` ("Instagram" / "Facebook")
     - Clase: `text-[#54b678] transition-opacity hover:opacity-80`
     - Icono con `size={24}`

### Consideraciones

- Color verde `#54b678` (mismo que ya usa el footer en separadores/hover).
- Tamaño 24px funciona igual en mobile y desktop (no breakpoints).
- Posición: entre el copyright y la fila de enlaces de texto, queda visible y centrado.