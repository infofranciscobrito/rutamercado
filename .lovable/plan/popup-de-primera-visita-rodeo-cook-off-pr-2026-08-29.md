# Popup de primera visita — Rodeo Cook Off PR

## Objetivo
Mostrar un popup promocional la PRIMERA vez que una persona entra a cualquier página de RutaMercado (home, ficha de mercado, categorías, etc.). Incluye el arte adjunto y un botón que abre el registro de vendors.

## Qué se va a hacer

1. **Nuevo componente `PromoPopup`** (en `src/components/rutamercado/PromoPopup.tsx`)
   - Modal centrado sobre fondo oscuro semitransparente (usa el sistema de Dialog existente del proyecto).
   - Contenido: la imagen del arte del evento (guardada en `public/promo-rodeo.png` o `src/assets`), optimizada y responsiva (max-width ~520px, bordes redondeados).
   - Botón verde de marca (#54b678) con el texto **"Regístrate como vendors"** que abre `https://rodeocookoffpr.com/vendors` en pestaña nueva (`target="_blank" rel="noopener"`).
   - Botón de cerrar (X) y cierre al hacer clic fuera o con la tecla Escape.
   - Texto alternativo en la imagen para accesibilidad.

2. **Lógica de "solo la primera vez"**
   - Bandera en `localStorage` (clave `rm_promo_rodeo_seen`), misma técnica que el visitor-id ya existente.
   - Se muestra tras ~1.5s de haber cargado la página para no interrumpir la carga; solo si la bandera no existe. Al cerrarlo (por cualquier vía), se guarda la bandera.
   - Renderizado solo en cliente para evitar errores de hidratación (se monta en `useEffect`).

3. **Integración global**
   - El popup se monta una sola vez en `src/routes/__root.tsx` (dentro de `RootComponent`), así aparece en TODAS las rutas del sitio la primera vez que el visitante llega, sin importar por qué página entre.

4. **Arte**
   - Al aprobar, adjunta la imagen del arte. Se guardará en `public/promo-rodeo.png` y se referenciará directamente.

## Qué NO cambia
- No se toca SEO, metadata, rutas, base de datos ni ninguna otra funcionalidad.
- Si el visitante ya vio el popup, nunca lo vuelve a ver en ese navegador (salvo que borre el almacenamiento local).

## Verificación
- Prueba con Playwright: abrir la home en navegador limpio → aparece el popup → clic en el botón abre la URL correcta → cerrar y recargar → ya no aparece.
