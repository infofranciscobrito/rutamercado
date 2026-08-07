# Instalar Google Analytics 4 (G-RYLF0JRKZL)

No existe ningún tag de GA4 ni de Google Tag Manager en el proyecto hoy (verificado buscando `gtag`, `googletagmanager` y el ID en `src/` y `public/`). Lo único instalado es el Facebook Pixel en `src/routes/__root.tsx`.

Este proyecto no usa `index.html`: el `<head>` se genera en el servidor desde el `head()` de la ruta raíz (`src/routes/__root.tsx`), que ya inyecta el Pixel de Facebook. GA4 se añade ahí, exactamente con el mismo código, para que cargue en todas las páginas y rutas limpias.

## Cambios

1. `src/routes/__root.tsx`
   - Añadir en `head().scripts` dos entradas, antes del script del Pixel:
     - `{ src: "https://www.googletagmanager.com/gtag/js?id=G-RYLF0JRKZL", async: true }`
     - un script inline con exactamente `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config','G-RYLF0JRKZL');`
   - Añadir `preconnect` a `https://www.googletagmanager.com` para que cargue más rápido.
   - Una sola instancia: no se toca ni se duplica el Facebook Pixel (ID 2461407064362253); ambos conviven sin interferir porque usan objetos distintos (`dataLayer` vs `fbq`).

2. Vistas de página en navegación interna (recomendado)
   - Al ser una app de una sola página, gtag solo registra la primera carga. Añadir en el componente raíz un pequeño efecto que, al cambiar la ruta, envíe `gtag('event','page_view',{ page_path })`, para que `/bazares`, `/mercados-agricolas`, `/productores`, etc. cuenten como vistas reales.

3. Dominio sin www
   - La redirección 301 de `www` al dominio raíz ya está activa en `src/server.ts`, así que todo el tráfico medido queda bajo `rutamercadopr.com`. No se cambia nada más.

## Cómo verificarlo (después de publicar)

- En GA4: Informes > Tiempo real. Abre `rutamercadopr.com` en otra pestaña y deberías verte como usuario activo en menos de un minuto.
- En el navegador: clic derecho > Inspeccionar > pestaña Red, filtra por `collect`. Al cargar la página debe aparecer una petición a `google-analytics.com/g/collect`.
- Navega a `/bazares` y `/productores` sin recargar: debe aparecer una petición `collect` nueva por cada página.
- Confirma que el Pixel de Facebook sigue funcionando con la extensión Meta Pixel Helper.

## Arreglo adicional incluido

Hay 4 errores de compilación pendientes en `src/components/rutamercado/CategoryPage.tsx` (parámetro `prev` sin tipo en las llamadas a `navigate`). Se corrigen anotándolo como `(prev: S)` en las cuatro líneas. Sin esto el sitio no compila.
