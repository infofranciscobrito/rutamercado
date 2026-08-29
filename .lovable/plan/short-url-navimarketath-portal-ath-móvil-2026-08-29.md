# Short URL: /navimarketath → portal ATH Móvil

## Objetivo
Que `rutamercadopr.com/navimarketath` (y `www.rutamercadopr.com/navimarketath`) redirija a la URL larga del portal de ATH Móvil:

`https://portal.athmovil.com/navimarket/#vendors?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAadgc6gFjBt5LdY7uxT25IBClvGiYSGO0hHEemGnLz6J-T3TokbdBQAohxCH6A_aem_9tVJLc8N8Wwx3nxE-jRjbg`

## 1. Redirección en el servidor
En `src/server.ts`, junto a la redirección de www que ya existe, agregar una regla simple:

- Si la ruta es `/navimarketath` (con o sin barra final), responder con un **302** (redirección temporal) hacia la URL del portal ATH Móvil.
- Se usa 302 y no 301 para que puedas cambiar el destino más adelante sin que los navegadores/cache guarden el destino viejo.
- El resto del sitio no se ve afectado. Funciona desde el dominio raíz y desde `www.` (que ya redirige al raíz conservando la ruta).

## 2. Fuera de alcance
Ningún cambio de contenido, diseño ni lógica de la app. No se crea página nueva.

## Cómo verificar al terminar
1. Abrir `rutamercadopr.com/navimarketath` en el navegador: debe aterrizar en `portal.athmovil.com/navimarket/#vendors...`.
2. `curl -I https://rutamercadopr.com/navimarketath` debe responder `302` con `location:` apuntando al portal.

Nota: el cambio solo aplica en el sitio publicado — hay que publicar para verlo en vivo.
