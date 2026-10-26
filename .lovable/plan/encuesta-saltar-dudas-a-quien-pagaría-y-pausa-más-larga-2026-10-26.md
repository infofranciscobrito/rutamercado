# Encuesta: saltar "dudas" a quien pagaría y pausa más larga

## Qué cambia
1. **"¿Qué es lo que más te haría dudar?"** solo la verá quien escoja **"No pagaría nada"**. Cualquier otro precio (Hasta $12 hasta Más de $36) se la salta y sigue a zona, edad, sexo y correo.
2. **Pausa entre preguntas:** 2 segundos más en todas. Tras la reacción de MrMercado pasa de 1.5 s a 3.5 s; en zona, edad y sexo, de 0.4 s a 2.4 s.

No se toca nada más: textos, diseño, otras reglas de salto, el envío ni el admin.

## Verificación
- Tres recorridos en el preview: "No pagaría nada" → dudas; "Hasta $24" → plan → zona (sin dudas); "Hasta $36" + "Probablemente sí" → plan → zona (sin dudas).
- Medir que la espera sea unos 3.5 s y 2.4 s.
- Confirmar que cada recorrido guarda una fila y luego borrarlas.

## Detalles técnicos
- `steps.ts`: condición de `dudas` → `when: (A) => A.precio_maximo === "0"`.
- `EncuestaApp.tsx`: timeouts 380→2380 y 1500→3500 (900→2900 con movimiento reducido).
