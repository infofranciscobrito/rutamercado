Limpiar el campo **Perfil de redes sociales** del formulario admin para que sea un input de texto genérico y para que LastPass no lo detecte.

## Cambios

1. Sin tocar base de datos: el dato se sigue guardando en la misma columna interna.
2. Reemplazar el input actual por uno plenamente genérico:
   - `type="text"` simple, sin placeholder con `@`, sin validación de handle, sin lógica de Instagram.
   - `name`/`id` neutros en el DOM (sin `organizer`, `instagram`, `social`, `user`, `email`).
   - Atributos anti-autofill: `autoComplete="off"`, `data-lpignore="true"`, `data-1p-ignore="true"`, `data-form-type="other"`.
   - Truco `readOnly` inicial y quitarlo al primer focus para bloquear el plugin.
3. Mantener el binding a React Hook Form mediante `Controller`, para que el `name` real del DOM no exponga el nombre interno y el valor siga guardándose correctamente.
4. Quitar cualquier formato/icono/etiqueta visual que sugiera redes sociales en ese campo (solo queda el label "Perfil de redes sociales" como título de sección y un input de texto plano).
5. No modificar otros campos, diseño general, validaciones, guardado ni base de datos.