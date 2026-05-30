## Problema

El botón "Ver Directorio" en el header de `/enviar` no se ve bien porque ya cambiamos parte de la página a verde pero el botón sigue con clases amarillas viejas (`#f8b625`), y además el contraste sobre el fondo oscuro `#1c1e37` no destaca.

## Solución

Reemplazar TODO el amarillo restante en `src/routes/enviar.tsx` por el verde `#54b678` (y un verde más oscuro `#3f9560` para los hovers), de modo que el botón y todos los acentos queden consistentes y visibles.

### Cambios en `src/routes/enviar.tsx`

Sustituciones globales en el archivo:
- `#f8b625` → `#54b678` (color principal)
- `#f59e0b` → `#3f9560` (hover del CTA)
- `rgba(248,182,37,...)` → `rgba(84,182,120,...)` (sombra del CTA)

Esto afecta:
1. **Botón "Ver Directorio"** del header → borde y texto verdes, hover con fondo verde sólido.
2. **CTA "Registrar mi mercado ahora"** del hero → fondo verde con sombra verde.
3. **Etiqueta "Para organizadores"** del hero → texto verde.
4. **Números de métricas** (10+ municipios, Directorio activo, Gratis) → verdes.
5. **Iconos circulares** de la sección "¿Por qué registrar...?" → fondo verde claro + ícono verde.
6. **Línea conectora y círculos numerados** de "Así de fácil es publicar..." → verdes.
7. **Link "Ver directorio completo"** del footer → verde.

No se toca ningún otro archivo, ni la lógica del formulario, ni los componentes globales (`Header.tsx`, `Footer.tsx`, etc., que pertenecen al resto del portal).

## Resultado esperado

El botón "Ver Directorio" se verá claramente en verde `#54b678` sobre el header oscuro, y toda la página `/enviar` quedará unificada en la nueva paleta verde sin restos amarillos.