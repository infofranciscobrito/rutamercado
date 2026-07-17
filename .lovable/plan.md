## Problema

`src/routes/emprendedores.tsx` es una ruta hoja que renderiza el directorio completo sin `<Outlet />`. Al existir también `src/routes/emprendedores.registro.tsx`, TanStack Router trata a `emprendedores.tsx` como layout padre de `/emprendedores/registro`. Como el padre no tiene `<Outlet />`, al hacer click en el botón la URL cambia pero la página hija nunca se monta — por eso "no funciona".

## Cambios

1. **Renombrar** `src/routes/emprendedores.tsx` → `src/routes/emprendedores.index.tsx` y actualizar `createFileRoute("/emprendedores")` → `createFileRoute("/emprendedores/")`. Así `/emprendedores` y `/emprendedores/registro` quedan como hojas hermanas independientes, sin necesidad de un layout.

2. **Renombrar el botón** en el nuevo `emprendedores.index.tsx`: "Regístrate como Emprendedor" → "Registra tu negocio" (el `<Link to="/emprendedores/registro">` se mantiene igual).

3. Dejar el resto del archivo intacto (hero, filtros, grid, footer).

No se toca `emprendedores.registro.tsx` ni el formulario.

### Verificación
- Typecheck.
- Click en "Registra tu negocio" desde `/emprendedores` debe navegar y renderizar la landing.