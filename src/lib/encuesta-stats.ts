// Cálculos del dashboard de la encuesta (fiel al dashboard de referencia de la Fase 3).
export type EncuestaRow = {
  origen: string | null;
  frecuencia: string | null;
  cantidad_mercados: string | null;
  gasto: string | null;
  categorias: string[] | null;
  lealtad: string | null;
  descubrimiento: string[] | null;
  motivadores: string[] | null;
  precio_maximo: string | null;
  intencion_24: string | null;
  plan: string | null;
  dudas: string | null;
  region: string | null;
  edad: string | null;
  sexo: string | null;
  consentimiento_email: boolean | null;
  email_momento: string | null;
};

export const L = {
  origen: { ig: "Instagram", fb: "Facebook", "qr-mercado": "QR en mercado", newsletter: "Newsletter", compartido: "Compartido", directo: "Directo" },
  region: { metro: "Área metro", norte: "Norte", sur: "Sur", este: "Este", oeste: "Oeste", centro: "Centro / montaña", islas: "Vieques o Culebra", visita: "De visita en PR" },
  edad: { "18_24": "18 a 24", "25_34": "25 a 34", "35_44": "35 a 44", "45_54": "45 a 54", "55_64": "55 a 64", "65_mas": "65 o más" },
  sexo: { mujer: "Mujeres", hombre: "Hombres", no_decir: "Prefiere no decir" },
  frecuencia: { fines_semana: "Casi todos los fines de semana", "2_3_mes": "2 o 3 veces al mes", "1_mes": "Una vez al mes", "2_3_meses": "Cada 2 o 3 meses", casi_nunca: "Casi nunca" },
  gasto: { menos_15: "Menos de $15", "15_30": "$15 a $30", "31_50": "$31 a $50", "51_80": "$51 a $80", mas_80: "Más de $80" },
  mercados: { "0": "Ninguno", "1": "1", "2_3": "2 o 3", "4_6": "4 a 6", "7_mas": "7 o más" },
  lealtad: { favoritas: "Sí, tienen sus favoritas", a_veces: "A veces", nuevas: "Prefieren probar mesas nuevas" },
  categorias: { comida: "Comida para comer ahí", cafe_postres: "Café, postres y bebidas", agricola: "Agrícolas y frescos", despensa: "Despensa: salsas, mieles, panes", artesania: "Artesanía y arte", ropa: "Ropa y accesorios", plantas: "Plantas", cuidado: "Cuidado personal", mascotas: "Cosas para mascotas" },
  motivadores: { descuentos: "Descuentos en las mesas", info_anticipada: "Saber con tiempo dónde hay", cercania: "Mercados más cerca", estacionamiento: "Mejor estacionamiento", familia: "Actividades niños o mascotas", ambiente: "Música y buen ambiente", nada: "Nada" },
  descubrimiento: { redes_mercado: "Redes del mercado", rutamercado: "RutaMercado", amistades: "Amigos o familia", whatsapp: "Grupos de WhatsApp", de_paso: "Lo ven al pasar", email: "Newsletter o email" },
  precio: { "0": "No pagaría nada", "12": "Hasta $12", "18": "Hasta $18", "24": "Hasta $24", "36": "Hasta $36", mas_36: "Más de $36" },
  dudas: { poco_uso: "No van lo suficiente para aprovecharla", que_mesas: "Quieren saber qué mesas participan", pago_por_uso: "Prefieren pagar solo cuando van", descuento_bajo: "Un 15% no los mueve", no_membresias: "No les gustan las membresías", otro: "Otras razones" },
} as const;

export const SPEND: Record<string, number> = { menos_15: 10, "15_30": 22, "31_50": 40, "51_80": 65, mas_80: 100 };
export const VISITS: Record<string, number> = { fines_semana: 4, "2_3_mes": 2.5, "1_mes": 1, "2_3_meses": 0.4, casi_nunca: 0.2 };
export const MARKETS: Record<string, number> = { "0": 0, "1": 1, "2_3": 2.5, "4_6": 5, "7_mas": 8 };
export const MIN = 15;

export const int = (v: number) => Math.round(v).toLocaleString("en-US");
export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const money = (v: number) => `$${Math.round(v)}`;
export const dec1 = (v: number) => v.toFixed(1);

export const pays = (r: EncuestaRow) => r.plan === "anual" || r.plan === "mensual";
export const hasEmail = (r: EncuestaRow) => r.consentimiento_email === true;
export function grupo(r: EncuestaRow): "si" | "tal" | "no" {
  if (pays(r)) return "si";
  if (r.intencion_24 === "no_se" || r.plan === "ninguno") return "tal";
  return "no";
}
export function share<T>(rows: T[], f: (r: T) => boolean) {
  return rows.length ? rows.filter(f).length / rows.length : 0;
}
function mean<T>(rows: T[], f: (r: T) => number | undefined) {
  const v = rows.map(f).filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

export type Signal = "fuerte" | "moderada" | "debil";
export const signalOf = (sComp: number): Signal => (sComp >= 0.15 ? "fuerte" : sComp >= 0.08 ? "moderada" : "debil");

export type DistItem = { key: string; label: string; v: number; color?: "brand" | "muted" | "bad" };
export function dist(rows: EncuestaRow[], field: keyof EncuestaRow, labels: Record<string, string>, multi = false): DistItem[] {
  return Object.keys(labels).map((k) => {
    const c = rows.filter((r) => {
      const val = r[field];
      return multi ? Array.isArray(val) && val.includes(k) : val === k;
    }).length;
    return { key: k, label: labels[k], v: rows.length ? c / rows.length : 0 };
  });
}

export type SegField = "edad" | "sexo" | "region" | "origen";
export type SegGroup = { key: string; label: string; n: number; size: number; pay: number; spend: number; mail: number };
export function segment(rows: EncuestaRow[], field: SegField, sortBySize: boolean) {
  const n = rows.length;
  const labels = L[field] as Record<string, string>;
  const g: SegGroup[] = Object.keys(labels)
    .map((k) => {
      const gr = rows.filter((r) => r[field] === k);
      return { key: k, label: labels[k], n: gr.length, size: n ? gr.length / n : 0, pay: share(gr, pays), spend: mean(gr, (r) => SPEND[r.gasto ?? ""]), mail: share(gr, hasEmail) };
    })
    .filter((d) => d.n > 0);
  if (sortBySize) g.sort((a, b) => b.n - a.n);
  const elig = g.filter((d) => d.n >= MIN);
  const best = elig.length ? elig.reduce((a, b) => (b.pay > a.pay ? b : a)) : null;
  const big = g.length ? g.reduce((a, b) => (b.n > a.n ? b : a)) : null;
  const maxSize = Math.max(0, ...g.map((d) => d.size)) || 1;
  return { groups: g, best, big, maxSize, general: share(rows, pays) };
}

export function computeDashboard(rows: EncuestaRow[]) {
  const n = rows.length;
  const si = rows.filter(pays).length;
  const tal = rows.filter((r) => grupo(r) === "tal").length;
  const compR = rows.filter((r) => pays(r) && hasEmail(r));
  const sSi = n ? si / n : 0, sComp = n ? compR.length / n : 0, sTal = n ? tal / n : 0;
  const signal = signalOf(sComp);
  const verdict = signal === "fuerte" ? "Sí, hay buena señal" : signal === "moderada" ? "Hay señal, pero moderada" : "Todavía no hay suficiente señal";
  const strip = [
    { label: "Pagarían y dejaron email", v: sComp, tone: "brand" },
    { label: "Pagarían, sin email", v: sSi - sComp, tone: "brandSoft" },
    { label: "Lo están pensando", v: sTal, tone: "muted" },
    { label: "No pagarían $24", v: 1 - sSi - sTal, tone: "grid" },
  ] as const;

  const em = rows.filter(hasEmail).length;
  const fin = rows.filter((r) => r.email_momento === "final").length;
  const tiles = {
    n, qr: share(rows, (r) => r.origen === "qr-mercado"),
    gasto: mean(rows, (r) => SPEND[r.gasto ?? ""]),
    gasto1550: share(rows, (r) => r.gasto === "15_30" || r.gasto === "31_50"),
    visitas: mean(rows, (r) => VISITS[r.frecuencia ?? ""]),
    gastoMes: mean(rows, (r) => (SPEND[r.gasto ?? ""] ?? 0) * (VISITS[r.frecuencia ?? ""] ?? 0)),
    mercados: mean(rows, (r) => MARKETS[r.cantidad_mercados ?? ""]),
    em, fin,
  };

  const desc = (a: DistItem, b: DistItem) => b.v - a.v;
  const precio = dist(rows, "precio_maximo", L.precio).map((x) => ({ ...x, color: (["24", "36", "mas_36"].includes(x.key) ? "brand" : "muted") as DistItem["color"] }));
  const pr = rows.filter((r) => r.plan);
  const plan = dist(pr, "plan", { anual: "Anual $24", mensual: "Mensual $3.99", ninguno: "Ninguno" });
  const conDuda = rows.filter((r) => r.dudas);
  const dudas = dist(conDuda, "dudas", L.dudas).sort(desc).map((x, i) => (i === 0 ? { ...x, color: "bad" as const } : x));
  const categorias = dist(rows, "categorias", L.categorias, true).sort(desc);

  // Resumen
  const general = share(rows, pays);
  const precioComp = mean(compR, (r) => (r.plan === "anual" ? 24 : 47.88)) || 24;
  const por1000 = Math.round(sComp * 1000);
  const ingreso = por1000 * precioComp;
  const e = segment(rows, "edad", false).best;
  const sx = segment(rows, "sexo", false).best;
  const rg = segment(rows, "region", true);
  const ch = segment(rows, "origen", true);
  const anual = share(pr, (r) => r.plan === "anual");
  const mensual = share(pr, (r) => r.plan === "mensual");

  const titulo =
    signal === "fuerte" ? "La membresía a $24 tiene mercado. El siguiente paso es probar que paguen." :
    signal === "moderada" ? "Hay interés en la membresía, pero todavía no es suficiente para lanzar en grande." :
    "Todavía no hay suficiente interés para lanzar la membresía a $24.";

  const facts: [string, string, string][] = [
    ["Si 1,000 visitantes ven la oferta", `Unos ${int(por1000)} comprarían`, `Serían cerca de ${money(ingreso)} al año, contando solo a quienes escogieron plan y dejaron su email.`],
    ["Tu cliente ideal", (e ? e.label + " años" : "") + (sx ? ", " + sx.label.toLowerCase() : ""), (e ? `${pct(e.pay)} de ese grupo de edad pagaría, contra ${pct(general)} en general.` : "") + (rg.best ? ` La zona con más interés es ${rg.best.label} (${pct(rg.best.pay)}).` : "")],
    ["El precio", `${pct(share(rows, (r) => ["24", "36", "mas_36"].includes(r.precio_maximo ?? "")))} acepta $24 o más`, `De quienes escogen plan, ${pct(anual)} prefiere el anual de $24 y ${pct(mensual)} el mensual de $3.99.`],
    ["El freno número 1", dudas[0] && dudas[0].v > 0 ? dudas[0].label : "—", dudas[0] && dudas[0].v > 0 ? `${pct(dudas[0].v)} de quienes dudan lo escogió. Le sigue: ` + (dudas[1] ? `${dudas[1].label.toLowerCase()} (${pct(dudas[1].v)}).` : "") : ""],
    ["Dónde encontrarlos", ch.best ? ch.best.label : "—", (ch.best ? `Es el canal con más interés (${pct(ch.best.pay)} pagaría). ` : "") + (ch.big ? `El que más respuestas trajo fue ${ch.big.label} (${pct(ch.big.size)}).` : "")],
    ["Qué Mesas Aliadas buscar", categorias[0].label, `Es lo que más compran (${pct(categorias[0].v)}), seguido de ${categorias[1].label.toLowerCase()} (${pct(categorias[1].v)}) y ${categorias[2].label.toLowerCase()} (${pct(categorias[2].v)}).`],
  ];

  const accionDuda: Record<string, [string, string]> = {
    que_mesas: ["Consigue tus Mesas Aliadas antes de vender.", " Anuncia las primeras 25 Mesas Aliadas Fundadoras para que la gente vea dónde usaría el descuento."],
    poco_uso: ["Enseña cuánto se ahorra.", " Usa el cálculo de ahorro en toda la promoción para que vean que los $24 se recuperan."],
    pago_por_uso: ["Prueba una opción de pago por visita.", " Parte de la gente no quiere pagar por adelantado."],
    descuento_bajo: ["Sube el descuento con las mesas.", " El 15% no convence a todos; busca ofertas más fuertes con algunas Mesas Aliadas."],
    no_membresias: ["Cambia cómo la presentas.", " Llámala tarjeta de descuentos en vez de membresía."],
    otro: ['Lee las respuestas de "Otro".', " Ahí hay razones que la encuesta no anticipó."],
  };
  const todo: [string, string][] = [];
  todo.push(
    signal === "fuerte" ? ["Abre una pre-venta a $24.", ` Ofrécesela primero a las ${int(em)} personas de la lista de espera, con devolución si no lanzas a tiempo.`] :
    signal === "moderada" ? ["Haz una pre-venta pequeña.", ` Empieza con las ${int(em)} personas de la lista de espera antes de invertir en anuncios.`] :
    ["No lances todavía.", " Resuelve primero el freno número 1 y vuelve a medir."],
  );
  if (dudas[0] && dudas[0].v > 0) todo.push(accionDuda[dudas[0].key]);
  todo.push(["Enfoca tus anuncios.", ` Dirígelos a ${e ? `personas de ${e.label} años` : "tu grupo con más interés"}${rg.best ? ` en ${rg.best.label}` : ""}, y destaca el plan ${anual >= mensual ? "anual de $24." : "mensual de $3.99."}`]);
  if (fin > 0) todo.push(["Mantén el cálculo de ahorro al final.", ` ${int(fin)} personas se anotaron después de verlo: ${pct(fin / Math.max(em, 1))} de tu lista de espera.`]);

  return {
    n, si, sSi, sComp, sTal, comp: compR.length, signal, verdict, strip, tiles,
    segments: {
      edad: segment(rows, "edad", false), sexo: segment(rows, "sexo", false),
      region: segment(rows, "region", true), origen: segment(rows, "origen", true),
    },
    como: {
      gasto: dist(rows, "gasto", L.gasto), frecuencia: dist(rows, "frecuencia", L.frecuencia),
      mercados: dist(rows, "cantidad_mercados", L.mercados), lealtad: dist(rows, "lealtad", L.lealtad),
    },
    compran: {
      categorias, motivos: dist(rows, "motivadores", L.motivadores, true).sort(desc),
      descubren: dist(rows, "descubrimiento", L.descubrimiento, true).sort(desc),
    },
    membresia: { precio, plan, planN: pr.length, dudas },
    resumen: { general, titulo, facts, todo },
  };
}
