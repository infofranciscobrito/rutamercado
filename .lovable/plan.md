## Objetivo
En el editor admin del negocio (`/admin/emprendedores` → "Editar negocio"), añadir la posibilidad de subir el logo desde la computadora, además del campo de URL existente.

## Cambios

1. **`src/routes/_admin/admin.emprendedores.tsx`** (sección "URL del logo", línea ~693-701)
   - Mantener el input de URL existente.
   - Añadir arriba un uploader que suba la imagen al bucket `market-images` (carpeta `emprendedores/`) usando el cliente Supabase del navegador (admin ya está autenticado).
   - Al completarse la subida, escribir la URL pública en `form.logo_url` (el mismo campo que guarda el editor).
   - Mostrar vista previa circular del logo actual y un botón "Quitar" que ponga `logo_url = null`.
   - Validaciones: tipos JPG/PNG/WebP, máximo 5 MB, detección de MIME por bytes (mismo patrón que `ImageUpload16x9.tsx`).

2. **Sin cambios de backend**: el server fn `updateEmprendedor` ya acepta `logo_url` como string, así que basta con setear la URL resultante en el formulario y guardar.

## Detalles técnicos
- Reutilizar el patrón de `src/components/rutamercado/ImageUpload16x9.tsx` (detectMimeFromBytes, upload a `market-images`, `getPublicUrl`), adaptado a un layout cuadrado/redondo apropiado para logo.
- Path de subida: `emprendedores/<uuid>.<ext>` (mismo prefijo que usa `submitEmprendedor`).
- No modificar paleta, tipografía ni otros campos del editor.