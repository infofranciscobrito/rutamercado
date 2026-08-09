# Excluir tráfico interno y de desarrollo en Analíticas

## Camino elegido: filtrar en la presentación, no en la captura

Recomiendo **no** cambiar la captura del evento. Razones concretas:

- Hoy `page_views` guarda el referrer tal cual y ya hay ~1,800 filas históricas. Si dejamos de registrar visitas con referrer propio, el histórico y el futuro quedan medidos con reglas distintas y ya no se pueden comparar.
- El referrer propio no siempre es "navegación interna": una visita que entra por Google a `/bazares` y luego abre una ficha de mercado sí es actividad real del sitio, y descartarla en origen pierde información que hoy sí usamos (Actividad por Página, páginas más vistas).
- Filtrando en la lectura, el toggle se puede apagar y ver el dato crudo. Es reversible; borrar en captura no lo es.

Los datos se siguen guardando completos; la sección Analíticas los clasifica y filtra al leerlos.

## Clasificación

Una función única en el servidor etiqueta cada visita a partir del referrer:

- `interno` — `rutamercadopr.com` o `www.rutamercadopr.com`
- `desarrollo` — `localhost`, `127.0.0.1`, `lovable.dev`, cualquier subdominio `*.lovable.app`
- `externo` — todo lo demás, incluyendo referrer vacío (tráfico directo)

## Alcance del toggle

Solo las métricas que se alimentan de visitas de página pueden filtrarse, porque el referrer únicamente existe en esa tabla:

- KPI "Vistas del directorio" y el total de vistas del sitio
- Gráfico de tráfico diario
- Fuentes de tráfico (categorías y top referrers)
- Actividad por página

Los clics en mercados y las intenciones de asistencia no guardan referrer, así que no cambian con el toggle. Lo indicaré con una nota discreta en la tarjeta de fuentes de tráfico para que no parezca inconsistencia.

## Interfaz

- Nuevo control "Excluir tráfico interno" en la barra de filtros superior, **activado por defecto**, usando el componente `Switch` que ya existe en el proyecto (el mismo de la sección de mercados). Sin colores, tipografías ni radios nuevos.
- La preferencia se recuerda en el navegador del admin.
- Debajo de la línea "Mostrando datos …", cuando el toggle está activo:
  `Mostrando 1,204 de 1,831 visitas totales (34% excluido por tráfico interno y de desarrollo)`.
  Con el toggle apagado se muestra solo el total.

## Detalles técnicos

Archivos tocados (nada fuera de Analíticas):

- `src/lib/admin-analytics.functions.ts`
  - Añadir `classifyReferrer(referrer)` → `"externo" | "interno" | "desarrollo"` y reutilizarla dentro de la `categorizeReferrer` existente.
  - Extender el validador de rango con `excludeInternal?: boolean`.
  - En `getAnalyticsOverview`, `getDailyTraffic`, `getTrafficSources` y `getPageActivity`: seleccionar también `referrer` y descartar en memoria las filas no `externo` cuando la bandera está activa. Cada una devuelve además `totalRaw` y `totalFiltered` para el contador.
- `src/routes/_admin/admin.analytics.tsx`
  - Estado `excludeInternal` (por defecto `true`, persistido en `localStorage`), incluido en `rangeArg` y en las `queryKey` para que refresque al cambiar.
  - `Switch` + etiqueta en la barra sticky y la línea de conteo bajo el rango de fechas.

Sin librerías nuevas, sin migraciones, sin cambios en la captura (`src/lib/analytics.functions.ts`, `src/routes/index.tsx`, `CategoryPage.tsx`).
