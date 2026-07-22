## Cambio de imagen OG para /negocios

1. Copiar `user-uploads://og-negocios.png` a `public/og-negocios.png` (1200x630).
2. Actualizar el `head()` en `src/routes/negocios.tsx` para que `og:image` y `twitter:image` apunten a `https://rutamercadopr.com/og-negocios.png` (URL absoluta), manteniendo `og:url`, `og:type`, `og:site_name`, `twitter:card` y `canonical` de la ruta.
3. Verificación tras publicar: `view-source:https://rutamercadopr.com/negocios` debe mostrar `<meta property="og:image" content="https://rutamercadopr.com/og-negocios.png">` en el HTML crudo; luego forzar re-scrape en Facebook Sharing Debugger.