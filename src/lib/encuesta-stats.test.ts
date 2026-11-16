import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import { computeDashboard, segment, signalOf, pays, grupo, type EncuestaRow } from "./encuesta-stats";

const base: EncuestaRow = {
  origen: "ig", frecuencia: "1_mes", cantidad_mercados: "1", gasto: "15_30", categorias: ["comida"],
  lealtad: "a_veces", descubrimiento: ["rutamercado"], motivadores: ["descuentos"], precio_maximo: "24",
  intencion_24: "no", plan: null, dudas: null, region: "metro", edad: "25_34", sexo: "mujer",
  consentimiento_email: false, email_momento: null,
};
const r = (o: Partial<EncuestaRow>) => ({ ...base, ...o });

describe("encuesta-stats", () => {
  it("pagarían $24 = plan anual o mensual", () => {
    strictEqual(pays(r({ plan: "anual" })), true);
    strictEqual(pays(r({ plan: "mensual" })), true);
    strictEqual(pays(r({ plan: "ninguno" })), false);
  });
  it("lo están pensando = no_se o plan ninguno", () => {
    strictEqual(grupo(r({ intencion_24: "no_se" })), "tal");
    strictEqual(grupo(r({ plan: "ninguno" })), "tal");
    strictEqual(grupo(r({})), "no");
  });
  it("umbrales de señal 15% y 8%", () => {
    strictEqual(signalOf(0.15), "fuerte");
    strictEqual(signalOf(0.1), "moderada");
    strictEqual(signalOf(0.08), "moderada");
    strictEqual(signalOf(0.079), "debil");
  });
  it("más interés exige al menos 15 personas", () => {
    const rows = [
      ...Array.from({ length: 14 }, () => r({ edad: "18_24", plan: "anual" })),
      ...Array.from({ length: 15 }, (_, i) => r({ edad: "35_44", plan: i < 3 ? "anual" : null })),
    ];
    strictEqual(segment(rows, "edad", false).best?.key, "35_44");
  });
  it("gasto promedio usa puntos medios", () => {
    const d = computeDashboard([r({ gasto: "menos_15" }), r({ gasto: "mas_80" })]);
    strictEqual(d.tiles.gasto, 55);
  });
});

import { filterRows } from "./encuesta-stats";
it("filterRows: solo completas, sin pruebas, versión y canal desde source", () => {
  const base = { origen: "directo" } as never;
  const rows = [
    { ...(base as object), source: "qr", survey_version: "v2", is_test: false, completed: true },
    { ...(base as object), source: "qr", survey_version: "v2", is_test: true, completed: true },
    { ...(base as object), source: "qr", survey_version: "v2", is_test: false, completed: false },
    { ...(base as object), source: null, survey_version: "v1", is_test: false, completed: true },
  ] as never[];
  const v2 = filterRows(rows, { version: "v2", showTest: false });
  strictEqual(v2.length, 1);
  strictEqual(v2[0].origen, "qr");
  strictEqual(filterRows(rows, { version: "v2", showTest: true }).length, 2);
  strictEqual(filterRows(rows, { version: "todas", showTest: false }).length, 2);
});

import { plural, topMesas } from "./encuesta-stats";
it("plural: 1 persona / 2 personas", () => {
  strictEqual(plural(1, "persona", "personas"), "persona");
  strictEqual(plural(2, "persona", "personas"), "personas");
  strictEqual(plural(0, "persona", "personas"), "personas");
});
it("topMesas cuenta menciones sin importar mayúsculas ni acentos", () => {
  const r = topMesas(["Café Nativo, Finca Luz", "cafe nativo y Otra"]);
  strictEqual(r[0].n, 2);
  strictEqual(r.length, 3);
});

import { wilson, fmtProp, fmtVal } from "./encuesta-stats";
it("wilson: 2 de 3 → rango 21–94%", () => {
  const [lo, hi] = wilson(2, 3);
  strictEqual(Math.round(lo * 100), 21);
  strictEqual(Math.round(hi * 100), 94);
  strictEqual(fmtProp(2, 3), "2 de 3 · rango 21–94%");
});
it("con n<30 muestra conteo; con n>=30 porcentaje", () => {
  strictEqual(fmtVal(10, 29), "10 de 29");
  strictEqual(fmtVal(15, 30), "50%");
});
it("segment junta grupos con menos de 5 en 'Otros (n<5)'", () => {
  const rows = [
    ...Array.from({ length: 6 }, () => ({ ...base, edad: "25_34" })),
    ...Array.from({ length: 2 }, () => ({ ...base, edad: "65_mas" })),
    ...Array.from({ length: 1 }, () => ({ ...base, edad: "18_24" })),
  ];
  const g = segment(rows, "edad", true).groups;
  strictEqual(g.length, 2);
  strictEqual(g[1].label, "Otros (n<5)");
  strictEqual(g[1].n, 3);
});

import { computeMetricas, ahorroAnual, compradorCalificado, precioInconsistente, frecuenciaContradictoria, median, type EncuestaRow as ER } from "./encuesta-stats";
const base = (o: Partial<ER>): ER => ({ origen: null, frecuencia: "1_mes", cantidad_mercados: "1", gasto: "31_50", categorias: [], lealtad: null, descubrimiento: [], motivadores: [], precio_maximo: "36", intencion_24: "seguro", plan: null, dudas: null, region: null, edad: null, sexo: null, consentimiento_email: true, email_momento: null, email_confirmed: true, ...o });
describe("métricas superiores", () => {
  it("comprador calificado exige intención positiva, precio ≥ $24 y correo confirmado", () => {
    expect(compradorCalificado(base({}))).toBe(true);
    expect(compradorCalificado(base({ email_confirmed: false }))).toBe(false);
    expect(compradorCalificado(base({ precio_maximo: "18" }))).toBe(false);
    expect(compradorCalificado(base({ intencion_24: "seguro", intencion_24_despues: "no" }))).toBe(false);
  });
  it("ahorro anual = gasto × visitas al año × 10%", () => {
    expect(ahorroAnual(base({ gasto: "31_50", frecuencia: "1_mes" }))).toBeCloseTo(48);
    expect(ahorroAnual(base({ gasto: "mas_80", frecuencia: "casi_nunca" }))).toBeCloseTo(24);
  });
  it("intención ponderada usa los factores dados, sin contar a quien no vio la pregunta", () => {
    const rows = [base({ intencion_24: "seguro" }), base({ intencion_24: "probable_si" }), base({ precio_maximo: "24", intencion_24: null })];
    expect(computeMetricas(rows, { seguro: 0.75, probable: 0.25 }).ponderada.v).toBeCloseTo(0.5);
    expect(computeMetricas(rows, { seguro: 1, probable: 0 }).ponderada.v).toBeCloseTo(0.5);
  });
  it("efecto del ahorro cuenta quienes subieron", () => {
    const m = computeMetricas([base({ intencion_24: "no_se", intencion_24_despues: "probable_si" }), base({ intencion_24: "seguro", intencion_24_despues: "seguro" })], { seguro: 0.75, probable: 0.25 });
    expect(m.efecto).toEqual({ antesK: 1, despuesK: 2, subieron: 1, n: 2 });
  });
  it("calidad de datos", () => {
    expect(precioInconsistente(base({ precio_maximo: "36", intencion_24: "no_se" }))).toBe(true);
    expect(precioInconsistente(base({ precio_maximo: "18", intencion_24: "no" }))).toBe(false);
    expect(frecuenciaContradictoria(base({ frecuencia: "casi_nunca", cantidad_mercados: "4_6" }))).toBe(true);
    const m = computeMetricas([base({ started_at: "2026-01-01T00:00:00Z", completed_at: "2026-01-01T00:00:29Z" }), base({ started_at: "2026-01-01T00:00:00Z", completed_at: "2026-01-01T00:00:30Z" })], { seguro: 0.75, probable: 0.25 });
    expect(m.calidad.rapidas).toBe(1);
  });
  it("mediana", () => { expect(median([10, 100, 22])).toBe(22); expect(median([10, 22])).toBe(16); });
});
