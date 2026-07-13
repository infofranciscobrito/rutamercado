## Plan: Sección "Sobre Nosotros" rediseñada

### Objetivo
Reemplazar el contenido actual de `src/components/rutamercado/AboutSection.tsx` por 3 bloques claros, manteniendo el fondo `#18253f`, texto blanco, ancho `max-w-7xl` y asegurando que el link `#sobre-nosotros` del nav haga scroll suave.

### Cambios propuestos

1. **Actualizar `src/components/rutamercado/AboutSection.tsx`**
   - Conservar `id="sobre-nosotros"`, fondo `#18253f`, texto blanco y `max-w-7xl`.
   - Reemplazar el contenido actual por 3 bloques en una cuadrícula responsive:
     - **Bloque 1 — Misión:** título "Misión" + párrafo exacto sugerido.
     - **Bloque 2 — ¿Qué encontrarás?:** 4 ítems con íconos reutilizados de `CategoryIcons.tsx` (`Leaf`, `Tent`, `Hand`, `ShoppingBag`) y sus nombres de categoría.
     - **Bloque 3 — Para organizadores:** texto sugerido + botón CTA "Registrar mi Mercado" que navegue a `/enviar` usando `Link` de `@tanstack/react-router`.

2. **Activar scroll suave global**
   - Agregar `scroll-behavior: smooth` al elemento `html` en `src/styles.css` (o en el selector `:root`) para que cualquier link con hash como `#sobre-nosotros` deslice suavemente.

3. **Verificar el link del nav**
   - Confirmar que `Header.tsx` siga usando `<a href="#sobre-nosotros">`. Con `scroll-behavior: smooth` funcionará correctamente.

### Archivos a modificar
- `src/components/rutamercado/AboutSection.tsx`
- `src/styles.css`

### No se modificarán
- Tipografía, colores ni estructura del Header.
- Rutas ni lógica de backend.
- Otros componentes fuera de los listados.