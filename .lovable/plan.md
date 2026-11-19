# Fase 1 de 4 — Base de datos y funciones para el interés en Mesas Aliadas

Solo se trabaja la parte interna: no se crean páginas ni se toca nada visual.

## Qué se hará
1. **Tabla nueva `mesas_aliadas_interes`**, con el SQL exacto del documento: RLS activo, lectura solo para administradores (`private.has_role`, que ya existe), sin permisos de escritura para visitantes, y el disparador `set_updated_at` (ya existe).
2. **Actualizar los tipos** del cliente para que incluyan la tabla nueva.
3. **Crear `src/lib/mesas-aliadas-interes.functions.ts`** con el contenido exacto del documento: enviar respuesta (pública, se guarda desde el servidor, upsert por `id_respuesta`), listar (admin, sin email ni teléfono), exportar contactos (admin) y borrar pruebas (admin). Si TypeScript da errores, se corregirán solo los tipos, sin cambiar valores, columnas ni lógica.

## No se toca
encuesta_respuestas, encuesta.functions.ts, mesas-aliadas.ts, componentes de emprendedores, tabla emprendedores, otras migraciones, rutas ni estilos.

## Verificación antes de terminar
- La tabla existe con RLS activo y los tipos están actualizados.
- Envío sin sesión funciona; rechaza `descuento: "20"`.
- `con_contacto` sin email o sin permiso se rechaza.
- `anonima` se guarda sin negocio, instagram, email ni teléfono aunque se envíen.
- Segundo envío con el mismo `id_respuesta` actualiza la misma fila.
- La lista no devuelve email ni teléfono.
- Las filas de prueba creadas durante la verificación se borran al final.
