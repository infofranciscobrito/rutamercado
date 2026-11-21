# Añadir opción "Artículos para mascotas" a la encuesta de Mesas Aliadas

Solo se añade una opción nueva a la pregunta "¿Qué vendes principalmente?". No se cambia nada más.

- Texto exacto de la opción: **Artículos para mascotas, (comida, accesorios)**
- Posición: antes de "Otro".
- El panel admin mostrará la categoría nueva en sus gráficas con ese mismo nombre.

## Detalles técnicos
- `MesasAliadasInteresApp.tsx`: añadir `{ v: "mascotas", l: "Artículos para mascotas, (comida, accesorios)" }` antes de `otro`.
- `mesas-aliadas-interes.functions.ts`: añadir `"mascotas"` al `z.enum` de `categoria`.
- `mesas-aliadas-interes-stats.ts`: añadir la etiqueta `mascotas` al mapa de categorías.
- La base de datos no tiene restricción sobre `categoria`; no hace falta migración.
- Verificar con un recorrido `?prueba=1` y borrar la fila de prueba.
