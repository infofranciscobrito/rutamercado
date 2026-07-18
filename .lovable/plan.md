## Objetivo
Cambiar toda la terminología visible de "Emprendedores" a "Registro de negocios" en el panel de administración, sin alterar nombres técnicos internos (archivos, funciones, tablas, rutas).

## Archivos a modificar

### 1. `src/components/admin/AdminSidebar.tsx`
- Cambiar el label del menú de navegación de `"Emprendedores"` a `"Registro de negocios"`.

### 2. `src/routes/_admin/admin.emprendedores.tsx`
- Título de página: `"Emprendedores"` → `"Registro de negocios"`.
- Subtítulo: `"Registros del Directorio de Emprendedores..."` → `"Registros del Directorio de Negocios..."`.
- Botón de acción: `"Nuevo emprendedor"` → `"Nuevo negocio"`.
- Mensajes `toast`:
  - `"Emprendedor aprobado"` → `"Negocio aprobado"`
  - `"Emprendedor rechazado"` → `"Negocio rechazado"`
  - `"Emprendedor eliminado"` → `"Negocio eliminado"`
  - `"Emprendedor guardado"` → `"Negocio guardado"`
- Texto de tabla vacía: `"No hay emprendedores en esta pestaña"` → `"No hay negocios en esta pestaña"`.
- Diálogo de confirmación de eliminación: `"¿Eliminar emprendedor?"` → `"¿Eliminar negocio?"`.
- Título del editor lateral (Sheet):
  - `"Editar emprendedor"` → `"Editar negocio"`
  - `"Nuevo emprendedor"` → `"Nuevo negocio"`
- Descripción del editor: `"Actualiza los datos del emprendedor"` → `"Actualiza los datos del negocio"`.

## Qué NO se modifica
- Nombres de archivos ni rutas (`admin.emprendedores.tsx`, `/admin/emprendedores`).
- Nombres de funciones, tipos ni variables internas (`adminListEmprendedores`, `AdminEmprendedor`, etc.).
- Tabla de base de datos `emprendedores`.
- Página pública `/emprendedores` ni sus textos.
- Dirección de correo `emprendedores@rutamercadopr.com`.

## Verificación
- Ejecutar build de TypeScript para confirmar que no hay errores.
- Revisar visualmente la captura del dashboard para confirmar que todas las etiquetas visibles quedan como "Registro de negocios" / "Negocio".