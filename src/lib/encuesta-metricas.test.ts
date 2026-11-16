import { describe, it } from "node:test";
import assert from "node:assert";
import { computeMetricas, ahorroAnual, compradorCalificado, precioInconsistente, frecuenciaContradictoria, median, type EncuestaRow as ER } from "./encuesta-stats";
const base = (o: Partial<ER>): ER => ({ origen: null, frecuencia: "1_mes", cantidad_mercados: "1", gasto: "31_50", categorias: [], lealtad: null, descubrimiento: [], motivadores: [], precio_maximo: "36", intencion_24: "seguro", plan: null, dudas: null, region: null, edad: null, sexo: null, consentimiento_email: true, email_momento: null, email_confirmed: true, ...o });
describe("métricas superiores", () => {
  it("comprador calificado exige intención positiva, precio ≥ $24 y correo confirmado", () => {
    assert.strictEqual(compradorCalificado(base({})), true);
    assert.strictEqual(compradorCalificado(base({ email_confirmed: false })), false);
    assert.strictEqual(compradorCalificado(base({ precio_maximo: "18" })), false);
    assert.strictEqual(compradorCalificado(base({ intencion_24: "seguro", intencion_24_despues: "no" })), false);
  });
  it("ahorro anual = gasto × visitas al año × 10%", () => {
    assert.ok(Math.abs((ahorroAnual(base({ gasto: "31_50", frecuencia: "1_mes" })) ?? NaN) - 48) < 1e-9);
    assert.ok(Math.abs((ahorroAnual(base({ gasto: "mas_80", frecuencia: "casi_nunca" })) ?? NaN) - 24) < 1e-9);
  });
  it("intención ponderada usa los factores dados, sin contar a quien no vio la pregunta", () => {
    const rows = [base({ intencion_24: "seguro" }), base({ intencion_24: "probable_si" }), base({ precio_maximo: "24", intencion_24: null })];
    assert.ok(Math.abs((computeMetricas(rows, { seguro: 0.75, probable: 0.25 }).ponderada.v ?? NaN) - 0.5) < 1e-9);
    assert.ok(Math.abs((computeMetricas(rows, { seguro: 1, probable: 0 }).ponderada.v ?? NaN) - 0.5) < 1e-9);
  });
  it("efecto del ahorro cuenta quienes subieron", () => {
    const m = computeMetricas([base({ intencion_24: "no_se", intencion_24_despues: "probable_si" }), base({ intencion_24: "seguro", intencion_24_despues: "seguro" })], { seguro: 0.75, probable: 0.25 });
    assert.deepStrictEqual(m.efecto, { antesK: 1, despuesK: 2, subieron: 1, n: 2 });
  });
  it("calidad de datos", () => {
    assert.strictEqual(precioInconsistente(base({ precio_maximo: "36", intencion_24: "no_se" })), true);
    assert.strictEqual(precioInconsistente(base({ precio_maximo: "18", intencion_24: "no" })), false);
    assert.strictEqual(frecuenciaContradictoria(base({ frecuencia: "casi_nunca", cantidad_mercados: "4_6" })), true);
    const m = computeMetricas([base({ started_at: "2026-01-01T00:00:00Z", completed_at: "2026-01-01T00:00:29Z" }), base({ started_at: "2026-01-01T00:00:00Z", completed_at: "2026-01-01T00:00:30Z" })], { seguro: 0.75, probable: 0.25 });
    assert.strictEqual(m.calidad.rapidas, 1);
  });
  it("mediana", () => { assert.strictEqual(median([10, 100, 22]), 22); assert.strictEqual(median([10, 22]), 16); });
});
