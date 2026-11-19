import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Copy, Trash2, MessageSquare, Heart, Handshake, Mail, ArrowUpDown, ExternalLink } from "lucide-react";
import { ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/integrations/supabase/client";
import { listMesasAliadasInteres, exportContactosMesasAliadas, deleteTestMesasAliadas } from "@/lib/mesas-aliadas-interes.functions";
import { filtrar, resumen, conteo, descuentoInteresados, porDia, embudo, cruce, LABELS, esInteresado, tieneDatosContacto, whatsappUrl, type ConteoItem, type InteresRow } from "@/lib/mesas-aliadas-interes-stats";

const SHARE = "https://rutamercadopr.com/mesas-aliadas/interes";
const BRAND = "var(--color-gold)";
const MUTED = "var(--ma-muted)";
const GRID = "var(--ma-grid)";
const NAVY = "var(--color-navy)";
const INFO = "var(--ma-info)";
const NEGATIVE = "var(--ma-negative)";
const pctFmt = (v: number) => `${Math.round(v * 100)}%`;

export const Route = createFileRoute("/_admin/admin/mesas-aliadas")({
  head: () => ({
    meta: [
      { title: "Mesas Aliadas · Interés | Admin RutaMercado" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Interés, descuentos y contactos de Mesas Aliadas en RutaMercado." },
      { property: "og:title", content: "Mesas Aliadas · Interés | Admin RutaMercado" },
      { property: "og:description", content: "Análisis del interés y los contactos de Mesas Aliadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

  const [fechaAsc, setFechaAsc] = useState(false);
  // Existing administrator SELECT policy applies, including test contacts.
  const contactosQuery = useQuery({ queryKey: ["admin", "mesas-aliadas", "contactos"], queryFn: async () => {
    const { data, error } = await supabase.from("mesas_aliadas_interes").select("id, email, telefono").eq("tipo", "con_contacto");
    if (error) throw error;
    return data ?? [];
  } });
  const enriquecidas = useMemo(() => (q.data ?? []).map((row) => {
    const contacto = contactosQuery.data?.find((c) => c.id === row.id);
    return { ...row, email: contacto?.email ?? null, telefono: contacto?.telefono ?? null };
  }), [q.data, contactosQuery.data]);
  const rows = useMemo(() => filtrar(enriquecidas, { mostrarPruebas }), [enriquecidas, mostrarPruebas]);
  const r = resumen(rows);
  const contactos = rows.filter((x) => esInteresado(x) && x.tipo === "con_contacto")
    .sort((a, b) => (fechaAsc ? 1 : -1) * ((Date.parse(a.completada_en ?? "") || 0) - (Date.parse(b.completada_en ?? "") || 0)));

  const descargar = async () => {
    const data = await exportFn();
    if (data.length === 0) return toast("Todavía ninguna mesa ha dejado su contacto.");
    downloadCSV(`contactos-mesas-aliadas-${new Date().toISOString().slice(0, 10)}.csv`, data);
  };
  const borrar = async () => {
    if (!window.confirm("¿Borrar todas las respuestas de prueba?")) return;
    const { deleted } = await deleteFn();
    toast(`Se borraron ${deleted} respuestas de prueba.`);
    await Promise.all([q.refetch(), contactosQuery.refetch()]);
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(SHARE);
    toast("Enlace copiado");
  };

  return (
    <div className="mesas-panel min-w-0 space-y-6 p-3 sm:p-6">
      <style>{`.mesas-panel { --ma-info: #8fd1a6; --ma-negative: #c9d3e3; --ma-warning: #f8b625; --ma-muted: color-mix(in srgb, var(--color-navy) 25%, transparent); --ma-grid: color-mix(in srgb, var(--color-navy) 8%, transparent); } .mesas-panel .ma-test-notice { background: color-mix(in srgb, var(--ma-warning) 18%, transparent); border-color: color-mix(in srgb, var(--ma-warning) 45%, transparent); }`}</style>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy">Mesas Aliadas · Interés</h1>
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

      {mostrarPruebas && <p role="status" className="ma-test-notice rounded-md border px-4 py-3 text-sm text-navy">Estás viendo {rows.filter((x) => x.is_test).length} respuestas de prueba incluidas en los números.</p>}
      {!q.isLoading && !q.isError && rows.length < 30 && <SampleNote n={rows.length} />}
      {contactosQuery.isError && <p role="alert" className="text-sm text-destructive">No se pudieron cargar los correos y teléfonos. Los contactos pueden estar incompletos.</p>}
      {q.isLoading || contactosQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : q.isError ? (
        <p role="alert" className="text-sm text-destructive">No se pudieron cargar las respuestas.</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center space-y-4">
          <p className="text-muted-foreground">Todavía no hay respuestas. Comparte rutamercadopr.com/mesas-aliadas/interes para empezar.</p>
          <Button onClick={copiar}><Copy className="mr-2 h-4 w-4" />Copiar enlace</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Respuestas" value={`${r.total}`} subtext="Total de respuestas" icon={MessageSquare} />
            <Kpi label="Interesados" value={`${r.interesados} de ${r.total} · ${pctFmt(r.pctInteresados)}`} subtext='“Sí” + “Quiero información”' icon={Heart} />
            <Kpi label="Cuenten conmigo" value={`${r.cuentan} de ${r.interesados}`} subtext="interesados" icon={Handshake} />
            <Kpi label="Dejaron contacto" value={`${r.conContacto} de ${r.interesados} · ${pctFmt(r.pctContactoInteresados)}`} subtext="interesados con datos de contacto" icon={Mail} />
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
            <Card title="Qué venden" n={conteo(rows, "categoria")[0]?.n}><Horizontal items={conteo(rows, "categoria", Object.keys(LABELS.categoria), true)} /></Card>
            <Card title="Mercados al mes" n={rows.length}><Columnas items={conteo(rows, "frecuencia", Object.keys(LABELS.frecuencia))} /></Card>
            <Card title="Compra típica por cliente" n={rows.length}><Columnas items={conteo(rows, "ticket", Object.keys(LABELS.ticket))} /></Card>
            <Card title="De dónde llegaron" n={rows.length}><Horizontal items={conteo(rows, "origen", undefined, true)} /></Card>
          </Section>

          <Section title="2 · Interés y negociación" desc="Qué tan dispuestos están y qué piden a cambio.">
            <Card title="¿Se unirían como Mesa Aliada?" n={rows.length}><InteresStack items={conteo(rows, "interes", Object.keys(LABELS.interes))} /></Card>
            <Card title="Descuento que darían" desc="Solo entre los interesados." n={descuentoInteresados(rows)[0]?.n}><Columnas items={descuentoInteresados(rows)} /></Card>
            <Card title="Qué quieren recibir a cambio" desc="Cada negocio escoge hasta 2 · % sobre quienes contestaron." className="lg:col-span-2"><Horizontal items={conteo(rows, "recibir", Object.keys(LABELS.recibir), true)} /></Card>
          </Section>

          <Section warningN={r.interesados < 15 ? r.interesados : undefined} title="3 · Cruces" desc="Combina dos respuestas para ver patrones. Cada celda es número de negocios interesados.">
            <Card title="Descuento según lo que venden"><Heatmap data={cruce(rows.filter(esInteresado), "categoria", "descuento")} /></Card>
            <Card title="Descuento según compra típica"><Heatmap data={cruce(rows.filter(esInteresado), "ticket", "descuento")} /></Card>
          </Section>

          <section className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="font-display text-2xl text-navy">4 · Mesas interesadas con contacto</h2>
            {contactos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía ninguna mesa ha dejado su contacto.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>{["Negocio", "Instagram", "Email", "Teléfono / WhatsApp", "Interés", "Descuento", "Qué vende"].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}<th className="py-2 font-medium"><Button variant="ghost" size="sm" onClick={() => setFechaAsc((v) => !v)} aria-label={`Ordenar fecha ${fechaAsc ? "más reciente primero" : "más antigua primero"}`}><ArrowUpDown className="mr-1 h-4 w-4" />Fecha {fechaAsc ? "↑" : "↓"}</Button></th></tr>
                  </thead>
                  <tbody>
                    {contactos.map((c) => {
                      const ig = (c.instagram ?? "").replace(/^@/, "").trim();
                      return (
                        <tr key={c.id} className="border-t">
                          <td className="py-2 pr-4 min-w-40">{c.negocio || "—"}<div className="flex flex-wrap gap-1">{c.is_test && <span className="rounded bg-cream-soft px-2 py-0.5 text-xs font-semibold text-navy">PRUEBA</span>}{!tieneDatosContacto(c) && <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Sin datos de contacto</span>}</div></td>
                          <td className="py-2 pr-4">{ig ? <a className="text-navy underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">@{ig}</a> : "—"}</td>
                          <td className="py-2 pr-4">{c.email ? <a className="text-navy underline" href={`mailto:${c.email}`}>{c.email}</a> : "—"}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{c.telefono || "—"}{whatsappUrl(c.telefono) && <Button asChild size="sm" variant="ghost"><a href={whatsappUrl(c.telefono) ?? undefined} target="_blank" rel="noreferrer" aria-label={`Abrir WhatsApp de ${c.negocio || "esta mesa"}`}><ExternalLink className="mr-1 h-4 w-4" />WhatsApp</a></Button>}</td>
                          <td className="py-2 pr-4">{LABELS.interes[c.interes] ?? c.interes}</td>
                          <td className="py-2 pr-4">{LABELS.descuento[c.descuento] ?? c.descuento}</td>
                          <td className="py-2 pr-4">{LABELS.categoria[c.categoria] ?? c.categoria}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{c.completada_en && new Date(c.completada_en).toLocaleDateString("en-GB", { timeZone: "America/Puerto_Rico", day: "2-digit", month: "2-digit", year: "numeric" })}</td>
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

function Section({ title, desc, children, warningN }: { title: string; desc: string; children: React.ReactNode; warningN?: number }) {
  return (
    <section className="space-y-4">
      <header className="border-b pb-2">
        <h2 className="font-display text-2xl text-navy">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </header>
      {warningN != null && <SampleNote n={warningN} />}
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function Card({ title, desc, n, className = "", children }: { title: string; desc?: string; n?: number; className?: string; children: React.ReactNode }) {
  return (
    <article className={`rounded-lg border bg-card p-5 space-y-3 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-navy">{title}</h3>
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

function SampleNote({ n }: { n: number }) {
  return <p className="text-sm text-muted-foreground">Muestra pequeña (n = {n}): lee tendencias, no conclusiones.</p>;
}

function Kpi({ label, value, subtext, icon: Icon }: { label: string; value: string; subtext: string; icon: typeof Mail }) {
  return <article className="min-w-0 rounded-lg border bg-card p-4 space-y-2"><div className="flex items-center justify-between gap-2"><h2 className="text-sm text-muted-foreground">{label}</h2><Icon className="h-5 w-5 shrink-0 text-gold" /></div><p className="font-display text-xl text-navy tabular-nums whitespace-nowrap">{value}</p><p className="text-xs text-muted-foreground whitespace-nowrap">{subtext}</p></article>;
}

function Funnel({ rows }: { rows: InteresRow[] }) {
  const pasos = embudo(rows);
  const r = resumen(rows);
  return <div className="space-y-4">{pasos.map((p, i) => <div key={p.key}>
    {i > 0 && <p className="mb-1 text-xs text-muted-foreground">↓ {pctFmt(p.pctPrev)} pasa al siguiente paso · se pierden {Math.max(0, pasos[i - 1].c - p.c)}</p>}
    <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-navy">{p.label}</span><span className="tabular-nums">{p.c} de {r.total} · {pctFmt(p.pctTotal)}</span></div>
    <div className="h-8 overflow-hidden rounded bg-muted"><div className="flex h-full" style={{ width: `${p.pctTotal * 100}%`, background: i === 0 ? NAVY : BRAND }}>{p.key === "interesados" && <><div style={{ width: `${r.interesados ? r.cuentan / r.interesados * 100 : 0}%`, background: BRAND }} /><div className="flex-1" style={{ background: INFO }} /></>}</div></div>
    {p.key === "interesados" && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><Legend color={BRAND} text={`Sí, cuenten conmigo · ${r.cuentan}`} /><Legend color={INFO} text={`Quiero información · ${r.interesados - r.cuentan}`} /></div>}
  </div>)}</div>;
}

function Legend({ color, text }: { color: string; text: string }) {
  return <span className="flex items-start gap-2"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />{text}</span>;
}

function Tendencia({ rows }: { rows: InteresRow[] }) {
  let acc = 0;
  const data = porDia(rows).map((d) => ({ ...d, dia: d.date.slice(5), acumulado: (acc += d.respuestas) }));
  const activos = data.filter((d) => d.respuestas > 0);
  const fecha = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("es-PR", { day: "numeric", month: "short" });
  if (activos.length <= 3) return <div className="min-h-40 flex flex-col justify-center gap-3"><p className="font-display text-xl text-navy">{acc} respuestas{activos.length === 1 ? ` · todas el ${fecha(activos[0].date)}` : " en los últimos 30 días"}</p>{activos.length !== 1 && activos.map((d) => <p key={d.date} className="text-sm text-muted-foreground">{fecha(d.date)} · {d.respuestas} {d.respuestas === 1 ? "respuesta" : "respuestas"}</p>)}</div>;
  return <div className="h-64"><ResponsiveContainer><ComposedChart data={data} margin={{ left: -20, right: 8, top: 8 }}><XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={4} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip {...tip} formatter={(v: number, k: string) => [v, k === "acumulado" ? "Total acumulado" : "Respuestas del día"]} /><Bar dataKey="respuestas" fill={NAVY} radius={[3, 3, 0, 0]} /><Line type="monotone" dataKey="acumulado" stroke={BRAND} strokeWidth={1.5} dot={false} /></ComposedChart></ResponsiveContainer><div className="flex flex-wrap gap-4 text-xs"><Legend color={NAVY} text="Respuestas del día" /><Legend color={BRAND} text="Total acumulado" /></div></div>;
}

function InteresStack({ items }: { items: ConteoItem[] }) {
  const color = (key: string) => key === "si" ? BRAND : key === "info" ? INFO : NEGATIVE;
  return <div className="space-y-4"><div className="flex h-10 overflow-hidden rounded" role="img" aria-label={items.map((it) => `${it.label}: ${it.c} · ${pctFmt(it.pct)}`).join(", ")}>{items.map((it) => <div key={it.key} style={{ width: `${it.pct * 100}%`, background: color(it.key) }} />)}</div><ul className="space-y-3 text-sm">{items.map((it) => <li key={it.key} className="flex items-start justify-between gap-3"><Legend color={color(it.key)} text={it.label} /><span className="shrink-0 tabular-nums">{it.c} · {pctFmt(it.pct)}</span></li>)}</ul></div>;
}

function Columnas({ items }: { items: ConteoItem[] }) {
  const top = Math.max(0, ...items.map((i) => i.c));
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart data={items.map((it) => ({ ...it, labelValue: it.c ? `${it.c} · ${pctFmt(it.pct)}` : "0" }))} margin={{ left: 0, right: 0, top: 30 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickFormatter={(s) => short(s, 14)} interval={0} />
          <Tooltip {...tip} formatter={(v: number, _k, p) => [`${v} · ${pctFmt((p?.payload as ConteoItem).pct)}`, "Negocios"]} cursor={{ fill: GRID }} />
          <Bar dataKey="c" radius={[6, 6, 0, 0]}>
            {items.map((it) => <Cell key={it.key} fill={it.c === top && top > 0 ? BRAND : MUTED} />)}
            <LabelList dataKey="labelValue" position="top" style={{ fontSize: 11, fill: NAVY }} />
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
            <span className={it.c === top && top > 0 ? "font-semibold text-navy" : ""}><span className="mr-2 text-muted-foreground">#{i + 1}</span>{it.label}</span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{it.c} · {pctFmt(it.pct)}</span>
          </div>
          <div className="h-3 rounded-full" style={{ background: GRID }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${it.pct * 100}%`, background: it.c === top && top > 0 ? BRAND : MUTED }} />
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
          <tr><th />{data.cols.map((c) => <th key={c.key} className="px-1 font-medium text-muted-foreground">{c.label}</th>)}<th className="px-2">Total</th></tr>
        </thead>
        <tbody>
          {data.filas.map((f) => (
            <tr key={f.key}>
              <td className="pr-2 text-sm whitespace-nowrap" title={f.label}>{short(f.label, 22)}</td>
              {f.valores.map((v, i) => (
                <td key={i} className="h-9 min-w-12 rounded text-center font-semibold tabular-nums" style={{ background: v ? `color-mix(in srgb, ${BRAND} ${Math.round(20 + (v / (data.max || 1)) * 80)}%, white)` : GRID, color: v / (data.max || 1) > 0.6 ? "white" : NAVY }}>
                  {v}
                </td>
              ))}
              <td className="px-2 text-center font-semibold bg-muted">{f.total}</td>
            </tr>
          ))}
          <tr className="bg-muted font-semibold"><th className="p-2 text-left">Total</th>{data.totales.map((v, i) => <td key={i} className="p-2 text-center">{v}</td>)}<td className="p-2 text-center">{data.total}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
