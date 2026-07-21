## Objetivo

Enviar un correo automático a **rutamercadopr@gmail.com** cada vez que ocurra uno de estos eventos:

1. Registro de productor (`/productores` → formulario)
2. Registro de negocio (`/negocios` → formulario)
3. Formulario de contacto (footer)
4. Envío de mercado (`/mercados` → formulario)

## Estado actual

- **Productores** y **Negocios** ya envían correo con Resend a `productores@rutamercadopr.com` (usando `RESEND_API_KEY` ya configurado).
- **Contacto** y **Envío de mercado** guardan en base de datos pero **no envían notificación**.

## Cambios

Añadir/actualizar el envío de correo (Resend, mismo patrón try/catch no bloqueante ya usado) en los 4 handlers de servidor. Todos los correos irán al buzón único **rutamercadopr@gmail.com** (dejo de usar `productores@rutamercadopr.com`).

### 1. `src/lib/producer-registration.functions.ts`
Cambiar destinatario `to: ["productores@rutamercadopr.com"]` → `to: ["rutamercadopr@gmail.com"]`. Asunto: `Nuevo registro de productor — {nombre}`.

### 2. `src/lib/emprendedores.functions.ts` (registro de negocio)
Cambiar destinatario a `rutamercadopr@gmail.com`. Asunto: `Nuevo registro de negocio — {nombre_negocio}`. Cuerpo con los campos públicos + resumen de los internos.

### 3. `src/lib/contact.functions.ts` (`submitContactMessage`)
Añadir bloque Resend después del insert. Asunto: `Nuevo mensaje de contacto — {name}`. Cuerpo con nombre, rol, email, teléfono y mensaje. Envío no bloqueante (try/catch, log a consola si falla).

### 4. `src/lib/submissions.functions.ts` (`createMarketSubmission`)
Añadir bloque Resend después del insert. Asunto: `Nuevo mercado sometido — {name}`. Cuerpo con nombre, categoría, región, municipio, dirección, horario, recurrencia, organizador (nombre/teléfono/email/IG), y URL de imagen si existe.

## Detalles técnicos

- Remitente: `RutaMercado <productores@rutamercadopr.com>` (dominio ya verificado en Resend).
- Sin nuevos secretos: reusa `process.env.RESEND_API_KEY`.
- Envío envuelto en try/catch para que un fallo de Resend nunca rompa la operación principal (insert en DB).
- Solo texto plano (`text` field), consistente con las notificaciones existentes.
- Sin migraciones ni cambios de UI.

## Fuera de alcance

- No se cambia el flujo de aprobación admin ni las plantillas visuales.
- No se implementa la infraestructura de Lovable Emails (queue/reintentos); se mantiene el patrón simple de Resend que ya está en producción.
