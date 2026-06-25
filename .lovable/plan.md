## Cambios en módulo Productores

### 1. Base de datos
- Migración: limpiar valores de email que están guardados en `productores.instagram` (UPDATE ... SET instagram = NULL WHERE instagram LIKE '%@%.%' o = 'info.franciscobrito@gmail.com').
- Dejar de usar la columna `instagram` (no la dropeamos para no romper queries en caché; queda obsoleta y sin lectura/escritura desde la app).

### 2. Backend (`src/lib/producers.functions.ts`, `src/lib/admin-producers.functions.ts`)
- Quitar `instagram` del tipo `Producer` / `AdminProducer`, del SELECT de Supabase, del mapper y del schema Zod (`optText`).
- Mantener `website` como único campo de "Instagram o página web" (el valor sigue siendo una URL completa).

### 3. Admin (`src/routes/_admin/admin.producers.tsx`)
- Eliminar estado `instagram`, su input y referencias en defaults/submit/initial.
- Renombrar label del campo website a **"Instagram o página web"**, placeholder de ejemplo `https://www.instagram.com/usuario`.

### 4. Tarjeta pública (`src/components/productores/ProducerCard.tsx`)
- Eliminar bloque de Instagram handle (función `instagramHandle`, render condicional, import `Globe`).
- Para el campo `website`: usar ícono `Instagram` de lucide; mostrar el link completo limpio (sin el prefijo `https://`) y abrirlo en nueva pestaña.
- Quitar `producer.instagram` de la guardia `hasContact`.

### 5. UpdateProducerDialog
- Verificar que no envíe Instagram handle separado (revisar y, si existe, quitarlo manteniendo solo el campo URL de website renombrado en la UI a "Instagram o página web").

### Restricciones respetadas
- No se rompe el popup "Actualizar información".
- No se tocan otros campos.
- No se usa la palabra prohibida.
