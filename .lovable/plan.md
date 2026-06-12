## Diagnóstico

Revisé `src/components/admin/MarketFormDrawer.tsx` y `src/lib/admin-markets.functions.ts`. **No existe ningún binding al email del admin** en el código:

- `marketToForm(m)` lee literalmente `m.organizer_email ?? ""`, `m.organizer_phone ?? ""`, `m.organizer_instagram ?? ""` desde el registro de BD.
- `useEffect` solo hace `reset(market ? marketToForm(market) : empty)`. El objeto `empty` tiene strings vacíos.
- No hay referencias a `user.email`, `session.user.email`, `currentUser`, `auth.user`, ni fallbacks tipo `|| user.email`.
- El servidor (`upsertMarket`) tampoco inyecta datos del admin.

**La causa raíz es 100% autofill del navegador/LastPass**, no un binding incorrecto ni una filtración real. LastPass detecta el input por heurística (atributos `name`/`type`/`id` que parecen "email" o por estar dentro de un formulario admin autenticado) y *pinta visualmente* el email del admin encima del input, pero ese valor **nunca entra al estado de react-hook-form** salvo que el usuario lo confirme con click — y aun así, el valor guardado vendría del usuario, no de una fuga del servidor.

En turnos anteriores ya apliqué a los 4 inputs de la sección del organizador (`organizer_name`, `organizer_phone`, `organizer_email`, `organizer_instagram`) todas las defensas estándar:
- `type="text"` (quitado `type="email"`)
- `autoComplete="off"`, `data-lpignore="true"`, `data-1p-ignore="true"`, `data-form-type="other"`
- `name`/`id` HTML renombrados a `contact-field-a/b/c/d` (sin "email"/"user"/"username")
- `autoComplete="off"` en el `<form>`

Que el usuario siga viendo el ícono/sugerencia de LastPass indica que LastPass está ignorando esos atributos en su contexto (algunas versiones del plugin lo hacen igualmente si el sitio está marcado como "always autofill" o si el dominio tiene credencial guardada).

## Cambios propuestos (mínimos, solo `MarketFormDrawer.tsx`)

1. **Comentarios de origen de datos** sobre cada input del bloque organizador, dejando explícito que la fuente es el registro `markets`, nunca la sesión del admin:
   ```tsx
   {/* Fuente: markets.organizer_email del registro editado. Nunca de la sesión del admin. */}
   ```
   Igual para `organizer_name`, `organizer_phone`, `organizer_instagram`.

2. **Refuerzo anti-LastPass adicional** — envolver cada input del organizador en un `<div data-lpignore="true">` además del atributo en el input. LastPass también respeta el flag a nivel contenedor en versiones recientes.

3. **`readOnly` + `onFocus` trick (opcional, recomendado)** — patrón que bloquea autofill agresivo: input arranca como `readOnly` y se quita el flag al primer `onFocus`. Esto previene el pintado automático sin requerir interacción del usuario:
   ```tsx
   <Input
     readOnly
     onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
     ...
   />
   ```
   Aplicar solo a los 3 campos de contacto (`phone`, `email`, `instagram`); `organizer_name` se deja normal porque no es target típico de autofill.

4. **Sin cambios en el binding ni en el guardado**: `register("organizer_email")` se mantiene, igual que `marketToForm`, `upsertMarket` y el esquema de BD. No hay nada que arreglar en la capa de datos porque no hay fuga.

## Fuera de alcance

- No se tocan campos de login/auth.
- No se cambia el diseño, estructura, validación ni la lógica de guardado.
- No se agregan campos nuevos (Facebook, web) — no existen en el esquema.
- No se modifica el cliente Supabase ni los archivos auto-generados.

## Confirmación al usuario

Aclaración importante: el email que se ve **no se está guardando** en la base de datos del mercado salvo que se haga submit con ese valor visible. Si el usuario quiere, puedo añadir una verificación extra que compare el valor del input con el email del admin antes de guardar y lo limpie automáticamente, pero eso es defensa en profundidad — la causa real es solo el plugin pintando sobre el input.
