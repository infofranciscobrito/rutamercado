import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Copy, Trash2, MessageSquare, Heart, Handshake, Mail, UserX } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/admin/MetricCard";
import { downloadCSV } from "@/lib/csv";
import { listMesasAliadasInteres, exportContactosMesasAliadas, deleteTestMesasAliadas } from "@/lib/mesas-aliadas-interes.functions";
import { filtrar, resumen, conteo, descuentoInteresados, porDia, embudo, cruce, LABELS, type ConteoItem, type InteresRow } from "@/lib/mesas-aliadas-interes-stats";

const SHARE = "https://rutamercadopr.com/mesas-aliadas/interes";
const BRAND = "#54b678";
const MUTED = "rgba(24,37,63,0.25)";
const GRID = "rgba(24,37,63,0.08)";
const NAVY = "#18253f";
const PALETTE = [BRAND, NAVY, "#8fd1a6", "#4a5a7a", "#f8b625", "#c9d3e3", "#2f8a52", "#9aa6bd", "#e07a5f", "#6c7a96"];
const pctFmt = (v: number) => `${Math.round(v * 100)}%`;

export const Route = createFileRoute("/_admin/admin/mesas-aliadas")({
  head: () => ({
    meta: [
      { title: "Mesas Aliadas · Interés | Admin RutaMercado" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MesasAliadasAdmin,
});

function MesasAliadasAdmin() {
  const listFn = useServerFn(listMesasAliadasInteres);
  const exportFn = useServerFn(exportContactosMesasAliadas);
  const deleteFn = useServerFn(deleteTestMesasAliadas);
  const [mostrarPruebas, setMostrarPruebas] = useState(false);
  const q = useQuery({ queryKey: ["admin", "mesas-aliadas"], queryFn: () => listFn() });

  const rows = useMemo(() => filtrar(q.data ?? [], { mostrarPruebas }), [q.data, mostrarPruebas]);
  const r = resumen(rows);
  const contactos = rows.filter((x) => x.tipo === "con_contacto");

  const descargar = async () => {
    const data = await exportFn();
    if (data.length === 0) return toast("Todavía ninguna mesa ha dejado su contacto.");
    downloadCSV(`contactos-mesas-aliadas-${new Date().toISOString().slice(0, 10)}.csv`, data);
  };
  const borrar = async () => {
    if (!window.confirm("¿Borrar todas las respuestas de prueba?")) return;
    const { deleted } = await deleteFn();
    toast(`Se borraron ${deleted} respuestas de prueba.`);
    await q.refetch();
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(SHARE);
    toast("Enlace copiado");
  };

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Mesas Aliadas · Interés</h1>
          <p className="text-sm text-muted-foreground">Resultados de rutamercadopr.com/mesas-aliadas/interes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={mostrarPruebas} onCheckedChange={setMostrarPruebas} aria-label="Mostrar pruebas" />
            Mostrar pruebas
          </label>
          <Button variant="outline" onClick={descargar}><Download className="mr-2 h-4 w-4" />Descargar contactos (CSV)</Button>
          <Button variant="outline" onClick={borrar}><Trash2 className="mr-2 h-4 w-4" />Borrar pruebas</Button>
        </div>
      </header>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : q.isError ? (
        <p role="alert" className="text-sm text-destructive">No se pudieron cargar las respuestas.</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center space-y-4">
          <p className="text-muted-foreground">Todavía no hay respuestas. Comparte rutamercadopr.com/mesas-aliadas/interes para empezar.</p>
          <Button onClick={copiar}><Copy className="mr-2 h-4 w-4" />Copiar enlace</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Respuestas" value={r.total} icon={MessageSquare} />
            <MetricCard label="Interesados" value={r.interesados} icon={Heart} subtext={`${pctFmt(r.pctInteresados)} · "Sí" + "Quiero información"`} />
            <MetricCard label="Cuenten conmigo" value={r.cuentan} icon={Handshake} subtext='"Sí, cuenten conmigo"' />
            <MetricCard label="Dejaron contacto" value={r.conContacto} icon={Mail} subtext={`${pctFmt(r.pctContactoInteresados)} de los interesados`} />
            <MetricCard label="Interesados sin contacto" value={r.interesadosSinContacto} icon={UserX} subtext="Se fueron en el último paso" />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <Card title="Embudo de interés" desc="Cuántos negocios avanzan en cada paso y cuántos se pierden." className="lg:col-span-3">
              <Funnel rows={rows} />
            </Card>
            <Card title="Respuestas por día" desc="Últimos 30 días · barras diarias y total acumulado." className="lg:col-span-2">
              <Tendencia rows={rows} />
            </Card>
          </div>

          <Section title="1 · Perfil del negocio" desc="Quiénes respondieron: qué venden, cuánto salen y cuánto compra su cliente.">
            <Card title="Qué venden" n={conteo(rows, "categoria")[0]?.n}><Donut items={conteo(rows, "categoria", Object.keys(LABELS.categoria), true)} /></Card>
            <Card title="Mercados al mes" n={rows.length}><Columnas items={conteo(rows, "frecuencia", Object.keys(LABELS.frecuencia))} /></Card>
            <Card title="Compra típica por cliente" n={rows.length}><Columnas items={conteo(rows, "ticket", Object.keys(LABELS.ticket))} /></Card>
            <Card title="De dónde llegaron" n={rows.length}><Donut items={conteo(rows, "origen", undefined, true)} /></Card>
          </Section>

          <Section title="2 · Interés y negociación" desc="Qué tan dispuestos están y qué piden a cambio.">
            <Card title="¿Se unirían como Mesa Aliada?" n={rows.length}><Donut items={conteo(rows, "interes", Object.keys(LABELS.interes))} colores={[BRAND, "#8fd1a6", "#c9d3e3"]} /></Card>
            <Card title="Descuento que darían" desc="Solo entre los interesados." n={descuentoInteresados(rows)[0]?.n}><Columnas items={descuentoInteresados(rows)} /></Card>
            <Card title="Qué quieren recibir a cambio" desc="Cada negocio escoge hasta 2 · % sobre quienes contestaron." className="lg:col-span-2"><Horizontal items={conteo(rows, "recibir", Object.keys(LABELS.recibir), true)} /></Card>
          </Section>

          <Section title="3 · Cruces" desc="Combina dos respuestas para ver patrones. Cada celda es número de negocios interesados.">
            <Card title="Descuento según lo que venden"><Heatmap data={cruce(rows.filter((x) => x.interes !== "no"), "categoria", "descuento")} /></Card>
            <Card title="Descuento según compra típica"><Heatmap data={cruce(rows.filter((x) => x.interes !== "no"), "ticket", "descuento")} /></Card>
          </Section>

          <section className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-display text-2xl text-[#18253f]">4 · Mesas interesadas con contacto</h2>
            {contactos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía ninguna mesa ha dejado su contacto.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>{["Negocio", "Instagram", "Interés", "Descuento", "Qué vende", "Fecha"].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {contactos.map((c) => {
                      const ig = (c.instagram ?? "").replace(/^@/, "").trim();
                      return (
                        <tr key={c.id} className="border-t">
                          <td className="py-2 pr-4">{c.negocio || "—"}</td>
                          <td className="py-2 pr-4">{ig ? <a className="text-[#18253f] underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">@{ig}</a> : "—"}</td>
                          <td className="py-2 pr-4">{LABELS.interes[c.interes] ?? c.interes}</td>
                          <td className="py-2 pr-4">{LABELS.descuento[c.descuento] ?? c.descuento}</td>
                          <td className="py-2 pr-4">{LABELS.categoria[c.categoria] ?? c.categoria}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{c.completada_en && new Date(c.completada_en).toLocaleDateString("es-PR", { timeZone: "America/Puerto_Rico" })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header className="border-b pb-2">
        <h2 className="font-display text-2xl text-[#18253f]">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function Card({ title, desc, n, className = "", children }: { title: string; desc?: string; n?: number; className?: string; children: React.ReactNode }) {
  return (
    <article className={`rounded-xl border bg-card p-5 space-y-3 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
        {n != null && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">n = {n}</span>}
      </div>
      {children}
    </article>
  );
}

const tip = { contentStyle: { borderRadius: 8, fontSize: 12, borderColor: GRID } };
const short = (s: string, n = 18) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function Funnel({ rows }: { rows: InteresRow[] }) {
  const pasos = embudo(rows);
  return (
    <div className="space-y-3">
      {pasos.map((p, i) => (
        <div key={p.key}>
          {i > 0 && <p className="mb-1 pl-1 text-xs text-muted-foreground">↓ {pctFmt(p.pctPrev)} pasa al siguiente paso · se pierden {pasos[i - 1].c - p.c}</p>}
          <div className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm font-medium text-[#18253f]">{p.label}</span>
            <div className="h-9 flex-1 rounded-md" style={{ background: GRID }}>
              <div className="flex h-full items-center justify-end rounded-md px-2 text-xs font-semibold text-white transition-all" style={{ width: `${Math.max(p.pctTotal * 100, p.c ? 8 : 0)}%`, background: i === 0 ? NAVY : BRAND, opacity: 1 - i * 0.15 }}>
                {p.c}
              </div>
            </div>
            <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{pctFmt(p.pctTotal)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tendencia({ rows }: { rows: InteresRow[] }) {
  let acc = 0;
  const data = porDia(rows).map((d) => ({ ...d, dia: d.date.slice(5), acumulado: (acc += d.respuestas) }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={4} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip {...tip} formatter={(v: number, k: string) => [v, k === "acumulado" ? "Total acumulado" : "Respuestas del día"]} />
          <Area type="monotone" dataKey="acumulado" stroke={BRAND} strokeWidth={2} fill="url(#gAcc)" />
          <Area type="step" dataKey="respuestas" stroke={NAVY} strokeWidth={1.5} fill={NAVY} fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Donut({ items, colores = PALETTE }: { items: ConteoItem[]; colores?: string[] }) {
  const data = items.filter((i) => i.c > 0);
  const total = data.reduce((a, b) => a + b.c, 0);
  if (!total) return <p className="text-sm text-muted-foreground">Sin datos.</p>;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative h-44">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="c" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={colores[i % colores.length]} />)}
            </Pie>
            <Tooltip {...tip} formatter={(v: number, k: string) => [`${v} · ${pctFmt(v / total)}`, k]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl text-[#18253f]">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">total</span>
        </div>
      </div>
      <ul className="min-w-0 space-y-1.5 text-sm">
        {data.map((it, i) => (
          <li key={it.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: colores[i % colores.length] }} />
            <span className="min-w-0 flex-1 truncate" title={it.label}>{it.label}</span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{it.c} · {pctFmt(it.pct)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Columnas({ items }: { items: ConteoItem[] }) {
  const top = Math.max(0, ...items.map((i) => i.c));
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart data={items} margin={{ left: -20, right: 8, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickFormatter={(s) => short(s, 14)} interval={0} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip {...tip} formatter={(v: number, _k, p) => [`${v} · ${pctFmt((p?.payload as ConteoItem).pct)}`, "Negocios"]} cursor={{ fill: GRID }} />
          <Bar dataKey="c" radius={[6, 6, 0, 0]}>
            {items.map((it) => <Cell key={it.key} fill={it.c === top && top > 0 ? BRAND : MUTED} />)}
            <LabelList dataKey="pct" position="top" formatter={(v: number) => (v ? pctFmt(v) : "")} style={{ fontSize: 11, fill: NAVY }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Horizontal({ items }: { items: ConteoItem[] }) {
  const top = Math.max(0, ...items.map((i) => i.c));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.key} className="space-y-1">
          <div className="flex justify-between gap-3 text-sm">
            <span className={it.c === top && top > 0 ? "font-semibold text-[#18253f]" : ""}><span className="mr-2 text-muted-foreground">#{i + 1}</span>{it.label}</span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{it.c} · {pctFmt(it.pct)}</span>
          </div>
          <div className="h-3 rounded-full" style={{ background: GRID }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${it.pct * 100}%`, background: it.c === top && top > 0 ? BRAND : NAVY, opacity: it.c === top ? 1 : 0.55 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ data }: { data: ReturnType<typeof cruce> }) {
  if (!data.filas.length) return <p className="text-sm text-muted-foreground">Sin datos de interesados todavía.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr><th />{data.cols.map((c) => <th key={c.key} className="px-1 font-medium text-muted-foreground">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.filas.map((f) => (
            <tr key={f.key}>
              <td className="pr-2 text-sm whitespace-nowrap" title={f.label}>{short(f.label, 22)}</td>
              {f.valores.map((v, i) => (
                <td key={i} className="h-9 min-w-12 rounded text-center font-semibold tabular-nums" style={{ background: v ? `color-mix(in srgb, ${BRAND} ${Math.round(20 + (v / (data.max || 1)) * 80)}%, white)` : GRID, color: v / (data.max || 1) > 0.6 ? "white" : NAVY }}>
                  {v || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
