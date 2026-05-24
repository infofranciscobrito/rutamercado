Plan para reparar /admin/login y el panel admin:

1. **Crear un flujo de auth admin con estado explícito**
   - Agregar un hook/componente compartido para el admin con estados: `loading`, `authenticated`, `unauthenticated`.
   - El estado inicial será siempre `loading`, nunca “autenticado”.
   - Verificará la sesión real con Lovable Cloud antes de permitir redirecciones.
   - Agregará logs temporales:
     - `Auth state: loading`
     - `Auth state: authenticated`
     - `Auth state: unauthenticated`

2. **Corregir `/admin/login`**
   - Quitar la redirección temprana del `beforeLoad` que puede mandar a `/admin/dashboard` antes de confirmar sesión.
   - Mostrar spinner centrado mientras auth está en `loading`.
   - Mostrar el formulario email/password solo cuando el estado sea `unauthenticated`.
   - Redirigir a `/admin/dashboard` solo cuando el estado confirmado sea `authenticated`.

3. **Corregir rutas protegidas `/admin/*`**
   - Evitar que el layout admin renderice contenido o cargue datos antes de confirmar sesión.
   - Mientras verifica sesión, mostrar spinner centrado con fondo `#FAFAF8` y acento `#f8b625`.
   - Si no hay sesión válida, redirigir a `/admin/login`.
   - Si hay sesión válida, renderizar `AdminLayout` y el contenido normal.

4. **Prevenir página en blanco y carga de datos sin sesión**
   - Asegurar que dashboard/markets/analytics no ejecuten su contenido protegido hasta que el guard confirme auth.
   - Revisar el redirect de `/admin` hacia `/admin/dashboard` para que no participe en loops inesperados.

5. **Validación**
   - Verificar en preview:
     - `/admin/login` sin sesión muestra formulario.
     - `/admin/dashboard` sin sesión redirige a login sin quedarse en blanco.
     - Login exitoso manda a dashboard.
     - Los logs temporales aparecen con los estados correctos.