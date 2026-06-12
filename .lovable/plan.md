# Limpiar campo "Perfil de redes sociales"

En `src/components/admin/MarketFormDrawer.tsx` (líneas 376–393), el input bindeado a `organizer_instagram` tiene un montón de atributos anti-autocompletado (LastPass/1Password), un truco `readOnly` + `onFocus`, un wrapper `data-lpignore`, un placeholder `@usuario` y un `name`/`id` falso (`contact-field-c`). Todo esto sigue haciendo que gestores de contraseñas lo detecten como campo "de usuario" y muestren íconos rojos como en la captura.

## Cambio

Reemplazar ese bloque por un input de texto plano, sin atributos especiales y con placeholder neutral:

```tsx
<Field label="Perfil de redes sociales">
  {/* Fuente: markets.organizer_instagram del registro editado. Campo de texto libre. */}
  <Input
    type="text"
    placeholder="Información de contacto adicional"
    {...register("organizer_instagram")}
  />
</Field>
```

Se eliminan: `autoComplete="off"`, `data-lpignore`, `data-1p-ignore`, `data-form-type`, `readOnly` + `onFocus`, el `<div data-lpignore>` envolvente, los atributos `name`/`id` falsos y el placeholder `@usuario` (que sugería handle de redes sociales).

## Fuera de alcance

- No se renombra la etiqueta visual ni la columna de DB (`organizer_instagram` sigue siendo el campo en la base de datos; solo cambia su UX a texto libre).
- No se tocan los otros campos del organizador (nombre, teléfono, email) ni nada del diseño.
- No se modifica validación, guardado, ni el formulario público `SubmitMarketForm`.
