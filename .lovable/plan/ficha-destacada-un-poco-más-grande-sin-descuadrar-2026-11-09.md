## Ficha destacada: un poco más grande, sin descuadrar

**Qué cambia**
- Las 3 fichas vuelven a quedar en una sola fila, una al lado de la otra.
- La destacada sigue saliendo primero (a la izquierda), con su fondo azul marino y estrella, pero solo un poco más ancha que las otras (aprox. 40% vs 30% cada una), no ocupando toda la fila.
- Todas mantienen la misma altura para que la fila se vea alineada.
- En celular siguen una debajo de la otra, como siempre.
- No se toca el contenido ni los botones de las fichas.

**Detalle técnico**
- `CategoryRow.tsx`: quitar `sm:col-span-2`; grid `sm:grid-cols-2 lg:grid-cols-3` normal, y cuando la primera ficha es destacada usar `lg:grid-cols-[1.3fr_1fr_1fr]`. En tablet (2 columnas) la destacada no se expande.
- Verificar con Playwright en escritorio y móvil.
