import { describe, it, expect } from "vitest";
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
    expect(pays(r({ plan: "anual" }))).toBe(true);
    expect(pays(r({ plan: "mensual" }))).toBe(true);
    expect(pays(r({ plan: "ninguno" }))).toBe(false);
  });
  it("lo están pensando = no_se o plan ninguno", () => {
    expect(grupo(r({ intencion_24: "no_se" }))).toBe("tal");
    expect(grupo(r({ plan: "ninguno" }))).toBe("tal");
    expect(grupo(r({}))).toBe("no");
  });
  it("umbrales de señal 15% y 8%", () => {
    expect(signalOf(0.15)).toBe("fuerte");
    expect(signalOf(0.1)).toBe("moderada");
    expect(signalOf(0.08)).toBe("moderada");
    expect(signalOf(0.079)).toBe("debil");
  });
  it("más interés exige al menos 15 personas", () => {
    const rows = [
      ...Array.from({ length: 14 }, () => r({ edad: "18_24", plan: "anual" })),
      ...Array.from({ length: 15 }, (_, i) => r({ edad: "35_44", plan: i < 3 ? "anual" : null })),
    ];
    expect(segment(rows, "edad", false).best?.key).toBe("35_44");
  });
  it("gasto promedio usa puntos medios", () => {
    const d = computeDashboard([r({ gasto: "menos_15" }), r({ gasto: "mas_80" })]);
    expect(d.tiles.gasto).toBe(55);
  });
});
