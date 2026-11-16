# Semáforo, proyección y tabla por canal en /admin/encuesta

Todo usa las mismas respuestas que el panel: completas, sin pruebas y de la versión filtrada.

## 1. Semáforo (arriba, junto a "Comprador calificado")
- Con menos de 50 respuestas completas: "Faltan X respuestas para un veredicto".
- Con 50 o más:
  - **Verde:** comprador calificado ≥ 20% Y el límite inferior del rango (Wilson 95%) ≥ 10%.
  - **Amarillo:** entre 10% y 20%. Si llega a 20% pero el límite inferior queda bajo 10%, también es amarillo.
  - **Rojo:** menos de 10%.
- Se muestra el porcentaje, el rango y una frase corta del motivo.
- Los umbrales se editan en la misma configuración de los factores, guardada para todos los admins: mínimo de respuestas (50), verde (20%), límite inferior verde (10%) y amarillo (10%).

## 2. Proyección "Si 1,000 visitantes ven la oferta" (solo con 50 o más)
- **Conservador:** límite inferior de Wilson de la intención ponderada × 1,000 × $24.
- **Base:** intención ponderada × 1,000 × $24.
- Muestra compradores estimados y dinero de cada escenario.
- Nota: "Basado en intención declarada, no en ventas".
- Con menos de 50 se muestra el mismo aviso de "Faltan X respuestas".

## 3. Tabla por canal
- Una fila por canal (QR, newsletter, Instagram, directo). En QR, subfilas por mercado cuando haya uno.
- Columnas: n, % comprador calificado, intención ponderada y gasto mediano por visita.
- Siguen las reglas actuales: conteos si n < 30, y grupos de menos de 5 juntos en "Otros (n<5)".
- Nota: "Los suscriptores del newsletter suelen responder más positivo que visitantes nuevos".

## Detalles técnicos
- Migración: columnas nuevas en `encuesta_config` (`min_n`, `verde_pct`, `verde_lim_inf`, `amarillo_pct`) con valores por defecto. Se mantiene la misma RLS solo admin.
- `encuesta.functions.ts`: leer y guardar los umbrales junto con los factores, validados con Zod.
- `encuesta-stats.ts`: funciones puras `semaforo`, `proyeccion` y `porCanal`.
  - El límite inferior de la intención ponderada se calcula con Wilson sobre k = ponderada × n (n de quienes vieron la pregunta).
- Pruebas nuevas con valores concretos:
  - 49 respuestas → "faltan 1".
  - 20% con límite inferior ≥ 10% → verde; 20% con límite inferior < 10% → amarillo; 9% → rojo.
  - Base = ponderada × 1,000 × $24.
  - Agrupación de QR por mercado.
- `admin.encuesta.tsx`:
  - Tarjeta del semáforo y tarjeta de proyección.
  - Tabla por canal.
  - El editor de factores se amplía con los umbrales.
- Verificación: pruebas y el panel visto como admin.
