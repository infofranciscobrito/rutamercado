# Mejorar el formulario de registro de negocios

Objetivo: evitar regiones equivocadas y que se publiquen mensajes personales en la descripción del perfil.

## 1. Municipio y región
- El campo libre "Municipio base" pasa a ser una lista con los 78 municipios de Puerto Rico.
- Se quita la lista de región. La región sale sola según el municipio y se muestra debajo como texto que no se puede editar, por ejemplo "Región: Este".
- Uso exactamente la tabla que enviaste (Metro, Norte, Oeste, Sur, Este, Centro). Verifiqué que suma los 78 municipios y que las regiones son las mismas que usa el sitio.
- Al enviar el registro, el servidor revisa que el municipio esté en la lista y vuelve a calcular la región. No confía en lo que manda el navegador.

## 2. Separar lo público de lo privado
- Bloque **"Tu perfil público (lo verán los organizadores)"**: nombre, logo, descripción, categoría, municipio, mercados, Instagram, email, teléfono y persona de contacto.
- Bloque **"Preguntas internas (no se publican)"**: tiempo operando, registro de comerciante, fuente de ingreso, canales de venta y tamaño del equipo.
- Ayuda debajo de la descripción: "Se publica tal cual en tu perfil. Describe tu negocio y tus productos; no escribas aquí un mensaje para nosotros."
- Nueva etiqueta de mercados: "Mercados donde has participado (se publica en tu perfil)".
- La pregunta de artesano (hoy junto a la categoría) se queda en el bloque público, en el mismo lugar.

## 3. Mensaje privado
- Campo opcional al final del bloque interno: "¿Algo que quieras decirnos? (privado, no se publica)", con un máximo de 500 caracteres.
- Se guarda con el registro y se incluye en el email de aviso.
- No aparece en el directorio público. Solo se ve en el admin de emprendedores.

## Qué no cambia
- Los registros que ya existen no se modifican; sus regiones actuales se quedan como están.
- Las tarjetas y perfiles del directorio no cambian.

## Detalles técnicos
- Nuevo `src/lib/municipios.ts`: `MUNICIPIOS_POR_REGION`, `MUNICIPIOS` (ordenados) y `regionDeMunicipio()`. Se puede importar desde el navegador.
- Migración: `ALTER TABLE public.emprendedores ADD COLUMN mensaje_privado text;`. Después se regeneran los tipos.
- `emprendedores.functions.ts`:
  - `submitEmprendedor` recibe `municipio` validado contra `MUNICIPIOS` y `mensaje_privado` (opcional, ≤500).
  - Calcula `region` en el servidor e ignora la que envíe el cliente.
  - Añade el mensaje al email de Resend.
  - `listEmprendedores` no cambia.
- `RegisterEmprendedorForm.tsx`: reorganizar los bloques, usar la lista de municipios y mostrar la región calculada.
- `admin.emprendedores.tsx`: mostrar `mensaje_privado` (solo lectura) en la ficha.
- Pruebas para `regionDeMunicipio`: 78 municipios, ejemplos como Caguas → Centro y Vieques → Este, y un municipio inválido → null.
