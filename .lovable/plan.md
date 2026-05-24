Confirmé que sí hay datos en la base: 18 mercados, 9 clics y 78 vistas. El backend está saludable. El fallo real no es falta de información: los logs muestran `permission denied for function has_role`, por eso las consultas del admin fallan y el dashboard muestra `dashboard active markets:` vacío.

Plan de reparación:

1. Corregir permisos de la función de roles
- Crear una migración para otorgar permiso de ejecución de `public.has_role(uuid, app_role)` a los roles usados por la app.
- Mantener la función como `SECURITY DEFINER` y con `search_path = public`.
- No abrir tablas públicamente ni relajar RLS de forma insegura.

2. Validar que el usuario admin pueda leer datos
- Confirmar que las políticas que dependen de `has_role(...)` vuelvan a funcionar para `markets`, `market_submissions` y `user_roles`.
- Mantener `market_clicks` y `page_views` legibles para usuarios autenticados como ya están.

3. Corregir el error poco claro del dashboard
- Quitar el uso de `head: true` en los conteos críticos del dashboard, porque está devolviendo errores con mensaje vacío.
- Calcular conteos con respuestas normales para que, si algo falla, el panel muestre un mensaje útil.

4. Verificar el flujo completo
- Revisar logs después del cambio para confirmar que desaparece `permission denied for function has_role`.
- Validar que `/admin/dashboard`, `/admin/markets`, `/admin/submissions` y `/admin/analytics` carguen datos o estados vacíos reales, sin quedarse en blanco.

No se tocará la interfaz pública ni el diseño del admin; solo permisos/conexión de datos y mensajes de error.