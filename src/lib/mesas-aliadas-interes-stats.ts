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
  email?: string | null;
  telefono?: string | null;
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
export const tieneDatosContacto = (r: InteresRow) => [r.negocio, r.instagram, r.email, r.telefono].some((v) => Boolean(v?.trim()));
export const dejoContacto = (r: InteresRow) => esInteresado(r) && r.tipo === "con_contacto" && tieneDatosContacto(r);

export function whatsappUrl(telefono?: string | null) {
  const digits = telefono?.replace(/\D/g, "") ?? "";
  const numero = digits.length === 10 ? `1${digits}` : digits;
  return /^1\d{10}$/.test(numero) ? `https://wa.me/${numero}` : null;
}

export function filtrar<T extends InteresRow>(rows: T[], { mostrarPruebas }: { mostrarPruebas: boolean }): T[] {
  return mostrarPruebas ? rows : rows.filter((r) => !r.is_test);
}

export function resumen(rows: InteresRow[]) {
  const total = rows.length;
  const interesados = rows.filter(esInteresado).length;
  const cuentan = rows.filter((r) => r.interes === "si").length;
  const conContacto = rows.filter(dejoContacto).length;
  const interesadosSinContacto = Math.max(0, interesados - conContacto);
  return {
    total,
    interesados,
    pctInteresados: pct(interesados, total),
    cuentan,
    conContacto,
    interesadosSinContacto,
    pctContactoInteresados: pct(conContacto, interesados),
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

export type EmbudoPaso = { key: string; label: string; c: number; pctTotal: number; pctPrev: number };

/** Tres subconjuntos anidados; un contacto vacío nunca cuenta como conversión. */
export function embudo(rows: InteresRow[]): EmbudoPaso[] {
  const r = resumen(rows);
  const pasos = [
    { key: "total", label: "Respondieron", c: r.total },
    { key: "interesados", label: "Interesados", c: r.interesados },
    { key: "contacto", label: "Dejaron contacto", c: r.conContacto },
  ];
  return pasos.map((p, i) => ({ ...p, pctTotal: pct(p.c, r.total), pctPrev: i === 0 ? 1 : Math.min(1, Math.max(0, pct(p.c, pasos[i - 1].c))) }));
}

/** Tabla cruzada de conteos: filas × columnas (multi-valor soportado). */
export function cruce(rows: InteresRow[], fila: keyof InteresRow, col: keyof InteresRow) {
  const filas = new Map<string, Map<string, number>>();
  const cols = new Set<string>();
  const vals = (v: unknown) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [String(v)]);
  for (const r of rows) for (const f of vals(r[fila])) for (const c of vals(r[col])) {
    cols.add(c);
    const m = filas.get(f) ?? new Map<string, number>();
    m.set(c, (m.get(c) ?? 0) + 1);
    filas.set(f, m);
  }
  const colOrder = Object.keys(LABELS[col as string] ?? {}).filter((k) => cols.has(k));
  const colKeys = [...colOrder, ...[...cols].filter((k) => !colOrder.includes(k))];
  const filaKeys = [...filas.keys()].sort((a, b) => sum(filas.get(b)) - sum(filas.get(a)));
  const valores = filaKeys.map((k) => colKeys.map((c) => filas.get(k)?.get(c) ?? 0));
  const totales = colKeys.map((_, i) => valores.reduce((s, f) => s + f[i], 0));
  return {
    cols: colKeys.map((k) => ({ key: k, label: LABELS[col as string]?.[k] ?? k })),
    filas: filaKeys.map((k, i) => ({ key: k, label: LABELS[fila as string]?.[k] ?? k, valores: valores[i], total: valores[i].reduce((a, b) => a + b, 0) })),
    totales,
    total: totales.reduce((a, b) => a + b, 0),
    max: Math.max(0, ...[...filas.values()].flatMap((m) => [...m.values()])),
  };
}
const sum = (m?: Map<string, number>) => [...(m?.values() ?? [])].reduce((a, b) => a + b, 0);
