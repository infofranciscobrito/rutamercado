# Relajar validación del campo "Página web"

## Problema
El campo `website` está validado con `z.string().url()` en dos servidores, lo que rechaza valores como emails u otros textos (ej. `info.franciscobrito@gmail.com`).

## Cambios

### 1. `src/lib/admin-producers.functions.ts`
Reemplazar el helper estricto `optUrl(500)` (que usa `z.string().url()`) por el helper de texto libre ya existente `optText(500)` para el campo `website` dentro de `UpsertSchema`. Esto permite que el admin guarde cualquier texto (URL, handle, email, vacío) sin error y sigue limitando longitud a 500 caracteres. No se elimina `optUrl` para no tocar otros usos.

### 2. `src/lib/producer-registration.functions.ts`
En `RegisterSchema`, cambiar el `website` de `z.union([z.string().url().max(500), z.null()])` a `z.union([z.string().max(500), z.null()])`. Mantiene el preprocess que normaliza vacío → null. El formulario público sigue funcionando, solo deja de exigir formato URL.

## Lo que NO se toca
- Otros campos y validaciones (email sigue validado como email).
- UI del formulario público y del dashboard.
- Dato existente en la base — el admin podrá editarlo manualmente; al cargar el productor el valor se mostrará tal cual y se podrá guardar sin error.
