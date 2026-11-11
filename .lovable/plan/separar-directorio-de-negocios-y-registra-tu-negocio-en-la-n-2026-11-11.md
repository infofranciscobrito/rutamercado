# Separar "Directorio de negocios" y "Registra tu negocio" en la navegación

## Menú superior (escritorio y celular)
Orden: Sobre Nosotros · Productores · Directorio de negocios · [Registrar mercado] · [Registra tu negocio]
- "Productores" pasa a enlace de texto (igual que "Sobre Nosotros").
- Nuevo enlace de texto "Directorio de negocios" → /negocios.
- "Registrar mercado": botón secundario (borde verde, fondo transparente, texto blanco).
- "Registra tu negocio": botón verde principal → /registra-tu-negocio.
- En celular, mismo orden: primero los enlaces de texto, luego los botones.
- El botón "Newsletter" (solo en la portada) y el corazón de favoritos se quedan como están, después de los botones.

## Pie de página
- Explorar: "Emprendedores" pasa a "Directorio de negocios" (sigue en /negocios).
- Para Organizadores: añadir "Directorio de negocios" → /negocios.
- Nueva columna "Para Emprendedores" con "Registra tu negocio" → /registra-tu-negocio.
- Quitar "Términos de Uso", porque no existe una página de términos.
- El año del copyright se actualiza solo (hoy diría 2026).
- Con la columna nueva serán 5 columnas en escritorio. En tableta y celular se acomodan como ahora.

## Resto del sitio
Revisé el sitio: los únicos "Registra tu negocio" que llevan a /negocios están en el menú superior. No hay otros que cambiar.

## Detalles técnicos
- Archivos: `Header.tsx` y `Footer.tsx` solamente.
- Footer grid: `lg:grid-cols-4` → `lg:grid-cols-5`.
- Botón secundario: `border border-[#54b678] bg-transparent text-white hover:bg-[#54b678]/15`.
