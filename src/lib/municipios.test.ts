import { describe, it as test } from "node:test";
import { strictEqual } from "node:assert";
import { MUNICIPIOS, regionDeMunicipio } from "./municipios";

describe("regionDeMunicipio", () => {
  test("hay 78 municipios únicos", () => {
    strictEqual(MUNICIPIOS.length, 78);
    strictEqual(new Set(MUNICIPIOS).size, 78);
  });
  test("Caguas es Centro", () => strictEqual(regionDeMunicipio("Caguas"), "Centro"));
  test("Vieques es Este", () => strictEqual(regionDeMunicipio("Vieques"), "Este"));
  test("Toa Alta es Metro", () => strictEqual(regionDeMunicipio("Toa Alta"), "Metro"));
  test("municipio inválido devuelve null", () => strictEqual(regionDeMunicipio("Gotham"), null));
});
