import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { STEPS, type Answers } from "../components/encuesta/steps";
import { estimatedAnnualSavings, surveyRedirectTarget, PRECIO_MENSUAL } from "./encuesta-model";
import { ahorroAnual, CALIDAD_REGLAS, segment, type EncuestaRow } from "./encuesta-stats";

const answers = (before: string, after?: string): Answers => ({ origen: "directo", id_respuesta: "prueba", dispositivo: "movil", iniciada_en: "2026-11-16T00:00:00Z", precio_maximo: "36", intencion_24: before, intencion_24_despues: after });
const shown = (id: string, a: Answers) => STEPS.find((s) => s.id === id)?.when?.(a);
const row = (values: Partial<EncuestaRow>): EncuestaRow => ({ origen: null, frecuencia: null, cantidad_mercados: null, gasto: null, categorias: [], lealtad: null, descubrimiento: [], motivadores: [], precio_maximo: null, intencion_24: null, plan: null, dudas: null, region: null, edad: null, sexo: null, consentimiento_email: false, email_momento: null, ...values });
describe("saltos de encuesta v2", () => {
  it("frenos depende de la intención antes, incluso si después cambia", () => {
    for (const before of ["probable_si", "no_se", "probable_no"]) assert.equal(shown("dudas", answers(before, "seguro")), true);
    for (const before of ["seguro", "no"]) assert.equal(shown("dudas", answers(before, "probable_si")), false);
  });
  it("plan exige intención positiva después o antes si no hay después", () => {
    for (const positive of ["seguro", "probable_si"]) assert.equal(shown("plan", answers(positive)), true);
    for (const negative of ["no_se", "probable_no", "no"]) assert.equal(shown("plan", answers("seguro", negative)), false);
    assert.equal(shown("plan", { ...answers(""), intencion_24: undefined }), false);
    assert.equal(shown("plan", answers("no_se", "probable_si")), true);
  });
  it("mensual cuesta 2.99 y 35.88 al año", () => {
    assert.equal(PRECIO_MENSUAL, 2.99);
    assert.equal(Number((PRECIO_MENSUAL * 12).toFixed(2)), 35.88);
  });
  it("ambos alias conservan exactamente los parámetros de QR y prueba", () => {
    for (const alias of ["encuesta", "rutalover"]) assert.equal(surveyRedirectTarget(`https://rutamercadopr.com/${alias}?src=qr&m=mercado&test=1`), "/rutralover?src=qr&m=mercado&test=1");
    assert.equal(surveyRedirectTarget("https://rutamercadopr.com/rutralover?test=1"), null);
  });
  it("encuesta y panel calculan 4.80 al año para gasto de 10 y cada 2–3 meses", () => {
    const row = { gasto: "menos_15", frecuencia: "2_3_meses" } as EncuestaRow;
    assert.ok(Math.abs((estimatedAnnualSavings(row.gasto, row.frecuencia) ?? 0) - 4.8) < 1e-9);
    assert.equal(estimatedAnnualSavings(row.gasto, row.frecuencia), ahorroAnual(row));
    assert.ok((ahorroAnual(row) ?? Infinity) < 24);
  });
  it("cada alerta selecciona las mismas respuestas que su conteo", () => {
    const rows = [row({ precio_maximo: "18", intencion_24: "seguro" }), row({ precio_maximo: "36", intencion_24: "no_se" }), row({ frecuencia: "fines_semana", cantidad_mercados: "0" })];
    assert.deepEqual(CALIDAD_REGLAS.map((r) => rows.filter(r.matches).length), [1, 1, 0, 0, 1]);
  });
  it("segmentos cuentan comprador calificado, no selección de plan", () => {
    const rows = [{ edad: "25_34", plan: "anual", precio_maximo: "18", intencion_24: "seguro", email_confirmed: true }, { edad: "25_34", plan: null, precio_maximo: "24", intencion_24: "probable_si", email_confirmed: true }] as EncuestaRow[];
    assert.equal(segment(rows, "edad", false).groups[0]?.payK, 1);
  });
});