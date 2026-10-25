# Fase 1 de 4 — Base de la encuesta pública (solo datos y servidor)

Sin páginas, componentes, rutas ni estilos. No se toca ninguna otra tabla.

## 1. Tabla de respuestas
Se crea `encuesta_respuestas` exactamente con el SQL indicado (columnas, `id_respuesta` único, GRANTs a authenticated/service_role, RLS activo, lectura solo para administradores con `private.has_role` — que ya existe — y trigger `set_updated_at`). Sin políticas de escritura pública: escribe solo el servidor.

## 2. Funciones de servidor (`src/lib/encuesta.functions.ts`)
- **submitEncuesta** (pública, POST): validación zod con las listas exactas de valores, límites de arrays (categorías 3, descubrimiento 2, motivadores 3), email trim/minúsculas; si no hay consentimiento, email = null. Upsert por `id_respuesta` que actualiza la fila existente.
- **listEncuestaRespuestas** (admin, GET): todas las columnas excepto `email` + conteo de filas con email.
- **exportListaEspera** (admin, GET): `email, email_momento, completada_en, plan` con consentimiento y email no nulo, ordenado por `completada_en` desc.

## 3. Verificación
- Confirmar tabla y RLS con consulta.
- Llamar submitEncuesta sin sesión: válido guarda; valor fuera de lista se rechaza.
- Segundo submit con mismo `id_respuesta` actualiza (sigue 1 fila).
- Revisar que la selección de listEncuestaRespuestas no incluye email.
- Tipos regenerados automáticamente con la migración.
- Borrar las filas de prueba al final.
