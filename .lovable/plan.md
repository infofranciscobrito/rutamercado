# Redirección 301 de www → dominio raíz

## Objetivo
Que `www.rutamercadopr.com/cualquier-ruta` redirija de forma permanente (301) a `rutamercadopr.com/cualquier-ruta`, dejando una sola versión canónica del sitio.

## 1. Redirección en el servidor
En el punto de entrada del servidor (`src/server.ts`), antes de que la petición llegue a la app:

- Leer el host de la petición.
- Si empieza con `www.`, devolver un 301 hacia el mismo host sin `www`, conservando ruta y parámetros de búsqueda (`/mercados-agricolas?x=1` sigue igual).
- Cualquier otro host pasa sin cambios (incluye el preview de Lovable y localhost, que no se ven afectados).

Detalle técnico: se usa el header `host` (con `x-forwarded-host` como respaldo) y se responde con `Response.redirect(url, 301)` más `Cache-Control` corto para evitar cachear mal durante pruebas.

## 2. Revisión de etiquetas canonical
Estado actual verificado:

- `/` (index), `/negocios`, `/mercados`, `/productores` y todas las páginas de categoría (vía `src/lib/category-route-helpers.ts`) ya declaran canonical sin `www`.
- `/politica-de-privacidad` no tiene canonical ni `og:url`.

Acción: agregar `canonical` y `og:url` apuntando a `https://rutamercadopr.com/politica-de-privacidad`. No se toca ninguna otra etiqueta.

## 3. Fuera de alcance
Ningún otro cambio de contenido, diseño ni lógica.

## Cómo verificar al terminar
1. Escribe `www.rutamercadopr.com` en el navegador: la barra de direcciones debe terminar mostrando `rutamercadopr.com` (sin www).
2. Prueba una ruta interna: `www.rutamercadopr.com/mercados-agricolas` debe aterrizar en `rutamercadopr.com/mercados-agricolas`, no en la home.
3. Comprobación del código 301: en una terminal, `curl -I https://www.rutamercadopr.com/mercados` debe responder `HTTP/2 301` y `location: https://rutamercadopr.com/mercados`.
4. En Search Console, tras unos días la versión con www debería dejar de indexarse.

Nota: el cambio solo aplica en el sitio publicado, así que hay que publicar para verlo en vivo.
