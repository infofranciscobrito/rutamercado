export type InteresRow = {
  is_test: boolean;
  completada_en: string | null;
  categoria: string;
  frecuencia: string;
  ticket: string;
  descuento: string;
  recibir: string[] | null;
  interes: string;
  tipo: string;
  origen: string;
  negocio?: string | null;
  instagram?: string | null;
};

export const LABELS: Record<string, Record<string, string>> = {
  interes: { si: "Sí, cuenten conmigo", info: "Me interesa, quiero más información", no: "Por ahora no" },
  descuento: { "5": "5%", "10": "10%", "15": "15%", no_se: "Todavía no sé" },
  recibir: {
    regresan: "Que mis clientes regresen a mi mesa en otros mercados",
    nuevos: "Clientes nuevos que no me conocían",
    rutamapa: "Que me promocionen cada semana en el RutaMapa",
    reporte: "Saber cuántos miembros me compraron y dónde",
  },
  ticket: { menos_10: "Menos de $10", "10_25": "$10 a $25", "25_50": "$25 a $50", mas_50: "Más de $50" },
  frecuencia: { "1_menos": "1 o menos", "2_3": "2 a 3", "4_6": "4 a 6", "7_mas": "7 o más" },
  categoria: {
    comida: "Comida preparada", reposteria: "Repostería y dulces", bebidas: "Bebidas y café",
    agricola: "Productos agrícolas", artesania: "Artesanía y arte", joyeria: "Joyería y accesorios",
    ropa: "Ropa", cuidado: "Cuidado personal", plantas: "Plantas", otro: "Otro",
  },
};

const pct = (a: number, b: number) => (b > 0 ? a / b : 0);
export const esInteresado = (r: InteresRow) => r.interes === "si" || r.interes === "info";

export function filtrar<T extends InteresRow>(rows: T[], { mostrarPruebas }: { mostrarPruebas: boolean }): T[] {
  return mostrarPruebas ? rows : rows.filter((r) => !r.is_test);
}

export function resumen(rows: InteresRow[]) {
  const total = rows.length;
  const interesados = rows.filter(esInteresado).length;
  const cuentan = rows.filter((r) => r.interes === "si").length;
  const conContacto = rows.filter((r) => r.tipo === "con_contacto").length;
  const interesadosSinContacto = rows.filter((r) => esInteresado(r) && r.tipo === "anonima").length;
  return {
    total,
    interesados,
    pctInteresados: pct(interesados, total),
    cuentan,
    conContacto,
    interesadosSinContacto,
    pctContactoInteresados: pct(interesados - interesadosSinContacto, interesados),
  };
}

export type ConteoItem = { key: string; label: string; c: number; n: number; pct: number };

export function conteo(rows: InteresRow[], campo: keyof InteresRow, opciones?: string[], ordenar = false): ConteoItem[] {
  const answered = rows.filter((r) => {
    const v = r[campo];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  });
  const n = answered.length;
  const counts = new Map<string, number>();
  for (const r of answered) {
    const v = r[campo];
    for (const k of Array.isArray(v) ? v : [String(v)]) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const keys = opciones ?? [...counts.keys()];
  const extra = opciones ? [...counts.keys()].filter((k) => !opciones.includes(k)) : [];
  const items = [...keys, ...extra].map((key) => {
    const c = counts.get(key) ?? 0;
    return { key, label: LABELS[campo as string]?.[key] ?? key, c, n, pct: pct(c, n) };
  });
  return ordenar ? items.sort((a, b) => b.c - a.c) : items;
}

export function descuentoInteresados(rows: InteresRow[]) {
  return conteo(rows.filter(esInteresado), "descuento", Object.keys(LABELS.descuento));
}

const prDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

export function porDia(rows: InteresRow[], now = new Date()) {
  const days: { date: string; respuestas: number }[] = [];
  for (let i = 29; i >= 0; i--) days.push({ date: prDay(new Date(now.getTime() - i * 86400000).toISOString()), respuestas: 0 });
  const idx = new Map(days.map((d, i) => [d.date, i]));
  for (const r of rows) {
    if (!r.completada_en) continue;
    const i = idx.get(prDay(r.completada_en));
    if (i != null) days[i].respuestas++;
  }
  return days;
}
