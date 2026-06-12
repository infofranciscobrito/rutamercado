## Diagnóstico

En `MarketFormDrawer.tsx`, la sección de contacto/redes del organizador tiene tres inputs:

- `organizer_phone`
- `organizer_email` — `<Input type="email" {...register("organizer_email")} />`
- `organizer_instagram` — ya tiene `autoComplete="new-password"`, `data-lpignore`, `data-form-type="other"`

El culpable del autocompletado incorrecto es **`organizer_email`**: al ser `type="email"` y tener `name="organizer_email"` (contiene la palabra "email"), LastPass/1Password/Chrome lo detectan como campo de login y meten el correo de la sesión del admin, pisando visualmente el valor real guardado (aunque en el estado de react-hook-form sí está el valor de BD).

`organizer_phone` también puede ser blanco de autofill de "teléfono de contacto del usuario".

No existen campos de Facebook/web hoy; el alcance se limita a los inputs reales: phone, email, instagram.

## Cambios (solo `src/components/admin/MarketFormDrawer.tsx`)

1. **Anti-autofill en los 3 inputs del bloque organizador**
   A `organizer_phone`, `organizer_email` y `organizer_instagram` (este último ya casi listo) añadir:
   - `autoComplete="off"` (en el email reemplaza cualquier heurística de password manager)
   - `data-lpignore="true"`
   - `data-1p-ignore="true"`
   - `data-form-type="other"`

2. **Renombrar atributos `name`/`id` que disparan password managers**
   Los password managers ignoran `autocomplete="off"` cuando el `name` contiene `email`/`user`. Sin cambiar la clave del form (`organizer_email` sigue siendo la propiedad de react-hook-form para no romper el guardado), forzar el atributo HTML `name`/`id` a un valor neutro:

   ```tsx
   <Input
     type="text"                              // ya no "email"
     autoComplete="off"
     data-lpignore="true"
     data-1p-ignore="true"
     data-form-type="other"
     {...register("organizer_email")}
     name="contact-field-a"                   // sobrescribe el name HTML después del spread
     id="contact-field-a"
   />
   ```

   Mismo patrón para los otros dos (`contact-field-b`, `contact-field-c`). El `register("organizer_email")` mantiene el binding correcto con react-hook-form (usa su propio `ref`/`onChange`), solo el atributo HTML `name` cambia para despistar al gestor de contraseñas. La validación nativa `type="email"` se elimina; la validación de formato, si se quiere, se puede mover a `register("organizer_email", { pattern: ... })` — fuera del alcance de este fix.

3. **Envolver la sección en un `autoComplete="off"` a nivel `<form>`**
   Añadir `autoComplete="off"` al `<form>` para reforzar la señal global (no rompe los demás campos porque ya se controlan individualmente).

## Confirmación del binding

`useEffect` ya hace `reset(market ? marketToForm(market) : empty)` cuando se abre el drawer, y `marketToForm` lee literalmente `m.organizer_email ?? ""`, `m.organizer_instagram ?? ""`, `m.organizer_phone ?? ""` desde el registro de BD. No hay valores por defecto que vengan de sesión/usuario. El "email raro" que se ve es puramente el autofill del navegador pintándose sobre el input — al cortar el autofill con los pasos 1-2, el campo mostrará exclusivamente el valor real del registro.

## Fuera de alcance

- No se tocan campos de login/auth.
- No se cambia diseño, layout, etiquetas visibles, ni lógica de guardado.
- No se añaden campos nuevos (Facebook, web) porque no existen en el esquema actual; si se quieren agregar, es otra tarea.
