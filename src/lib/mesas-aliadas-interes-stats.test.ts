import { describe, it } from "node:test";
import assert from "node:assert";
import { filtrar, resumen, conteo, descuentoInteresados, porDia, whatsappUrl, type InteresRow } from "./mesas-aliadas-interes-stats";

const row = (o: Partial<InteresRow>): InteresRow => ({
  is_test: false, completada_en: "2026-11-19T15:00:00Z", categoria: "comida", frecuencia: "2_3",
  ticket: "10_25", descuento: "10", recibir: ["nuevos"], interes: "si", tipo: "con_contacto", origen: "directo", negocio: "Mesa ejemplo", ...o,
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

import { embudo as _embudo, cruce as _cruce } from "./mesas-aliadas-interes-stats";
describe("embudo y cruce", () => {
  const base = { is_test: false, completada_en: null, categoria: "comida", frecuencia: "2_3", ticket: "10_25", descuento: "10", recibir: [], origen: "directo" };
  const rows: InteresRow[] = [
    { ...base, interes: "si", tipo: "con_contacto", email: "prueba@example.com" },
    { ...base, interes: "info", tipo: "anonima", categoria: "ropa", descuento: "5" },
    { ...base, interes: "no", tipo: "anonima" },
    { ...base, interes: "no", tipo: "anonima" },
  ];
  it("embudo calcula conversión paso a paso", () => {
    const e = _embudo(rows);
    assert.deepStrictEqual(e.map((p) => p.c), [4, 2, 1]);
    assert.strictEqual(e[1].pctPrev, 0.5);
    assert.strictEqual(e[2].pctTotal, 0.25);
  });
  it("cruce cuenta categoría × descuento", () => {
    const c = _cruce(rows, "categoria", "descuento");
    assert.strictEqual(c.filas[0].key, "comida"); assert.deepStrictEqual(c.filas[0].valores, [0, 3]);
    assert.deepStrictEqual(c.cols.map((x) => x.key), ["5", "10"]);
    assert.deepStrictEqual(c.totales, [1, 3]);
    assert.strictEqual(c.total, 4);
    assert.strictEqual(c.filas[0].total, 3);
  });
  it("el contacto de info pertenece al tercer paso y nunca supera el anterior", () => {
    const e = _embudo([row({ interes: "si" }), row({ interes: "info", email: "a@example.com" }), row({ interes: "info", telefono: "7875551234" }), row({ interes: "no" })]);
    assert.deepStrictEqual(e.map((p) => p.c), [4, 3, 3]);
    assert.strictEqual(e[2].pctPrev, 1);
    assert.ok(e.every((p) => p.pctPrev <= 1));
  });
  it("sin negocio, instagram, correo ni teléfono no cuenta como contacto", () => {
    const r = resumen([row({ negocio: "  ", instagram: null, email: null, telefono: null })]);
    assert.strictEqual(r.conContacto, 0);
    assert.strictEqual(r.interesadosSinContacto, 1);
    assert.strictEqual(r.pctContactoInteresados, 0);
  });
  it("un contacto negativo no entra al subconjunto de interesados", () => {
    assert.strictEqual(resumen([row({ interes: "no" })]).conContacto, 0);
  });
  it("WhatsApp usa país 1 y rechaza números incompletos", () => {
    assert.strictEqual(whatsappUrl("(787) 555-1234"), "https://wa.me/17875551234");
    assert.strictEqual(whatsappUrl("+1 939 555 1234"), "https://wa.me/19395551234");
    assert.strictEqual(whatsappUrl("123"), null);
  });
});
