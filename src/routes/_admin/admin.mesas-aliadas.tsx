import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Copy, Trash2, MessageSquare, Heart, Handshake, Mail, UserX } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/admin/MetricCard";
import { downloadCSV } from "@/lib/csv";
import { listMesasAliadasInteres, exportContactosMesasAliadas, deleteTestMesasAliadas } from "@/lib/mesas-aliadas-interes.functions";
import { filtrar, resumen, conteo, descuentoInteresados, porDia, LABELS, type ConteoItem } from "@/lib/mesas-aliadas-interes-stats";

const SHARE = "https://rutamercadopr.com/mesas-aliadas/interes";
const BRAND = "#54b678";
const MUTED = "rgba(24,37,63,0.25)";
const GRID = "rgba(24,37,63,0.08)";
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

          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg text-[#18253f] mb-4">Respuestas por día (30 días)</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={porDia(rows)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="respuestas" stroke="#18253f" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Section title="Respuestas" desc="Cómo contestaron los negocios.">
            <BarCard title="¿Se unirían como Mesa Aliada?" items={conteo(rows, "interes", Object.keys(LABELS.interes))} />
            <BarCard title="Descuento que darían" note="Solo entre los interesados." items={descuentoInteresados(rows)} />
            <BarCard title="Qué quieren recibir a cambio" note="Cada negocio escoge hasta 2." items={conteo(rows, "recibir", Object.keys(LABELS.recibir), true)} />
            <BarCard title="Compra típica por cliente" items={conteo(rows, "ticket", Object.keys(LABELS.ticket))} />
            <BarCard title="Mercados al mes" items={conteo(rows, "frecuencia", Object.keys(LABELS.frecuencia))} />
            <BarCard title="Qué venden" items={conteo(rows, "categoria", Object.keys(LABELS.categoria), true)} />
            <BarCard title="De dónde llegaron" items={conteo(rows, "origen", undefined, true)} />
          </Section>

          <section className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-display text-2xl text-[#18253f]">Mesas interesadas con contacto</h2>
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
      <header>
        <h2 className="font-display text-2xl text-[#18253f]">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function BarCard({ title, items, note }: { title: string; items: ConteoItem[]; note?: string }) {
  const top = Math.max(0, ...items.map((i) => i.pct));
  const m = top || 1;
  return (
    <article className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      <p className="text-xs text-muted-foreground">n = {items[0]?.n ?? 0}</p>
      <div className="space-y-2">
        {items.map((it) => {
          const isTop = it.pct === top && top > 0;
          return (
            <div key={it.key} className="grid grid-cols-[minmax(0,10rem)_1fr_4.5rem] items-center gap-2 text-sm">
              <span className={`truncate ${isTop ? "font-semibold text-[#18253f]" : ""}`} title={it.label}>{it.label}</span>
              <div className="h-2 rounded-full" style={{ background: GRID }}>
                <div className="h-full rounded-full" style={{ width: `${(it.pct / m) * 100}%`, background: isTop ? BRAND : MUTED }} />
              </div>
              <span className="text-right tabular-nums text-xs">{it.c} · {pctFmt(it.pct)}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
