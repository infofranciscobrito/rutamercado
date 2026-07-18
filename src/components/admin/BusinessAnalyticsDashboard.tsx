import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  getBusinessRegistrationAnalytics,
  exportBusinessRegistrationsRows,
  type AnalyticsFilters,
  type BusinessAnalytics,
} from "@/lib/admin-emprendedores.functions";
import {
  EMPRENDEDOR_CATEGORIES,
  REGISTRO_COMERCIANTE_OPTIONS,
  FUENTE_INGRESO_OPTIONS,
  TIEMPO_OPERANDO_OPTIONS,
} from "@/lib/emprendedores.functions";
import { MARKET_REGIONS } from "@/types/market";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { downloadCSV } from "@/lib/csv";

type Preset = "7" | "30" | "90" | "mtd" | "today" | "custom" | "all";

function computeRange(preset: Preset, customFrom: string, customTo: string): { from: string | null; to: string | null } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (preset === "all") return { from: null, to: null };
  if (preset === "today") {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    return { from: s, to: end.toISOString() };
  }
  if (preset === "mtd") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { from: s, to: end.toISOString() };
  }
  if (preset === "custom") {
    return {
      from: customFrom ? new Date(customFrom + "T00:00:00").toISOString() : null,
      to: customTo ? new Date(customTo + "T23:59:59").toISOString() : null,
    };
  }
  const days = Number(preset);
  const s = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  return { from: s, to: end.toISOString() };
}

const BLUE = "var(--ba-sequential-400)";
const STATUS = {
  good: "var(--ba-status-good)",
  warning: "var(--ba-status-warning)",
  critical: "var(--ba-status-critical)",
};
const SERIES = [
  "var(--ba-series-1-blue)",
  "var(--ba-series-2-green)",
  "var(--ba-series-3-magenta)",
  "var(--ba-series-4-yellow)",
  "var(--ba-series-5-aqua)",
  "var(--ba-series-6-orange)",
  "var(--ba-series-7-violet)",
  "var(--ba-series-8-red)",
];
const BLUE_RAMP = ["#cde2fb", "#8fbef2", "#3987e5", "#0d366b"];

export function BusinessAnalyticsDashboard() {
  const [preset, setPreset] = useState<Preset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [region, setRegion] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [status, setStatus] = useState<"" | "approved" | "pending" | "rejected">("");

  const filters: AnalyticsFilters = useMemo(() => {
    const { from, to } = computeRange(preset, customFrom, customTo);
    return {
      from,
      to,
      region: region || null,
      categoria: categoria || null,
      status: status || null,
    };
  }, [preset, customFrom, customTo, region, categoria, status]);

  const analyticsFn = useServerFn(getBusinessRegistrationAnalytics);
  const exportFn = useServerFn(exportBusinessRegistrationsRows);

  const q = useQuery({
    queryKey: ["admin", "emprendedores", "analytics", filters],
    queryFn: () => analyticsFn({ data: filters }),
  });

  const onExport = async () => {
    const rows = await exportFn({ data: filters });
    const flat = rows.map((r) => ({
      id: r.id,
      nombre_negocio: r.nombre_negocio,
      status: r.status,
      categoria_producto: r.categoria_producto,
      categoria_otro: r.categoria_otro ?? "",
      artesano_certificado: r.artesano_certificado ?? "",
      region: r.region ?? "",
      municipio: r.municipio ?? "",
      email: r.email ?? "",
      telefono: r.telefono ?? "",
      instagram: r.instagram ?? "",
      persona_contacto: r.persona_contacto ?? "",
      descripcion: r.descripcion,
      mercados_interes: (r.mercados_interes ?? []).join(" | "),
      tiempo_operando: r.tiempo_operando ?? "",
      registro_comerciante: r.registro_comerciante ?? "",
      fuente_ingreso: r.fuente_ingreso ?? "",
      canales_venta: (r.canales_venta ?? []).join(" | "),
      tamano_equipo: r.tamano_equipo ?? "",
      logo_url: r.logo_url ?? "",
      created_at: r.created_at,
    }));
    downloadCSV(`negocios-${new Date().toISOString().slice(0, 10)}.csv`, flat);
  };

  return (
    <div className="business-analytics-dashboard space-y-6">
      {/* Filtros */}
      <div className="sticky top-0 z-10 flex flex-wrap items-end gap-3 rounded-xl border bg-[var(--ba-surface-1)] p-4">
        <div className="min-w-[180px]">
          <label className="text-xs text-[var(--ba-text-secondary)]">Rango</label>
          <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="mtd">Mes a la fecha</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {preset === "custom" ? (
          <>
            <div>
              <label className="text-xs text-[var(--ba-text-secondary)]">Desde</label>
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-[var(--ba-text-secondary)]">Hasta</label>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="mt-1" />
            </div>
          </>
        ) : null}
        <div className="min-w-[160px]">
          <label className="text-xs text-[var(--ba-text-secondary)]">Región</label>
          <Select value={region || "__all"} onValueChange={(v) => setRegion(v === "__all" ? "" : v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              {MARKET_REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs text-[var(--ba-text-secondary)]">Categoría</label>
          <Select value={categoria || "__all"} onValueChange={(v) => setCategoria(v === "__all" ? "" : v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              {EMPRENDEDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <label className="text-xs text-[var(--ba-text-secondary)]">Estado</label>
          <Select value={status || "__all"} onValueChange={(v) => setStatus(v === "__all" ? "" : (v as typeof status))}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button onClick={onExport} className="bg-[#18253f] text-white hover:bg-[#18253f]/90">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {q.isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--ba-text-secondary)]">Cargando analítica...</div>
      ) : q.error ? (
        <div className="py-12 text-center text-sm text-[var(--ba-status-critical)]">
          Error: {(q.error as Error).message}
        </div>
      ) : q.data ? (
        <DashboardBody data={q.data} />
      ) : null}
    </div>
  );
}

function DashboardBody({ data }: { data: BusinessAnalytics }) {
  const { kpis, funnel, trendMonthly } = data;
  const total = kpis.total || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const funnelTotal = funnel.approved + funnel.pending + funnel.rejected || 1;
  const delta = kpis.newThisMonth - kpis.newPrevMonth;

  return (
    <>
      {/* 1. KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total registrados" value={kpis.total} />
        <Kpi
          label="Aprobados"
          value={kpis.approved}
          sub={`${pct(kpis.approved)}% del total`}
          accent={STATUS.good}
        />
        <Kpi
          label="Pendientes"
          value={kpis.pending}
          sub={`${pct(kpis.pending)}% del total`}
          accent={STATUS.warning}
        />
        <Kpi
          label="Rechazados"
          value={kpis.rejected}
          sub={`${pct(kpis.rejected)}% del total`}
          accent={STATUS.critical}
        />
        <Kpi
          label="Nuevos este mes"
          value={kpis.newThisMonth}
          sub={
            delta === 0
              ? "Igual que el mes anterior"
              : `${delta > 0 ? "↑" : "↓"} ${Math.abs(delta)} vs mes anterior`
          }
        />
      </div>

      {/* 2. Tendencia */}
      <Card title="Tendencia de registros (últimos 12 meses)">
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={trendMonthly} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ba-gridline)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ba-text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ba-text-secondary)" }} allowDecimals={false} />
              <Tooltip cursor={{ stroke: "var(--ba-gridline)" }} />
              <Line type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Embudo */}
      <Card title="Embudo de aprobación">
        <StackedBar
          segments={[
            { label: "Aprobado", value: funnel.approved, color: STATUS.good },
            { label: "Pendiente", value: funnel.pending, color: STATUS.warning },
            { label: "Rechazado", value: funnel.rejected, color: STATUS.critical },
          ]}
          total={funnelTotal}
        />
      </Card>

      {/* 4. Distribuciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Categoría de producto">
          <HorizontalBars data={data.byCategoria} />
        </Card>
        <Card title="Región">
          <HorizontalBars data={data.byRegion} />
        </Card>
        <Card
          title="Canales de venta"
          note="Un negocio puede seleccionar más de un canal, por lo que el total puede superar el 100%."
        >
          <HorizontalBars data={data.byCanalVenta} />
        </Card>
      </div>

      {/* 5. Perfil del sector */}
      <Card title="Perfil del sector">
        <div className="space-y-5">
          <LabeledStack
            label="Formalidad del negocio (Registro de Comerciante)"
            segments={REGISTRO_COMERCIANTE_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byFormalidad.find((x) => x.label === o)?.count ?? 0,
              color: SERIES[i],
            }))}
          />
          <LabeledStack
            label="Dependencia económica de los mercados"
            segments={FUENTE_INGRESO_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byDependencia.find((x) => x.label === o)?.count ?? 0,
              color: SERIES[i],
            }))}
          />
          <LabeledStack
            label="Tiempo operando el negocio"
            segments={TIEMPO_OPERANDO_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byTiempoOperando.find((x) => x.label === o)?.count ?? 0,
              color: BLUE_RAMP[i],
            }))}
          />
        </div>
      </Card>

      {/* 6. Empleos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Distribución por tamaño del equipo">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data.byTamanoEquipo} margin={{ top: 8, right: 16, bottom: 8, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ba-gridline)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ba-text-secondary)" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11, fill: "var(--ba-text-primary)" }} />
                  <Tooltip cursor={{ fill: "var(--ba-gridline)", opacity: 0.3 }} />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {data.byTamanoEquipo.map((_, i) => (
                      <Cell key={i} fill={BLUE_RAMP[i] ?? BLUE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Empleos estimados">
          <div className="flex flex-col justify-center py-4">
            <div className="text-5xl font-semibold text-[var(--ba-text-primary)]">
              {data.empleosEstimados}
            </div>
            <div className="mt-2 text-sm text-[var(--ba-text-secondary)]">
              Empleos generados por el sector
            </div>
            <p className="mt-4 text-xs text-[var(--ba-muted)]">
              Estimado basado en los rangos declarados por cada negocio (1 · Solo yo, 4 · 2-5, 6 · 6+). No es un conteo exacto.
            </p>
          </div>
        </Card>
      </div>

      {/* 7. Top mercados */}
      <Card title="Top 10 mercados mencionados">
        {data.topMercados.length === 0 ? (
          <p className="text-sm text-[var(--ba-text-secondary)]">Sin menciones aún.</p>
        ) : (
          <ol className="divide-y">
            {data.topMercados.map((m, i) => (
              <li key={m.label} className="flex items-baseline gap-3 py-2 text-sm">
                <span className="w-6 text-[var(--ba-muted)]">{i + 1}.</span>
                <span className="flex-1 text-[var(--ba-text-primary)]">{m.label}</span>
                <span className="font-medium text-[var(--ba-text-primary)]">{m.count}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border bg-[var(--ba-surface-1)] p-5">
      <div className="flex items-center gap-2">
        {accent ? <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} /> : null}
        <div className="text-xs uppercase tracking-wide text-[var(--ba-text-secondary)]">{label}</div>
      </div>
      <div className="mt-2 text-3xl font-semibold text-[var(--ba-text-primary)]">{value}</div>
      {sub ? <div className="mt-1 text-xs text-[var(--ba-muted)]">{sub}</div> : null}
    </div>
  );
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-[var(--ba-surface-1)] p-5">
      <h3 className="mb-4 text-sm font-semibold text-[var(--ba-text-primary)]">{title}</h3>
      {children}
      {note ? <p className="mt-3 text-xs text-[var(--ba-muted)]">{note}</p> : null}
    </div>
  );
}

function StackedBar({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div>
      <div className="flex h-8 w-full gap-[2px] overflow-hidden rounded-md">
        {segments.map((s) => {
          const pct = (s.value / total) * 100;
          if (s.value === 0) return null;
          return (
            <div
              key={s.label}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: s.color, width: `${pct}%` }}
              title={`${s.label}: ${s.value} (${Math.round(pct)}%)`}
            >
              {pct >= 8 ? `${Math.round(pct)}%` : ""}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-[var(--ba-text-primary)]">{s.label}</span>
            <span className="text-[var(--ba-muted)]">({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabeledStack({ label, segments }: { label: string; segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="mb-2 text-sm text-[var(--ba-text-primary)]">{label}</div>
      <StackedBar segments={segments} total={total} />
    </div>
  );
}

function HorizontalBars({ data }: { data: { label: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--ba-text-secondary)]">Sin datos.</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <div className="w-44 truncate text-[var(--ba-text-primary)]" title={d.label}>{d.label}</div>
          <div className="relative flex-1 h-6 rounded-md bg-[var(--ba-gridline)]/40">
            <div
              className="absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${(d.count / max) * 100}%`, backgroundColor: BLUE }}
            />
          </div>
          <div className="w-8 text-right font-medium text-[var(--ba-text-primary)]">{d.count}</div>
        </div>
      ))}
    </div>
  );
}
