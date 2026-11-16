# Mesas Aliadas RutaLover en el Registro de negocios

No se crean páginas ni rutas nuevas. Solo se cambia el formulario público que ya existe y la vista "Registro de negocios" del admin.

## 1. Formulario público (al final, sección opcional "Mesas Aliadas RutaLover")
- a. "¿Ofrecerías un descuento a miembros de RutaLover a cambio de más visitas?": Sí / Tal vez / No.
- b. Solo si contesta Sí o Tal vez: "¿Qué descuento podrías ofrecer?": 5% / 10% / 15% / Otro tipo de oferta (con texto).
- c. Solo si contesta Sí o Tal vez: "¿Qué necesitarías para participar?" (escoge hasta 3):
  - Visibilidad en RutaMercado
  - Que no me cueste nada
  - Material para la mesa
  - Ver resultados de ventas
  - Otro (con texto)
- d. Solo si contesta Sí: "¿Quieres ser Mesa Aliada Fundadora?": Sí / No.
- Nada de esta sección es obligatorio y no bloquea el envío.
- Si se cambia la respuesta de la primera pregunta, las respuestas que ya no aplican se borran.

## 2. Datos
- Columnas nuevas en la misma tabla de negocios:
  - `discount_willing`
  - `discount_offer`
  - `discount_offer_other`
  - `participation_needs` (lista)
  - `wants_founder` (sí/no)
  - `is_test` (para el modo prueba; los registros actuales quedan como no prueba)
- Los registros existentes quedan vacíos en los campos nuevos.

## 3. Admin (/admin/emprendedores)
- **Resumen arriba:**
  - Negocios que respondieron la sección.
  - % dispuesto (Sí + Tal vez).
  - Descuento más común.
  - Necesidades principales con conteo.
- **Contador:** "X de 25 Mesas Aliadas Fundadoras" (cuenta los que quieren ser Fundadora).
- **Filtro:** interruptor "Solo interesados en ser Fundadora", junto a la búsqueda actual.
- **CSV:** las columnas nuevas salen en la exportación actual.
- **Edición manual:** en el panel de editar negocio, nueva sección "Mesas Aliadas RutaLover" con los mismos campos. Así el admin puede llenar lo que le digan en persona.

## 4. Modo prueba
- Si la página del formulario abre con `?test=1`, el registro se guarda marcado como prueba.
- Los registros de prueba no cuentan en el resumen, en el contador de Fundadoras ni en las analíticas o badges de pendientes.
- En la lista del admin llevan una etiqueta "Prueba".
- No aparecen en el directorio público aunque se aprueben.

## Detalles técnicos
- **Migración:** `ALTER TABLE emprendedores` añade las columnas, con restricciones `CHECK` para los valores permitidos y un máximo de 3 necesidades. `is_test` es `boolean NOT NULL DEFAULT false`.
- **`emprendedores.functions.ts`:**
  - Validación Zod opcional de los campos nuevos.
  - Al guardar se descartan los campos que no aplican según la respuesta de la primera pregunta.
  - Se recibe `is_test`.
  - El listado público filtra `is_test = false`.
- **`RegisterEmprendedorForm.tsx`:** la sección nueva al final, y lectura de `?test=1` después de cargar la página.
- **`admin-emprendedores.functions.ts`:**
  - El listado, la creación/edición y la exportación incluyen los campos nuevos.
  - Los conteos y las analíticas excluyen `is_test`.
- **`admin.emprendedores.tsx`:**
  - Resumen y contador.
  - Filtro de Fundadoras.
  - Columnas del CSV.
  - Campos en el panel de edición.
- **Pruebas:** función pura del resumen y la limpieza de campos, con valores concretos:
  - "No" borra descuento, necesidades y Fundadora.
  - "Tal vez" borra Fundadora.
  - Los registros de prueba se excluyen.
  - El máximo de necesidades es 3.
- **Verificación:** enviar un registro con `?test=1` en el formulario y confirmar que aparece en el admin como prueba y fuera de los conteos. Después se borra.
