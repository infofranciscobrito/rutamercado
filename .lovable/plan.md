# Imagen de vista previa para /newsletter

La ruta `/newsletter` ya declara `og:image` y `twitter:image` apuntando a
`https://rutamercadopr.com/og-newsletter.png`, pero ese archivo no existe todavía en
`public/`, así que al compartir el enlace no aparece la tarjeta con imagen.

## Qué se hace

1. Añadir la imagen subida (1200×630, navy con logo Rutamercado y texto "Newsletter")
   como `public/og-newsletter.png`, igual que las demás imágenes OG del sitio
   (`og-bazares.png`, `og-negocios.png`, etc.).
2. No se cambia código: las etiquetas `og:image`, `twitter:image`, `og:url` y el
   canonical de `src/routes/newsletter.tsx` ya son correctos.

## Nota

Facebook, WhatsApp y X guardan en caché la vista previa anterior. Después de publicar,
conviene forzar el refresco en el depurador de enlaces de cada plataforma
(por ejemplo, el Sharing Debugger de Facebook) para ver la imagen nueva de inmediato.
