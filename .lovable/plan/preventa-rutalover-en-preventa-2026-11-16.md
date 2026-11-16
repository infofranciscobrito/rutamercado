# Preventa RutaLover en /preventa

## 1. Activar pagos
- Se activan los pagos integrados con Stripe de Lovable. No necesitas cuenta propia de Stripe para empezar.
- Primero se crea un modo de **prueba** para comprar sin dinero real.
- Para cobrar de verdad (**live**) tendrás que reclamar tu cuenta de Stripe más adelante.
- Stripe se encarga de todo lo de impuestos (cumplimiento completo, +3.5% por venta), con Puerto Rico como país del negocio.
- Se crea un producto "Membresía RutaLover (preventa)", con pago único de $24.

## 2. Página pública /preventa
- **Oferta:** RutaLover $24 al año, 5–15% en Mesas Aliadas, con el mismo estilo y colores de RutaMercado.
- **Mesas Aliadas Fundadoras confirmadas:** logo, nombre y municipio de cada negocio que el admin confirme, más un contador "X de 25".
- **Garantía:** "Si no lanzamos antes de [fecha], te devolvemos el 100%". La fecha se edita en el admin.
- **Botón "Reservar mi membresía – $24":** pide el correo (precargado si viene de la invitación) y lleva al pago seguro de Stripe.
- **Página de gracias** al volver del pago, y aviso si la persona canceló.
- Título, descripción y vista para compartir propios. Se añade al sitemap.

## 3. Registro de pagos
- Cada compra guarda: correo, fecha, monto, estado (pagado o reembolsado), modo prueba o real, y si vino de la lista de espera.
- La lista de espera se detecta con el enlace `?ref=waitlist&email=<código>`. El código identifica la invitación sin mostrar el correo en la URL.
- El pago se confirma solo cuando Stripe lo avisa; no basta con volver a la página.
- Las compras en modo prueba no cuentan en las métricas.

## 4. Admin
- **Registro de negocios:** botón "Confirmar Fundadora" / "Quitar" en cada negocio. Solo los confirmados salen en /preventa.
- **Encuesta (configuración):** campo para la fecha de la garantía.
- **Invitaciones:** botón "Enviar invitación de preventa" para la lista de espera (correos con consentimiento).
  - Envía a cada persona su enlace personal y la cuenta como invitada.
  - No reenvía a quien ya recibió la invitación.
  - Muestra cuántas se enviaron.
- **Tarjeta "Conversión real" en el panel de la encuesta:**
  - Conversión real = pagos (de invitados) ÷ invitaciones enviadas.
  - Al lado, la intención ponderada de la encuesta.
  - Factor real = conversión real ÷ intención ponderada (ej. "0.4 – de cada 10 que dijeron que sí, pagaron 4").
  - Muestra n y el rango de Wilson. Con menos de 30 invitaciones, conteos en vez de porcentajes.
- **Lista de compradores** con exportación CSV.

## Detalles técnicos
- Se usa `enable_stripe_payments` y luego `batch_create_product` con el código de impuesto de membresía digital. La sesión de Checkout usa `managed_payments`, en modo `payment`.
- **Migración:**
  - Tabla `preventa_pagos`: email, stripe_session_id único, amount, status, environment, from_waitlist, invite_id, created_at, paid_at.
  - Tabla `preventa_invitaciones`: email, token único, sent_at.
  - Columna `founder_confirmed` en `emprendedores`.
  - Columna `garantia_fecha` en `encuesta_config`.
  - RLS solo para admin y GRANTs. La lectura pública de Fundadoras es una función de servidor que devuelve solo los campos públicos.
- **Funciones de servidor:**
  - Crear la sesión de pago (pública, valida el correo).
  - Listar las Fundadoras confirmadas.
  - Leer la fecha de la garantía.
  - Del lado admin: enviar invitaciones (Resend, ya configurado), métricas y confirmar Fundadora.
- **Webhook de Stripe** en `/api/public/stripe-webhook`. Verifica la firma y marca pagos y reembolsos.
- Función pura `conversionReal` en `encuesta-stats.ts`, con pruebas:
  - 3 pagos / 30 invitaciones con ponderada 0.25 → conversión 10%, factor 0.4.
  - 0 invitaciones → sin dato.
- **Verificación:** compra en modo prueba con tarjeta de prueba, confirmación por el webhook, tarjeta del admin actualizada y envío de una invitación a un correo de prueba.
