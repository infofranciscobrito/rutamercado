# Completar la exclusión de tráfico interno y de desarrollo

La clasificación y el toggle ya existen en el código (`Excluir tráfico interno`, ON, con el `Switch` del proyecto, contador "Mostrando X de Y…"). Al revisar los datos reales de la tabla de visitas encontré por qué la URL de preview sigue apareciendo como tráfico externo: la clasificación no cubre el dominio que realmente se guarda.

## Lo que muestran los datos

Los referrers reales más frecuentes incluyen:

- `https://1181a1c8-570c-4e2f-a053-1d52a6bfde61.lovableproject.com/?...` (más de 120 visitas) — dominio **`lovableproject.com`**, que la función actual no reconoce, así que hoy cae en "Otro" / externo.
- `https://lovable.dev/` (191) — ya se clasifica como desarrollo.
- `https://rutamercadopr.com/...` — ya se clasifica como interno.

## Cambios

1. **Ampliar la clasificación** (`classifyReferrer`):
   - añadir `lovableproject.com` y cualquier subdominio `*.lovableproject.com` a `desarrollo`;
   - añadir también `sandbox.lovable.dev`, `*.lovable.app` (ya cubierto) y `0.0.0.0` / `localhost:puerto`;
   - hacer el parseo tolerante: si el referrer viene sin `https://`, normalizarlo antes de leer el host, para que un valor como `id-preview--xxx.lovable.app/mercados` también se detecte.
2. **Toggle siempre ON al cargar**: hoy la preferencia se recuerda en el navegador. Se cambia a valor inicial `true` en cada carga de la página (el usuario puede apagarlo durante la sesión, pero al recargar vuelve a ON), como pide el requisito.
3. **Tarjeta "Fuentes de tráfico"**: con el toggle en ON, las filas `interno` y `desarrollo` no aparecen ni en la lista de top referrers ni en el gráfico de categorías (comportamiento actual, que quedará correcto una vez arreglada la clasificación). Con el toggle en OFF se muestran con su etiqueta `Interno` / `Desarrollo`.

## Alcance del toggle (transparencia)

Afecta a todo lo que se alimenta de visitas de página: KPI de vistas, tráfico diario, fuentes de tráfico y actividad por página. Los clics en mercados y las intenciones de asistencia **no guardan referrer** en la base de datos, así que no pueden filtrarse; se mantiene la nota discreta que lo aclara en la tarjeta correspondiente.

## Dónde vive la clasificación (para tu verificación)

No se guarda en ninguna tabla ni columna nueva: **se calcula al leer**, en el servidor, a partir de la columna `referrer` de la tabla de visitas de página. La función `classifyReferrer(referrer)` en `src/lib/admin-analytics.functions.ts` normaliza el referrer a su host, le quita `www.`, y devuelve:

- `interno` si el host es `rutamercadopr.com`
- `desarrollo` si es `localhost`, `127.0.0.1`, `lovable.dev`, `*.lovable.dev`, `*.lovable.app`, `lovableproject.com` o `*.lovableproject.com`
- `externo` en cualquier otro caso, incluido referrer vacío (directo)

Se calcula al leer y no al guardar para no perder histórico y para que el toggle pueda apagarse y ver el dato crudo.

## Archivos tocados

- `src/lib/admin-analytics.functions.ts` — ampliar `classifyReferrer` y su normalización de host.
- `src/routes/_admin/admin.analytics.tsx` — inicializar el toggle en ON en cada carga.

Sin migraciones, sin librerías nuevas, sin cambios de diseño, y sin tocar "Vistas del directorio" ni "Actividad por página".
