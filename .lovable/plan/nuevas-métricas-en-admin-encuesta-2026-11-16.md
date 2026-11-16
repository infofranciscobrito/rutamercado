# Nuevas métricas en /admin/encuesta

## Cambio en la encuesta (para medir "antes vs después")
- Después de la pregunta "Si costara $24 al año…", se muestra el cálculo de ahorro personalizado (con su gasto y frecuencia) y se repite la misma pregunta de intención.
- Solo la ve quien vio la primera pregunta de intención (no "No pagaría nada" ni "Hasta $24").
- La pregunta "¿Qué plan escogerías?" pasa a depender de la respuesta "después".
- El cálculo de ahorro de la pantalla final se mantiene igual.
- Las métricas de antes/después solo cuentan respuestas nuevas (las anteriores no tienen "después").

## Métricas nuevas (parte superior del panel, en este orden)
Todas: solo respuestas completas, no de prueba, de la versión filtrada; con "n = X" y las reglas ya existentes (conteos si n<30, rango Wilson).

1. **Comprador calificado (titular)**: intención "después" (o "antes" si no hay) = seguro o probablemente sí, Y precio máximo ≥ $24, Y correo confirmado. Quien escogió "Hasta $24" queda fuera del cálculo de intención.
2. **Intención ponderada**: factor A × % seguro + factor B × % probablemente sí. Factores editables (0.75 / 0.25 por defecto) en un pequeño cuadro de configuración del panel, guardado para todos los admins.
3. **% que acepta el precio**: precio máximo ≥ $24.
4. **Efecto del cálculo de ahorro**: % seguro + probablemente sí antes vs después, y cuántas personas subieron de categoría.
5. **La membresía se paga sola**: ahorro anual = gasto por visita × visitas al año × 10%. % con ahorro ≥ $24 y ahorro mediano. Nota: "Supone que todo su gasto es en Mesas Aliadas".
6. **Freno principal**: distribución de "¿Qué es lo que más te haría dudar?" con n de quienes la vieron, y lista de respuestas "Otra".
7. **Calidad de datos**:
   - Precio inconsistente: precio ≥ $36 pero responde "No sé", "Probablemente no" o "No" a $24.
   - Completadas en menos de 30 segundos.
   - Frecuencia "cada 2–3 meses" o "casi nunca" con 4+ mercados distintos en 3 meses.

## Gasto
- Mediana y promedio por visita. Nota: "Calculado con el punto medio de cada rango; 'Más de $80' = $100".
- Junto al gasto mensual: "Promedio del gasto mensual de cada persona (gasto × frecuencia)".

## Mesas favoritas
- Lista de nombres mencionados (separados por comas, sin distinguir mayúsculas/acentos) con conteo, de mayor a menor.

## Detalles técnicos
- Migración: columna `intencion_24_despues` en `encuesta_respuestas`; tabla `encuesta_config` (una fila, pesos A/B) con lectura/escritura solo admin (`has_role`) y GRANTs.
- `steps.ts`: nuevo paso tipo "ahorro + intención"; `EncuestaApp.tsx` y `encuesta.functions.ts` guardan el nuevo campo (también en CSV completo).
- `encuesta-stats.ts`: funciones puras para cada métrica (mediana, ahorro anual, ponderada, calidad, mesas) con pruebas en `encuesta-stats.test.ts` usando valores concretos (p. ej. umbral $24, 30 s, 10%, $100).
- `admin.encuesta.tsx`: bloque superior nuevo y editor de pesos.
- Verificación: pruebas, recorrido de prueba con `?test=1` y panel visto como admin.
