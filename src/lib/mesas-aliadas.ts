// Sección "Mesas Aliadas RutaLover" del registro de negocios. Módulo seguro para navegador.
export const DISCOUNT_WILLING = [
  { v: "si", l: "Sí" },
  { v: "tal_vez", l: "Tal vez" },
  { v: "no", l: "No" },
] as const;
export const DISCOUNT_OFFER = [
  { v: "5", l: "5%" },
  { v: "10", l: "10%" },
  { v: "15", l: "15%" },
  { v: "otro", l: "Otro tipo de oferta" },
] as const;
export const NEEDS = [
  { v: "visibilidad", l: "Visibilidad en RutaMercado" },
  { v: "sin_costo", l: "Que no me cueste nada" },
  { v: "material", l: "Material para la mesa" },
  { v: "resultados", l: "Ver resultados de ventas" },
  { v: "otro", l: "Otro" },
] as const;
export const MAX_NEEDS = 3;
export const FOUNDER_GOAL = 25;

export type Willing = (typeof DISCOUNT_WILLING)[number]["v"];
export type Offer = (typeof DISCOUNT_OFFER)[number]["v"];
export type Need = (typeof NEEDS)[number]["v"];
export type AliadaFields = {
  discount_willing: Willing | null;
  discount_offer: Offer | null;
  discount_offer_other: string | null;
  participation_needs: Need[] | null;
  participation_needs_other: string | null;
  wants_founder: boolean | null;
};

export const labelOf = (list: readonly { v: string; l: string }[], v: string | null | undefined) =>
  list.find((x) => x.v === v)?.l ?? "";

const txt = (s: string | null | undefined) => (s && s.trim() ? s.trim().slice(0, 200) : null);

/** Quita respuestas que no aplican según la primera pregunta. */
export function cleanAliada(f: Partial<AliadaFields>): AliadaFields {
  const w = f.discount_willing ?? null;
  const open = w === "si" || w === "tal_vez";
  const offer = open ? f.discount_offer ?? null : null;
  const needs = open ? [...new Set(f.participation_needs ?? [])].slice(0, MAX_NEEDS) : [];
  return {
    discount_willing: w,
    discount_offer: offer,
    discount_offer_other: offer === "otro" ? txt(f.discount_offer_other) : null,
    participation_needs: needs.length ? needs : null,
    participation_needs_other: needs.includes("otro") ? txt(f.participation_needs_other) : null,
    wants_founder: w === "si" ? f.wants_founder ?? null : null,
  };
}

type Row = Partial<AliadaFields> & { is_test?: boolean | null };
export function resumenAliadas(rows: Row[]) {
  const r = rows.filter((x) => !x.is_test && x.discount_willing);
  const n = r.length;
  const dispuestos = r.filter((x) => x.discount_willing === "si" || x.discount_willing === "tal_vez").length;
  const offers = new Map<string, number>();
  const needs = new Map<string, number>();
  for (const x of r) {
    if (x.discount_offer) offers.set(x.discount_offer, (offers.get(x.discount_offer) ?? 0) + 1);
    for (const nd of x.participation_needs ?? []) needs.set(nd, (needs.get(nd) ?? 0) + 1);
  }
  const top = [...offers].sort((a, b) => b[1] - a[1])[0];
  return {
    n,
    dispuestos,
    pctDispuestos: n ? dispuestos / n : 0,
    descuentoComun: top ? { v: top[0], label: labelOf(DISCOUNT_OFFER, top[0]), c: top[1] } : null,
    necesidades: [...needs].sort((a, b) => b[1] - a[1]).map(([v, c]) => ({ v, label: labelOf(NEEDS, v), c })),
    fundadoras: rows.filter((x) => !x.is_test && x.wants_founder === true).length,
  };
}
