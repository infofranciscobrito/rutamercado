import { describe, it, expect } from "vitest";
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
    expect(filtrar(rows, { mostrarPruebas: false })).toHaveLength(4);
    expect(filtrar(rows, { mostrarPruebas: true })).toHaveLength(5);
  });
  it("% de interesados = sí + info", () => {
    const r = resumen(filtrar(rows, { mostrarPruebas: false }));
    expect(r.interesados).toBe(2);
    expect(r.pctInteresados).toBe(0.5);
    expect(r.cuentan).toBe(1);
  });
  it("interesados sin contacto", () => {
    const r = resumen(filtrar(rows, { mostrarPruebas: false }));
    expect(r.interesadosSinContacto).toBe(1);
    expect(r.pctContactoInteresados).toBe(0.5);
  });
  it("% de recibir es sobre personas", () => {
    const items = conteo(filtrar(rows, { mostrarPruebas: false }), "recibir");
    const nuevos = items.find((i) => i.key === "nuevos")!;
    expect(nuevos.c).toBe(3);
    expect(nuevos.pct).toBe(0.75);
    expect(items.reduce((s, i) => s + i.pct, 0)).toBeGreaterThan(1);
  });
  it("descuento solo entre interesados", () => {
    const d = descuentoInteresados(filtrar(rows, { mostrarPruebas: false }));
    expect(d.find((i) => i.key === "5")!.c).toBe(0);
    expect(d.find((i) => i.key === "10")!.c).toBe(1);
    expect(d[0].n).toBe(2);
  });
  it("porDia agrupa en hora de Puerto Rico", () => {
    const d = porDia([row({ completada_en: "2026-11-20T02:00:00Z" })], new Date("2026-11-20T12:00:00Z"));
    expect(d).toHaveLength(30);
    expect(d.find((x) => x.date === "2026-11-19")!.respuestas).toBe(1);
  });
});
