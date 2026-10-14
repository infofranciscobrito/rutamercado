import { describe, expect, test } from "bun:test";
import { selectCategoryPreview } from "./category-preview";

const market = (id: string, nextDate: string | null, destacado = false) => ({
  id, nextDate, destacado, recurrence_start_date: null,
});

describe("homepage category preview", () => {
  test("shows at most three markets per category", () => {
    expect(selectCategoryPreview([1, 2, 3, 4, 5].map(i => market(String(i), `2026-10-${20 + i}`))).map(m => m.id)).toEqual(["1", "2", "3"]);
  });
  test("selects the nearest dates, not featured priority", () => {
    const rows = [market("featured", "2026-12-01", true), market("third", "2026-10-23"), market("first", "2026-10-21"), market("second", "2026-10-22")];
    expect(selectCategoryPreview(rows).map(m => m.id)).toEqual(["first", "second", "third"]);
    expect(rows[0].id).toBe("featured");
  });
  test("keeps separate dates of the same market as separate cards", () => {
    expect(selectCategoryPreview([market("expo", "2026-10-22"), market("expo", "2026-10-21")]).map(m => m.nextDate)).toEqual(["2026-10-21", "2026-10-22"]);
  });
  test("retains fewer than three markets without placeholders", () => {
    expect(selectCategoryPreview([market("only", "2026-10-21")]).map(m => m.id)).toEqual(["only"]);
  });
});