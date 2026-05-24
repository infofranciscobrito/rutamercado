## Integrar logo de RutaMercado

El logo subido es cuadrado (1:1) con el ícono + wordmark "Rutamercado" + tagline sobre fondo navy. Lo usaré en favicon, header y sidebar admin.

### 1. Guardar el asset
- Copiar `user-uploads://200x200.png` a `public/logo-rutamercado.png` (uso en `<img>` y meta tags).
- Reemplazar `public/favicon.png` con la misma imagen (cuadrada, ideal para favicon/apple-touch).
- Reemplazar `public/og-image.png` con esta misma imagen (aunque no sea 1200×630, funciona como share preview con el branding correcto; OG acepta cuadrado).

### 2. Header (`src/components/rutamercado/Header.tsx`)
El logo ya incluye el wordmark "Rutamercado" + tagline, así que **quito el texto duplicado** ("RutaMercado" + "Descubre los mercados locales…") y dejo solo la imagen del logo a altura ~48px.
- `<img src="/logo-rutamercado.png" alt="RutaMercado — Directorio de mercados locales" className="h-12 w-12 rounded-md" />` + texto wordmark al lado en pantallas donde el logo se vea pequeño, o solo logo más grande (h-14) sin texto.
- Decisión: logo a `h-14 w-14` sin texto adicional al lado (el logo ya tiene wordmark legible). Mantener el tagline a la derecha en `sm:` como está.

### 3. Sidebar admin (`src/components/admin/AdminSidebar.tsx`)
- Reemplazar `logo-placeholder.svg` por `/logo-rutamercado.png`, a `h-12 w-12 rounded-md` centrado en el header del sidebar.

### 4. Favicon en `__root.tsx`
- Ya apunta a `/favicon.png` — sin cambios de código, solo el binario nuevo.

### Archivos
- Crear/sobrescribir: `public/logo-rutamercado.png`, `public/favicon.png`, `public/og-image.png`
- Editar: `src/components/rutamercado/Header.tsx`, `src/components/admin/AdminSidebar.tsx`
- Sin cambios: `__root.tsx`, `index.tsx` (las meta tags ya apuntan a `/og-image.png` y `/favicon.png`)

### Notas
- No genero nuevas versiones AI del logo — uso tu PNG tal cual.
- `logo-placeholder.svg` queda huérfano; puedo borrarlo si quieres.
