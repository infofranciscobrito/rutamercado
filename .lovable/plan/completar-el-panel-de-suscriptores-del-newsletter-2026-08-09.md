# Completar el panel de Suscriptores del newsletter

La sección ya existe en el panel admin (protegida por el mismo control de acceso que submissions y negocios) con tabla y exportación CSV. Faltan cuatro cosas del pedido: los contadores, el buscador, el orden por fecha y el nombre del mercado.

## Qué se añade

1. **Contador principal**
   - Número grande: total de suscriptores activos (estado `activo`).
   - Sub-datos: "nuevos esta semana" (últimos 7 días) y "nuevos este mes" (últimos 30 días).
   - Usa las mismas tarjetas KPI que ya usan las otras secciones del panel.

2. **Buscador por correo**
   - Input simple encima de la tabla, filtra en vivo por texto contenido en el correo.
   - Mismo estilo de input que el resto del panel.

3. **Orden por fecha**
   - Encabezado "Fecha" clicable para alternar más reciente / más antiguo.
   - Por defecto: más reciente primero (ya es el orden actual).

4. **Nombre del mercado en vez del slug**
   - Hoy la columna "Mercado" muestra el slug. Se resuelve el nombre real del mercado desde la tabla de mercados y se muestra el nombre; si el mercado ya no existe, se deja el slug.

5. **CSV listo para importar**
   - Columnas con nombres claros y estables: `email`, `origen`, `mercado`, `fecha_suscripcion` (formato ISO `YYYY-MM-DD`), sin columnas internas.
   - Exporta la lista completa, no solo lo filtrado por el buscador.

## Detalles técnicos

- `src/lib/newsletter.functions.ts`: la función de listado (autenticada) devuelve además el nombre del mercado asociado y el resumen de conteos (total activos, últimos 7 y 30 días), calculados en el servidor.
- `src/routes/_admin/admin.newsletter.tsx`: añade las tarjetas KPI, el input de búsqueda y el orden alternable; sigue usando el mismo componente de tabla compartido del panel.
- Sin cambios en el bloque público de suscripción, ni en el Hero, ni en el registro de negocios. Sin integraciones de email.
