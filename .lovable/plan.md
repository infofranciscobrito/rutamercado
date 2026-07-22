Reemplazar la imagen OG de `/mercados` con la nueva versión subida.

## Pasos

1. Copiar `user-uploads://og-registra-mercado-3.png` a `public/og-registra-mercado.png` (sobrescribiendo la actual). Mantener el mismo nombre evita cambios en `src/routes/mercados.tsx` y en cualquier caché ya indexada por URL.
2. No se requieren cambios de código: `src/routes/mercados.tsx` ya emite `og:image` y `twitter:image` apuntando a `https://rutamercadopr.com/og-registra-mercado.png`.

## Verificación tras publicar

- `view-source:https://rutamercadopr.com/mercados` → confirmar `<meta property="og:image" content="https://rutamercadopr.com/og-registra-mercado.png">`.
- Facebook Sharing Debugger → **Scrape Again** para refrescar caché (WhatsApp/Instagram heredan).
- Nota: los crawlers cachean previews; el cambio no aparece de inmediato en links ya compartidos.
