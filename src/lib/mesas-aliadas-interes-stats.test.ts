import { describe, it } from "node:test";
import assert from "node:assert";
import { filtrar, resumen, conteo, descuentoInteresados, porDia, type InteresRow } from "./mesas-aliadas-interes-stats";

const row = (o: Partial<InteresRow>): InteresRow => ({
  is_test: false, completada_en: "2026-11-19T15:00:00Z", categoria: "comida", frecuencia: "2_3",
  ticket: "10_25", descuento: "10", recibir: ["nuevos"], interes: "si", tipo: "con_contacto", origen: "directo", ...o,
});

const rows = [
  row({ interes: "si", tipo: "con_contacto", descuento: "10", recibir: ["nuevos", "reporte"] }),
  row({ interes: "info", tipo: "anonima", descuento: "15", recibir: ["nuevos"] }),
  row({ interes: "no", tipo: "anonima", descuento: "5", recibir: ["rutamapa"] }),
  row({ interes: "no", tipo: "anonima", descuento: "5", recibir: ["regresan", "nuevos"] }),
  row({ interes: "si", is_test: true }),
];

describe("mesas aliadas interés stats", () => {
  it("excluye pruebas por defecto", () => {
    assert.strictEqual(filtrar(rows, { mostrarPruebas: false }).length, 4);
    assert.strictEqual(filtrar(rows, { mostrarPruebas: true }).length, 5);
  });
  it("% de interesados = sí + info", () => {
    const r = resumen(filtrar(rows, { mostrarPruebas: false }));
    assert.strictEqual(r.interesados, 2);
    assert.strictEqual(r.pctInteresados, 0.5);
    assert.strictEqual(r.cuentan, 1);
  });
  it("interesados sin contacto", () => {
    const r = resumen(filtrar(rows, { mostrarPruebas: false }));
    assert.strictEqual(r.interesadosSinContacto, 1);
    assert.strictEqual(r.pctContactoInteresados, 0.5);
  });
  it("% de recibir es sobre personas", () => {
    const items = conteo(filtrar(rows, { mostrarPruebas: false }), "recibir");
    const nuevos = items.find((i) => i.key === "nuevos")!;
    assert.strictEqual(nuevos.c, 3);
    assert.strictEqual(nuevos.pct, 0.75);
    assert.ok(items.reduce((s, i) => s + i.pct, 0) > 1);
  });
  it("descuento solo entre interesados", () => {
    const d = descuentoInteresados(filtrar(rows, { mostrarPruebas: false }));
    assert.strictEqual(d.find((i) => i.key === "5")!.c, 0);
    assert.strictEqual(d.find((i) => i.key === "10")!.c, 1);
    assert.strictEqual(d[0].n, 2);
  });
  it("porDia agrupa en hora de Puerto Rico", () => {
    const d = porDia([row({ completada_en: "2026-11-20T02:00:00Z" })], new Date("2026-11-20T12:00:00Z"));
    assert.strictEqual(d.length, 30);
    assert.strictEqual(d.find((x) => x.date === "2026-11-19")!.respuestas, 1);
  });
});
