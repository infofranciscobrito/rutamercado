import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Copy, ArrowDown, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { filterRows, plural, topMesas, fmtProp, fmtVal, SMALL, computeMetricas, type RawRow } from "@/lib/encuesta-stats";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listEncuestaRespuestas, exportListaEspera, deleteTestRespuestas, exportTodasRespuestas, getEncuestaConfig, saveEncuestaConfig } from "@/lib/encuesta.functions";
import { downloadCSV } from "@/lib/csv";
import {
  computeDashboard, int, pct, money, dec1, MIN,
  type EncuestaRow, type DistItem, type SegField,
} from "@/lib/encuesta-stats";

export const Route = createFileRoute("/_admin/admin/encuesta")({
  head: () => ({ meta: [{ title: "Encuesta de membresía · Admin RutaMercado" }, { name: "robots", content: "noindex" }] }),
  component: EncuestaAdminPage,
});

const BRAND = "#54b678";
const NAVY = "#18253f";
const MUTED = "rgba(24,37,63,0.25)";
const GRID = "rgba(24,37,63,0.08)";
const BAD = "#d9534f";
const toneColor = { brand: BRAND, brandSoft: "rgba(84,182,120,0.45)", muted: MUTED, grid: GRID } as const;

function EncuestaAdminPage() {
  const listFn = useServerFn(listEncuestaRespuestas);
  const exportFn = useServerFn(exportListaEspera);
  const [downloading, setDownloading] = useState(false);
  const q = useQuery({ queryKey: ["admin", "encuesta"], queryFn: () => listFn() });
  const delFn = useServerFn(deleteTestRespuestas);
  const [version, setVersion] = useState("v2");
  const [showTest, setShowTest] = useState(false);
  const raw = (q.data?.respuestas ?? []) as unknown as RawRow[];
  const rows = useMemo(() => filterRows(raw, { version, showTest }), [raw, version, showTest]);
  const testCount = raw.filter((r) => r.is_test).length;
  const borrarPruebas = async () => {
    if (!window.confirm(`¿Borrar ${testCount} respuesta(s) de prueba? Esto no se puede deshacer.`)) return;
    try {
      const r = await delFn();
      toast.success(`Se borraron ${r.deleted} respuesta(s) de prueba.`);
      void q.refetch();
    } catch {
      toast.error("No se pudieron borrar las respuestas de prueba.");
    }
  };
  const d = useMemo(() => (rows.length ? computeDashboard(rows) : null), [rows]);

  const allFn = useServerFn(exportTodasRespuestas);
  const downloadAll = async () => {
    try {
      const all = await allFn();
      const list = all.filter((r) => (showTest || !r.is_test) && (version === "todas" || (r.survey_version ?? "v1") === version));
      if (!list.length) { toast.info("No hay respuestas con estos filtros."); return; }
      downloadCSV(`encuesta-respuestas-${version}-${new Date().toISOString().slice(0, 10)}.csv`,
        list.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Array.isArray(v) ? v.join("; ") : v]))));
    } catch {
      toast.error("No se pudieron descargar las respuestas.");
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const list = await exportFn();
      if (!list.length) toast.info("Todavía no hay nadie en la lista de espera.");
      else downloadCSV(`lista-espera-encuesta-${new Date().toISOString().slice(0, 10)}.csv`, list.map(({ email_confirmed, ...r }) => ({ ...r, confirmado: email_confirmed ? "sí" : "no" })));
    } catch {
      toast.error("No se pudo descargar la lista de espera.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Encuesta de membresía</h1>
          <p className="text-sm text-muted-foreground">Resultados de rutamercadopr.com/rutralover</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">Versión
              <select value={version} onChange={(e) => setVersion(e.target.value)} className="rounded-md border bg-background px-2 py-1">
                <option value="v2">v2</option><option value="v1">v1</option><option value="todas">Todas</option>
              </select>
            </label>
            <label className="flex items-center gap-2"><Switch checked={showTest} onCheckedChange={setShowTest} /> Ver respuestas de prueba</label>
            <Button variant="outline" size="sm" onClick={borrarPruebas} disabled={!testCount}><Trash2 className="h-4 w-4" /> Borrar respuestas de prueba ({testCount})</Button>
          </div>
        </div>
        <div className="flex gap-2">
          {d && (
            <Button variant="outline" onClick={() => document.getElementById("resumen")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Ir al resumen <ArrowDown className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={download} disabled={downloading} className="bg-[#54b678] hover:bg-[#54b678]/90 text-white">
            <Download className="h-4 w-4" /> Descargar lista de espera (CSV)
          </Button>
          <Button variant="outline" onClick={downloadAll}>
            <Download className="h-4 w-4" /> Descargar todas las respuestas (CSV)
          </Button>
        </div>
      </header>

      {q.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Cargando respuestas…</div>
      ) : q.isError ? (
        <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar las respuestas.</div>
      ) : !d ? (
        <EmptyState />
      ) : (
        <Dashboard d={d} rows={rows} />
      )}
    </div>
  );
}

function EmptyState() {
  const copy = async () => {
    await navigator.clipboard.writeText("https://rutamercadopr.com/rutralover");
    toast.success("Enlace copiado");
  };
  return (
    <div className="rounded-xl border bg-card p-10 text-center space-y-4">
      <p className="text-[#18253f]">Todavía no hay respuestas. Comparte rutamercadopr.com/rutralover para empezar.</p>
      <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Copiar enlace</Button>
    </div>
  );
}

type D = ReturnType<typeof computeDashboard>;

function Dashboard({ d, rows }: { d: D; rows: EncuestaRow[] }) {
  const t = d.tiles;
  return (
    <>
      <Metricas rows={rows} />
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">¿Pagarían $24 al año por la membresía?</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Pagarían $24</span>
            <p className="font-display text-3xl text-[#18253f] tabular-nums">{fmtProp(d.si, d.n)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Pagarían y dejaron email</span>
            <p className="font-display text-3xl text-[#18253f] tabular-nums">{fmtProp(d.comp, d.n)}</p>
          </div>
        </div>
        <NNote n={d.n} />
        <div className="flex h-2.5 max-w-2xl overflow-hidden rounded-full" style={{ background: GRID }} aria-hidden>
          {d.strip.slice(0, 3).map((s) => (
            <span key={s.label} style={{ width: `${Math.max(0, s.v) * 100}%`, background: toneColor[s.tone] }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {d.strip.map((s) => (
            <span key={s.label}><i className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-[-1px]" style={{ background: toneColor[s.tone] }} />{s.label} {d.n < SMALL ? `${Math.round(Math.max(0, s.v) * d.n)} de ${d.n}` : pct(Math.max(0, s.v))}</span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile n={t.n} label={plural(t.n, "Respuesta", "Respuestas")} value={int(t.n)} sub={`${fmtVal(Math.round(t.qr * t.n), t.n)} llegó por el QR en un mercado.`} />
        <GastoTile rows={rows} gasto1550={fmtVal(Math.round(t.gasto1550 * t.n), t.n)} />
        <Tile n={t.n} label="Van a mercados" value={`${dec1(t.visitas)} al mes`} sub={`Gastan unos ${money(t.gastoMes)} al mes en mercados. Promedio del gasto mensual de cada persona (gasto × frecuencia).`} />
        <Tile n={t.n} label="Mercados distintos" value={dec1(t.mercados)} sub="en los últimos 3 meses, en promedio." />
        <Tile n={t.n} label="Lista de espera" value={int(t.em)} sub={`${fmtProp(t.em, t.n)} dejó su email. ${int(t.fin)} ${plural(t.fin, "se anotó", "se anotaron")} después del cálculo de ahorro.`} />
      </section>

      <Section title="Quiénes respondieron y quiénes pagarían" desc="Cada grupo con su tamaño, qué parte pagaría los $24, cuánto gasta por visita y cuántos dejaron su email. El grupo con más interés sale resaltado.">
        <SegCard title="Por edad" seg={d.segments.edad} />
        <SegCard title="Por género" seg={d.segments.sexo} />
        <SegCard title="Por zona" seg={d.segments.region} />
        <SegCard title="Por canal de llegada" seg={d.segments.origen} />
      </Section>

      <Section title="Cómo van a los mercados" desc="Cuánto gastan, cada cuánto van y a cuántos mercados distintos.">
        <BarCard title="Cuánto gastan por visita" items={d.como.gasto} />
        <BarCard title="Cada cuánto van" items={d.como.frecuencia} />
        <BarCard title="Mercados distintos en 3 meses" items={d.como.mercados} />
        <BarCard title="¿Vuelven a las mismas mesas?" items={d.como.lealtad} />
      </Section>

      <Section title="Qué compran y qué los mueve" desc="Podían marcar varias opciones, por eso no suman 100%.">
        <BarCard title="En qué gastan más" note="% que lo puso entre sus opciones (hasta 3)" items={d.compran.categorias} max={1} />
        <BarCard title="Qué los haría ir a más mercados" note="% que lo puso entre sus opciones (hasta 3)" items={d.compran.motivos} max={1} />
        <BarCard title="Cómo deciden a qué mercado ir" note="% que lo puso entre sus opciones (hasta 2)" items={d.compran.descubren} max={1} />
        <MesasCard rows={rows as unknown as RawRow[]} />
      </Section>

      <Section title="La membresía" desc="Cuánto pagarían, cómo la pagarían y qué los frena.">
        <BarCard title="Lo máximo que pagarían al año" note="En verde, quienes aceptan $24 o más." items={d.membresia.precio} noTop />
        <article className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-display text-lg text-[#18253f]">Cómo la pagarían</h3>
          <p className="text-xs text-muted-foreground">{plural(d.membresia.planN, "Entre la persona que llegó", `Entre las ${int(d.membresia.planN)} personas que llegaron`)} a escoger plan.</p>
          <NNote n={d.membresia.planN} />
          <div className="flex h-8 overflow-hidden rounded-md text-xs font-semibold text-white">
            {d.membresia.plan.map((x, i) => x.v > 0 && (
              <div key={x.key} className="flex items-center justify-center" style={{ width: `${x.v * 100}%`, background: [BRAND, NAVY, MUTED][i] }}>{x.v >= 0.12 ? fmtVal(x.c, x.n) : ""}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {d.membresia.plan.map((x, i) => (
              <span key={x.key}><i className="inline-block h-2.5 w-2.5 rounded-full mr-1.5" style={{ background: [BRAND, NAVY, MUTED][i] }} />{x.label} {fmtVal(x.c, x.n)}</span>
            ))}
          </div>
        </article>
        <BarCard title="Lo que más los frena" note='Entre quienes no dijeron "La compraría seguro".' items={d.membresia.dudas} />
      </Section>

      <section id="resumen" className="scroll-mt-6 rounded-xl border-2 border-[#54b678] bg-card p-6 space-y-5">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen</p>
          <h2 className="font-display text-2xl text-[#18253f]">{d.resumen.titulo}</h2>
          <p className="text-sm">
            De {int(d.n)} {plural(d.n, "respuesta", "respuestas")}, <b>{fmtProp(d.si, d.n)} pagaría los $24</b> y <b>{int(d.comp)} {plural(d.comp, "persona", "personas")} ({fmtProp(d.comp, d.n)})</b> además {plural(d.comp, "dejó", "dejaron")} su email. Ese es el número que más se parece a una venta real.
          </p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.resumen.facts.map(([a, b, p]) => (
            <div key={a} className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{a}</span>
              <strong className="block font-display text-lg text-[#18253f]">{b}</strong>
              <p className="text-xs text-muted-foreground">{p}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-display text-lg text-[#18253f] mb-2">Qué hacer ahora</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            {d.resumen.todo.map(([b, rest]) => <li key={b}><b>{b}</b>{rest}</li>)}
          </ol>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        "Pagarían $24" = escogieron plan anual o mensual. "Lo están pensando" = contestaron "No sé todavía" o no escogieron plan. Gasto, visitas y mercados usan el punto medio de cada rango. Grupos con menos de {MIN} personas salen atenuados y no compiten por "más interés". Señal buena desde 15% que pagaría y dejó email; moderada entre 8% y 15%.
      </p>
    </>
  );
}

function NNote({ n }: { n: number }) {
  return (
    <p className="text-xs text-muted-foreground">
      n = {int(n)}{n < SMALL && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Muestra muy pequeña</span>}
    </p>
  );
}

function Tile({ label, value, sub, n }: { label: string; value: string; sub: string; n: number }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <strong className="block font-display text-3xl text-[#18253f] tabular-nums">{value}</strong>
      <p className="text-xs text-muted-foreground">{sub}</p>
      <NNote n={n} />
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-2xl text-[#18253f]">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function BarCard({ title, items, max, noTop, note }: { title: string; items: DistItem[]; max?: number; noTop?: boolean; note?: string }) {
  const top = Math.max(0, ...items.map((i) => i.v));
  const m = max ?? (top || 1);
  return (
    <article className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      <NNote n={items[0]?.n ?? 0} />
      <div className="space-y-2">
        {items.map((it) => {
          const isTop = !noTop && it.v === top && top > 0;
          const bg = it.color === "brand" ? BRAND : it.color === "bad" ? BAD : it.color === "muted" ? MUTED : isTop ? BRAND : MUTED;
          return (
            <div key={it.key} className="grid grid-cols-[minmax(0,10rem)_1fr_3.5rem] items-center gap-2 text-sm">
              <span className={`truncate ${isTop ? "font-semibold text-[#18253f]" : ""}`} title={it.label}>{it.label}</span>
              <div className="h-2 rounded-full" style={{ background: GRID }}>
                <div className="h-full rounded-full" style={{ width: `${(it.v / m) * 100}%`, background: bg }} />
              </div>
              <span className="text-right tabular-nums text-xs">{fmtVal(it.c, it.n)}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SegCard({ title, seg }: { title: string; seg: ReturnType<typeof computeDashboard>["segments"][SegField] }) {
  const { groups, best, big, maxSize, general, n } = seg;
  return (
    <article className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {best && big ? (
          <>El grupo más grande es <b>{big.label} ({fmtVal(big.n, n)})</b>. El que más pagaría: <b>{best.label}, {fmtProp(best.payK, best.n)}</b> contra {fmtVal(Math.round(general * n), n)} en general.</>
        ) : "Grupos muy pequeños para comparar."}
      </p>
      <NNote n={n} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 font-medium">Grupo</th><th className="py-1 font-medium">Pagarían $24</th>
              <th className="py-1 font-medium">Gasto / visita</th><th className="py-1 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const isBest = best?.key === g.key;
              const isOtros = g.key === "otros";
              return (
                <tr key={g.key} className={`border-t ${g.n < MIN || isOtros ? "opacity-45" : ""} ${isBest ? "bg-[#54b678]/5" : ""}`}>
                  <td className="py-2 pr-2">
                    <b className="text-[#18253f]">{g.label}</b>
                    {isBest && <span className="ml-1.5 rounded-full bg-[#54b678]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#2f7a4b]">más interés</span>}
                    <span className="block text-xs text-muted-foreground">{int(g.n)} {plural(g.n, "persona", "personas")}{n >= SMALL ? ` · ${pct(g.size)}` : ""}</span>
                    <div className="mt-1 h-1 w-24 rounded-full" style={{ background: GRID }}>
                      <i className="block h-full rounded-full" style={{ width: `${(g.size / maxSize) * 100}%`, background: NAVY }} />
                    </div>
                  </td>
                  <td className="py-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-[#18253f]"
                      style={{ background: isBest ? BRAND : `color-mix(in srgb, ${BRAND} ${Math.round(g.pay * 70 + 6)}%, transparent)` }}>
                      {fmtProp(g.payK, g.n)}
                    </span>
                  </td>
                  <td className="py-2 tabular-nums">{money(g.spend)}</td>
                  <td className="py-2 tabular-nums">{fmtVal(g.mailK, g.n)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function MesasCard({ rows }: { rows: RawRow[] }) {
  const list = topMesas(rows.map((r) => (r as { mesas_favoritas?: string | null }).mesas_favoritas), 1000);
  const n = rows.filter((r) => (r as { mesas_favoritas?: string | null }).mesas_favoritas).length;
  return (
    <article className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">Mesas favoritas</h3>
      <p className="text-xs text-muted-foreground">{n} {plural(n, "persona escribió", "personas escribieron")} sus mesas favoritas.</p>
      {list.length === 0 ? <p className="text-sm text-muted-foreground">Todavía nadie ha escrito mesas.</p> : (
        <ul className="space-y-1 text-sm">
          {list.map((m) => <li key={m.name} className="flex justify-between gap-2"><span>{m.name}</span><b className="text-[#18253f]">{m.n}</b></li>)}
        </ul>
      )}
    </article>
  );
}

function GastoTile({ rows, gasto1550 }: { rows: EncuestaRow[]; gasto1550: string }) {
  const g = computeMetricas(rows, { seguro: 0, probable: 0 }).gasto;
  return (
    <div className="rounded-xl border bg-card p-5 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gastan por visita</span>
      <strong className="block font-display text-3xl text-[#18253f] tabular-nums">{money(g.mediana)} <span className="text-base font-normal text-muted-foreground">mediana</span></strong>
      <p className="text-sm text-[#18253f]">Promedio: {money(g.promedio)}</p>
      <p className="text-xs text-muted-foreground">{gasto1550} gasta entre $15 y $50.</p>
      <p className="text-xs text-muted-foreground italic">Calculado con el punto medio de cada rango; 'Más de $80' = $100.</p>
      <NNote n={g.n} />
    </div>
  );
}

function MetricCard({ label, value, sub, n, children, big }: { label: string; value?: string; sub?: string; n: number; children?: React.ReactNode; big?: boolean }) {
  return (
    <div className={"rounded-xl border bg-card p-5 space-y-1" + (big ? " border-2 border-[#54b678]" : "")}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {value && <strong className={"block font-display text-[#18253f] tabular-nums " + (big ? "text-4xl" : "text-2xl")}>{value}</strong>}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {children}
      <NNote n={n} />
    </div>
  );
}

function Metricas({ rows }: { rows: EncuestaRow[] }) {
  const getFn = useServerFn(getEncuestaConfig);
  const saveFn = useServerFn(saveEncuestaConfig);
  const cfg = useQuery({ queryKey: ["admin", "encuesta", "config"], queryFn: () => getFn() });
  const pesos = { seguro: cfg.data?.peso_seguro ?? 0.75, probable: cfg.data?.peso_probable ?? 0.25 };
  const [edit, setEdit] = useState<{ a: string; b: string } | null>(null);
  const m = useMemo(() => computeMetricas(rows, pesos), [rows, pesos.seguro, pesos.probable]);
  const save = async () => {
    if (!edit) return;
    const a = Number(edit.a), b = Number(edit.b);
    if (!(a >= 0 && a <= 1 && b >= 0 && b <= 1)) { toast.error("Los factores deben estar entre 0 y 1."); return; }
    try { await saveFn({ data: { peso_seguro: a, peso_probable: b } }); await cfg.refetch(); setEdit(null); toast.success("Factores guardados"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo guardar"); }
  };
  const e = m.efecto;
  return (
    <section className="space-y-4">
      <MetricCard big label="1 · Comprador calificado" value={fmtProp(m.calificado.k, m.calificado.n)} n={m.calificado.n}
        sub='Intención (después del ahorro, o antes si no hay) "seguro" o "probablemente sí", acepta $24 o más y confirmó su correo.' />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="2 · Intención ponderada" value={m.ponderada.n ? pct(m.ponderada.v) : "—"} n={m.ponderada.n}
          sub={`${pesos.seguro} × ${pct(m.ponderada.pSeg)} seguro + ${pesos.probable} × ${pct(m.ponderada.pProb)} probablemente sí. Solo quienes vieron la pregunta.`}>
          {edit ? (
            <div className="flex flex-wrap items-end gap-2 pt-1 text-xs">
              <label>Seguro<input type="number" step="0.05" min="0" max="1" value={edit.a} onChange={(ev) => setEdit({ ...edit, a: ev.target.value })} className="ml-1 w-16 rounded border px-1 py-0.5" /></label>
              <label>Prob. sí<input type="number" step="0.05" min="0" max="1" value={edit.b} onChange={(ev) => setEdit({ ...edit, b: ev.target.value })} className="ml-1 w-16 rounded border px-1 py-0.5" /></label>
              <Button size="sm" onClick={save}>Guardar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button>
            </div>
          ) : (
            <button type="button" className="text-xs underline text-[#18253f]" onClick={() => setEdit({ a: String(pesos.seguro), b: String(pesos.probable) })}>Editar factores</button>
          )}
        </MetricCard>
        <MetricCard label="3 · % que acepta el precio" value={fmtProp(m.precio.k, m.precio.n)} n={m.precio.n} sub="Máximo que pagaría: $24 o más." />
        <MetricCard label="4 · Efecto del cálculo de ahorro" n={e.n}
          value={e.n ? `${fmtVal(e.antesK, e.n)} → ${fmtVal(e.despuesK, e.n)}` : "—"}
          sub={e.n ? `"Seguro" + "probablemente sí", antes vs después del ahorro. ${e.subieron} ${plural(e.subieron, "persona subió", "personas subieron")} de categoría.` : "Todavía no hay respuestas con la pregunta de después."} />
        <MetricCard label="5 · La membresía se paga sola" value={m.pagaSola.n ? fmtProp(m.pagaSola.k, m.pagaSola.n) : "—"} n={m.pagaSola.n}
          sub={`ahorraría $24 o más al año (gasto × visitas × 10%). Ahorro mediano: ${money(m.pagaSola.mediana)} al año. Supone que todo su gasto es en Mesas Aliadas.`} />
        <MetricCard label="7 · Calidad de datos" n={m.calidad.n}>
          <ul className="space-y-1 text-sm text-[#18253f]">
            <li className="flex justify-between gap-2"><span>Precio inconsistente ($36+ pero duda a $24)</span><b>{m.calidad.inconsistente}</b></li>
            <li className="flex justify-between gap-2"><span>Completadas en menos de 30 segundos</span><b>{m.calidad.rapidas}</b></li>
            <li className="flex justify-between gap-2"><span>Van poco pero dicen 4+ mercados en 3 meses</span><b>{m.calidad.contradictoria}</b></li>
          </ul>
        </MetricCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricCard label='6 · Freno principal: "¿Qué es lo que más te haría dudar?"' n={m.freno.n}>
          {m.freno.n === 0 ? <p className="text-sm text-muted-foreground">Nadie ha visto esta pregunta todavía.</p> : (
            <ul className="space-y-1 text-sm">
              {m.freno.items.map((x) => <li key={x.key} className="flex justify-between gap-2"><span>{x.label}</span><b className="text-[#18253f] tabular-nums">{fmtVal(x.c, x.n)}</b></li>)}
            </ul>
          )}
          {m.freno.otros.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground">Respuestas "Otra":</p>
              <ul className="list-disc pl-5 text-sm">{m.freno.otros.map((o, i) => <li key={i}>{o}</li>)}</ul>
            </div>
          )}
        </MetricCard>
      </div>
    </section>
  );
}
