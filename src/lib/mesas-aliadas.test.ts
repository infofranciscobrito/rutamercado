import { describe, it } from "node:test";
import assert from "node:assert";
import { cleanAliada, resumenAliadas } from "./mesas-aliadas";

describe("Mesas Aliadas", () => {
  it('"No" borra descuento, necesidades y Fundadora', () => {
    assert.deepStrictEqual(cleanAliada({ discount_willing: "no", discount_offer: "10", participation_needs: ["material"], wants_founder: true }), {
      discount_willing: "no", discount_offer: null, discount_offer_other: null, participation_needs: null, participation_needs_other: null, wants_founder: null,
    });
  });
  it('"Tal vez" conserva descuento y borra Fundadora', () => {
    const c = cleanAliada({ discount_willing: "tal_vez", discount_offer: "15", wants_founder: true });
    assert.strictEqual(c.discount_offer, "15");
    assert.strictEqual(c.wants_founder, null);
  });
  it("máximo 3 necesidades", () => {
    const c = cleanAliada({ discount_willing: "si", participation_needs: ["visibilidad", "sin_costo", "material", "resultados"] });
    assert.strictEqual(c.participation_needs?.length, 3);
  });
  it("resumen excluye pruebas y cuenta Fundadoras", () => {
    const s = resumenAliadas([
      { discount_willing: "si", discount_offer: "10", wants_founder: true, participation_needs: ["material"] },
      { discount_willing: "tal_vez", discount_offer: "10" },
      { discount_willing: "no" },
      { discount_willing: "si", wants_founder: true, is_test: true },
      {},
    ]);
    assert.strictEqual(s.n, 3);
    assert.strictEqual(s.dispuestos, 2);
    assert.strictEqual(s.descuentoComun?.label, "10%");
    assert.strictEqual(s.fundadoras, 1);
  });
});
