import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Copy, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listEncuestaRespuestas, exportListaEspera } from "@/lib/encuesta.functions";
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
const SIGNAL_COLOR = { fuerte: BRAND, moderada: "#e0a526", debil: BAD } as const;

function EncuestaAdminPage() {
  const listFn = useServerFn(listEncuestaRespuestas);
  const exportFn = useServerFn(exportListaEspera);
  const [downloading, setDownloading] = useState(false);
  const q = useQuery({ queryKey: ["admin", "encuesta"], queryFn: () => listFn() });
  const rows = (q.data?.respuestas ?? []) as unknown as EncuestaRow[];
  const d = useMemo(() => (rows.length ? computeDashboard(rows) : null), [rows]);

  const download = async () => {
    setDownloading(true);
    try {
      const list = await exportFn();
      if (!list.length) toast.info("Todavía no hay nadie en la lista de espera.");
      else downloadCSV(`lista-espera-encuesta-${new Date().toISOString().slice(0, 10)}.csv`, list);
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
          <p className="text-sm text-muted-foreground">Resultados de rutamercadopr.com/encuesta</p>
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
        </div>
      </header>

      {q.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Cargando respuestas…</div>
      ) : q.isError ? (
        <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar las respuestas.</div>
      ) : !d ? (
        <EmptyState />
      ) : (
        <Dashboard d={d} />
      )}
    </div>
  );
}

function EmptyState() {
  const copy = async () => {
    await navigator.clipboard.writeText("https://rutamercadopr.com/encuesta");
    toast.success("Enlace copiado");
  };
  return (
    <div className="rounded-xl border bg-card p-10 text-center space-y-4">
      <p className="text-[#18253f]">Todavía no hay respuestas. Comparte rutamercadopr.com/encuesta para empezar.</p>
      <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Copiar enlace</Button>
    </div>
  );
}

type D = ReturnType<typeof computeDashboard>;

function Dashboard({ d }: { d: D }) {
  const t = d.tiles;
  return (
    <>
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">¿Pagarían $24 al año por la membresía?</p>
        <p className="font-display text-3xl md:text-4xl text-[#18253f] leading-tight">
          <span className="inline-block h-[0.55em] w-[0.55em] rounded-full mr-2 align-[0.08em]" style={{ background: SIGNAL_COLOR[d.signal] }} />
          {d.verdict}
        </p>
        <p className="text-lg leading-snug max-w-3xl">
          De cada 10 personas, <b>{Math.round(d.sSi * 10)} pagarían los $24</b> y{" "}
          <b>{Math.round(d.sComp * 10) || "menos de 1"} ya dejaron su email</b>. Esas {int(d.comp)} personas ({pct(d.sComp)}) son las más probables de comprar.
        </p>
        <div className="flex h-2.5 max-w-2xl overflow-hidden rounded-full" style={{ background: GRID }} aria-hidden>
          {d.strip.slice(0, 3).map((s) => (
            <span key={s.label} style={{ width: `${Math.max(0, s.v) * 100}%`, background: toneColor[s.tone] }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {d.strip.map((s) => (
            <span key={s.label}><i className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-[-1px]" style={{ background: toneColor[s.tone] }} />{s.label} {pct(Math.max(0, s.v))}</span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Respuestas" value={int(t.n)} sub={`${pct(t.qr)} llegó por el QR en un mercado.`} />
        <Tile label="Gastan por visita" value={money(t.gasto)} sub={`en promedio. ${pct(t.gasto1550)} gasta entre $15 y $50.`} />
        <Tile label="Van a mercados" value={`${dec1(t.visitas)} al mes`} sub={`Gastan unos ${money(t.gastoMes)} al mes en mercados.`} />
        <Tile label="Mercados distintos" value={dec1(t.mercados)} sub="en los últimos 3 meses, en promedio." />
        <Tile label="Lista de espera" value={int(t.em)} sub={`${pct(t.em / t.n)} dejó su email. ${int(t.fin)} se anotaron después del cálculo de ahorro.`} />
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

      <Section title="Qué compran y qué los mueve" desc="% de personas que escogió cada opción. Podían marcar varias, por eso no suman 100%.">
        <BarCard title="En qué gastan más" items={d.compran.categorias} max={1} />
        <BarCard title="Qué los haría ir a más mercados" items={d.compran.motivos} max={1} />
        <BarCard title="Cómo deciden a qué mercado ir" items={d.compran.descubren} max={1} />
      </Section>

      <Section title="La membresía" desc="Cuánto pagarían, cómo la pagarían y qué los frena.">
        <BarCard title="Lo máximo que pagarían al año" note="En verde, quienes aceptan $24 o más." items={d.membresia.precio} noTop />
        <article className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-display text-lg text-[#18253f]">Cómo la pagarían</h3>
          <p className="text-xs text-muted-foreground">Entre las {int(d.membresia.planN)} personas que llegaron a escoger plan.</p>
          <div className="flex h-8 overflow-hidden rounded-md text-xs font-semibold text-white">
            {d.membresia.plan.map((x, i) => x.v > 0 && (
              <div key={x.key} className="flex items-center justify-center" style={{ width: `${x.v * 100}%`, background: [BRAND, NAVY, MUTED][i] }}>{x.v >= 0.12 ? pct(x.v) : ""}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {d.membresia.plan.map((x, i) => (
              <span key={x.key}><i className="inline-block h-2.5 w-2.5 rounded-full mr-1.5" style={{ background: [BRAND, NAVY, MUTED][i] }} />{x.label} {pct(x.v)}</span>
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
            De {int(d.n)} respuestas, <b>{pct(d.resumen.general)} pagaría los $24</b> y <b>{int(d.comp)} personas ({pct(d.sComp)})</b> además dejaron su email. Ese es el número que más se parece a una venta real.
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

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <strong className="block font-display text-3xl text-[#18253f] tabular-nums">{value}</strong>
      <p className="text-xs text-muted-foreground">{sub}</p>
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
      <div className="space-y-2">
        {items.map((it) => {
          const isTop = !noTop && it.v === top && top > 0;
          const bg = it.color === "brand" ? BRAND : it.color === "bad" ? BAD : it.color === "muted" ? MUTED : isTop ? BRAND : MUTED;
          return (
            <div key={it.key} className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-2 text-sm">
              <span className={`truncate ${isTop ? "font-semibold text-[#18253f]" : ""}`} title={it.label}>{it.label}</span>
              <div className="h-2 rounded-full" style={{ background: GRID }}>
                <div className="h-full rounded-full" style={{ width: `${(it.v / m) * 100}%`, background: bg }} />
              </div>
              <span className="text-right tabular-nums text-xs">{pct(it.v)}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SegCard({ title, seg }: { title: string; seg: ReturnType<typeof computeDashboard>["segments"][SegField] }) {
  const { groups, best, big, maxSize, general } = seg;
  return (
    <article className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {best && big ? (
          <>El grupo más grande es <b>{big.label} ({pct(big.size)})</b>. El que más pagaría: <b>{best.label}, {pct(best.pay)}</b> contra {pct(general)} en general.</>
        ) : "Grupos muy pequeños para comparar."}
      </p>
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
              return (
                <tr key={g.key} className={`border-t ${g.n < MIN ? "opacity-45" : ""} ${isBest ? "bg-[#54b678]/5" : ""}`}>
                  <td className="py-2 pr-2">
                    <b className="text-[#18253f]">{g.label}</b>
                    {isBest && <span className="ml-1.5 rounded-full bg-[#54b678]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#2f7a4b]">más interés</span>}
                    <span className="block text-xs text-muted-foreground">{int(g.n)} personas · {pct(g.size)}</span>
                    <div className="mt-1 h-1 w-24 rounded-full" style={{ background: GRID }}>
                      <i className="block h-full rounded-full" style={{ width: `${(g.size / maxSize) * 100}%`, background: NAVY }} />
                    </div>
                  </td>
                  <td className="py-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-[#18253f]"
                      style={{ background: isBest ? BRAND : `color-mix(in srgb, ${BRAND} ${Math.round(g.pay * 70 + 6)}%, transparent)` }}>
                      {pct(g.pay)}
                    </span>
                  </td>
                  <td className="py-2 tabular-nums">{money(g.spend)}</td>
                  <td className="py-2 tabular-nums">{pct(g.mail)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
