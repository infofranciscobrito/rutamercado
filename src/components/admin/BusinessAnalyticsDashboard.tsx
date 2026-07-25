import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Moon, Sun, Monitor, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

/* ============================================================== */
/*  Types & constants                                              */
/* ============================================================== */

type Preset = "7" | "30" | "90" | "mtd" | "today" | "custom" | "all";
type ThemeMode = "light" | "dark" | "system";
const THEME_KEY = "rm-admin-theme";

const CAT_COLORS = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
];

const SEQ_RAMP_ORDINAL = [
  "var(--seq-300)",
  "var(--seq-500)",
  "var(--seq-700)",
  "var(--seq-900)",
];

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

const PRESET_LABEL: Record<Preset, string> = {
  all: "Todo el tiempo",
  today: "Hoy",
  "7": "Últimos 7 días",
  "30": "Últimos 30 días",
  "90": "Últimos 90 días",
  mtd: "Mes a la fecha",
  custom: "Rango personalizado",
};

/* ============================================================== */
/*  Theme                                                          */
/* ============================================================== */

function useDashboardTheme(): [ThemeMode, "light" | "dark", (m: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(THEME_KEY)) as ThemeMode | null;
    if (stored === "light" || stored === "dark" || stored === "system") setMode(stored);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      if (mode === "system") setResolved(mql.matches ? "dark" : "light");
      else setResolved(mode);
    };
    resolve();
    mql.addEventListener("change", resolve);
    return () => mql.removeEventListener("change", resolve);
  }, [mode]);

  const setPersist = (m: ThemeMode) => {
    setMode(m);
    try { localStorage.setItem(THEME_KEY, m); } catch { /* noop */ }
  };

  return [mode, resolved, setPersist];
}

function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const items: { m: ThemeMode; icon: typeof Sun; label: string }[] = [
    { m: "light", icon: Sun, label: "Claro" },
    { m: "dark", icon: Moon, label: "Oscuro" },
    { m: "system", icon: Monitor, label: "Sistema" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Tema del panel"
      className="inline-flex items-center rounded-lg border p-0.5"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
    >
      {items.map(({ m, icon: Icon, label }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(m)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{
              background: active ? "var(--brand-primary)" : "transparent",
              color: active ? "#fff" : "var(--text-secondary)",
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================== */
/*  Main                                                           */
/* ============================================================== */

export function BusinessAnalyticsDashboard() {
  const [preset, setPreset] = useState<Preset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [region, setRegion] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [status, setStatus] = useState<"" | "approved" | "pending" | "rejected">("");
  const [themeMode, resolvedTheme, setThemeMode] = useDashboardTheme();

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

  // Total sin filtros para el contador "X de Y"
  const qAll = useQuery({
    queryKey: ["admin", "emprendedores", "analytics", "unfiltered-total"],
    queryFn: () =>
      analyticsFn({ data: { from: null, to: null, region: null, categoria: null, status: null } }),
    staleTime: 60_000,
  });

  const hasFilters =
    preset !== "all" || !!region || !!categoria || !!status || !!customFrom || !!customTo;

  const clearAll = () => {
    setPreset("all");
    setRegion("");
    setCategoria("");
    setStatus("");
    setCustomFrom("");
    setCustomTo("");
  };

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

  const showing = q.data?.kpis.total ?? 0;
  const totalAll = qAll.data?.kpis.total ?? showing;

  return (
    <div
      className="business-analytics-dashboard -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6"
      data-theme={resolvedTheme}
    >
      {/* Barra de filtros */}
      <div
        className="sticky top-0 z-20 -mx-4 border-b px-4 py-4 sm:-mx-6 sm:px-6"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <FilterField label="Rango">
            <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
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
          </FilterField>
          {preset === "custom" ? (
            <>
              <FilterField label="Desde">
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-9" />
              </FilterField>
              <FilterField label="Hasta">
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-9" />
              </FilterField>
            </>
          ) : null}
          <FilterField label="Región">
            <Select value={region || "__all"} onValueChange={(v) => setRegion(v === "__all" ? "" : v)}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Todas</SelectItem>
                {MARKET_REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Categoría">
            <Select value={categoria || "__all"} onValueChange={(v) => setCategoria(v === "__all" ? "" : v)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Todas</SelectItem>
                {EMPRENDEDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Estado">
            <Select value={status || "__all"} onValueChange={(v) => setStatus(v === "__all" ? "" : (v as typeof status))}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Todos</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle mode={themeMode} onChange={setThemeMode} />
            <Button
              onClick={onExport}
              className="h-9"
              style={{ background: "var(--brand-primary)", color: "#fff" }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {hasFilters && (
            <>
              {preset !== "all" && <FilterChip label={PRESET_LABEL[preset]} onRemove={() => setPreset("all")} />}
              {region && <FilterChip label={`Región: ${region}`} onRemove={() => setRegion("")} />}
              {categoria && <FilterChip label={`Categoría: ${categoria}`} onRemove={() => setCategoria("")} />}
              {status && <FilterChip label={`Estado: ${statusLabel(status)}`} onRemove={() => setStatus("")} />}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--brand-accent)" }}
              >
                Limpiar todo
              </button>
              <span className="mx-1 h-3 w-px" style={{ background: "var(--border-strong)" }} />
            </>
          )}
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Mostrando <strong style={{ color: "var(--text-primary)" }}>{showing}</strong> de{" "}
            <strong style={{ color: "var(--text-primary)" }}>{totalAll}</strong> negocios
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="mt-6 space-y-6">
        {q.isLoading ? (
          <SkeletonState />
        ) : q.error ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--status-critical)" }}>
            Error: {(q.error as Error).message}
          </div>
        ) : q.data ? (
          <DashboardBody data={q.data} hasFilters={hasFilters} onClearFilters={clearAll} />
        ) : null}
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  if (s === "approved") return "Aprobado";
  if (s === "pending") return "Pendiente";
  if (s === "rejected") return "Rechazado";
  return s;
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
      style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-black/5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/* ============================================================== */
/*  Body                                                           */
/* ============================================================== */

function DashboardBody({
  data,
  hasFilters,
  onClearFilters,
}: {
  data: BusinessAnalytics;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  const { kpis, funnel, trendMonthly } = data;
  const totalAll = kpis.total || 1;
  const pct = (n: number) => Math.round((n / totalAll) * 100);
  const funnelTotal = funnel.approved + funnel.pending + funnel.rejected;
  const delta = kpis.newThisMonth - kpis.newPrevMonth;
  const emptyOverall = kpis.total === 0;

  return (
    <>
      {/* 1. KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiTile label="Total registrados" value={kpis.total} />
        <KpiTile
          label="Aprobados"
          value={kpis.approved}
          chip={{ text: `${pct(kpis.approved)}% del total`, tone: "good" }}
        />
        <KpiTile
          label="Pendientes"
          value={kpis.pending}
          chip={{ text: `${pct(kpis.pending)}% del total`, tone: "warning" }}
        />
        <KpiTile
          label="Rechazados"
          value={kpis.rejected}
          chip={{ text: `${pct(kpis.rejected)}% del total`, tone: "critical" }}
        />
        <KpiTile
          label="Nuevos este mes"
          value={kpis.newThisMonth}
          chip={
            delta === 0
              ? { text: "= vs. mes anterior", tone: "neutral" }
              : { text: `${delta > 0 ? "↑" : "↓"} ${Math.abs(delta)} vs. mes anterior`, tone: delta > 0 ? "good" : "critical" }
          }
        />
      </div>

      {/* 2. Tendencia */}
      <Card
        title="Tendencia de registros"
        subtitle="Nuevos negocios registrados por mes (últimos 12 meses)"
        n={trendMonthly.reduce((s, x) => s + x.count, 0)}
      >
        {emptyOverall ? (
          <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trendMonthly} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<BaTooltip suffix=" registros" />} cursor={{ stroke: "var(--gridline)" }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--seq-700)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--seq-700)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--seq-700)", stroke: "var(--bg-surface)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* 3. Embudo + Empleos (misma fila) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Embudo de aprobación"
          subtitle="Estado de revisión de cada negocio registrado"
          n={funnelTotal}
        >
          <ApprovalFunnel approved={funnel.approved} pending={funnel.pending} rejected={funnel.rejected} />
        </Card>
        <Card
          title="Empleos estimados"
          subtitle="Suma de los rangos declarados por cada negocio"
          n={kpis.total}
          note="Estimado basado en los rangos declarados (1 · Solo yo, 4 · 2-5, 6 · 6+). No es un conteo exacto."
        >
          <div className="flex h-full flex-col justify-center py-2">
            <div className="text-[32px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>
              {data.empleosEstimados}
            </div>
            <div className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Empleos generados por el sector
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Distribuciones (una serie) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Categoría de producto"
          subtitle="Negocios registrados según su categoría principal"
          n={data.byCategoria.reduce((s, x) => s + x.count, 0)}
        >
          <HBarList data={data.byCategoria} sort="desc" hasFilters={hasFilters} onClearFilters={onClearFilters} />
        </Card>
        <Card
          title="Región"
          subtitle="Distribución geográfica de los negocios registrados"
          n={data.byRegion.reduce((s, x) => s + x.count, 0)}
        >
          <HBarList data={data.byRegion} sort="desc" hasFilters={hasFilters} onClearFilters={onClearFilters} />
        </Card>
        <Card
          title="Canales de venta"
          subtitle="Dónde vende cada negocio además de los mercados"
          n={data.byCanalVenta.reduce((s, x) => s + x.count, 0)}
          note="Un negocio puede seleccionar más de un canal, por lo que el total puede superar el 100%."
        >
          <HBarList data={data.byCanalVenta} sort="desc" hasFilters={hasFilters} onClearFilters={onClearFilters} />
        </Card>
        <Card
          title="Tamaño del equipo"
          subtitle="Cantidad de personas trabajando en el negocio"
          n={data.byTamanoEquipo.reduce((s, x) => s + x.count, 0)}
        >
          <HBarList data={data.byTamanoEquipo} sort="preserve" ramp="ordinal" hasFilters={hasFilters} onClearFilters={onClearFilters} />
        </Card>
      </div>

      {/* 5. Perfil del sector */}
      <Card
        title="Perfil del sector"
        subtitle="Cómo se compone el conjunto de negocios registrados"
        n={kpis.total}
      >
        <div className="space-y-6">
          <StackedBar100
            label="Formalidad del negocio (Registro de Comerciante)"
            segments={REGISTRO_COMERCIANTE_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byFormalidad.find((x) => x.label === o)?.count ?? 0,
              color: CAT_COLORS[i % CAT_COLORS.length],
            }))}
          />
          <StackedBar100
            label="Dependencia económica de los mercados"
            subLabel="Qué tan importante son los mercados en el ingreso del negocio"
            segments={FUENTE_INGRESO_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byDependencia.find((x) => x.label === o)?.count ?? 0,
              color: SEQ_RAMP_ORDINAL[Math.min(i, SEQ_RAMP_ORDINAL.length - 1)],
            }))}
          />
          <StackedBar100
            label="Tiempo operando el negocio"
            subLabel="Ordinal: de más nuevo (izquierda) a más establecido (derecha)"
            segments={TIEMPO_OPERANDO_OPTIONS.map((o, i) => ({
              label: o,
              value: data.byTiempoOperando.find((x) => x.label === o)?.count ?? 0,
              color: SEQ_RAMP_ORDINAL[Math.min(i, SEQ_RAMP_ORDINAL.length - 1)],
            }))}
          />
        </div>
      </Card>

      {/* 6. Top mercados */}
      <Card
        title="Top 10 mercados mencionados"
        subtitle="Mercados donde los negocios registrados quieren vender"
        n={data.topMercados.reduce((s, x) => s + x.count, 0)}
      >
        {data.topMercados.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
        ) : (
          <ol className="space-y-1">
            {data.topMercados.map((m, i) => (
              <li
                key={m.label}
                className="grid items-baseline gap-3 py-1.5 text-[13px]"
                style={{
                  gridTemplateColumns: "24px 1fr auto",
                  borderTop: i === 0 ? "none" : "1px solid var(--border-default)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{i + 1}.</span>
                <span style={{ color: "var(--text-primary)" }}>{m.label}</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{m.count}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}

/* ============================================================== */
/*  Reusable pieces                                                */
/* ============================================================== */

function Card({
  title,
  subtitle,
  n,
  note,
  children,
}: {
  title: string;
  subtitle?: string;
  n?: number;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-5"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
    >
      <header className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          {typeof n === "number" && (
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              n = {n}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
        <div className="mt-3 h-px" style={{ background: "var(--border-default)" }} />
      </header>
      {children}
      {note && (
        <p className="mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
          {note}
        </p>
      )}
    </section>
  );
}

type ChipTone = "good" | "warning" | "critical" | "neutral";

function KpiTile({
  label,
  value,
  chip,
}: {
  label: string;
  value: number | string;
  chip?: { text: string; tone: ChipTone };
}) {
  const tone = chip
    ? {
        good: { bg: "var(--status-good-bg)", fg: "var(--status-good)" },
        warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning)" },
        critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical)" },
        neutral: { bg: "var(--bg-surface-subtle)", fg: "var(--text-secondary)" },
      }[chip.tone]
    : null;
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
    >
      <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-2 text-[32px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {chip && tone && (
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {chip.text}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Horizontal Bars ---------------------------- */

function HBarList({
  data,
  sort,
  ramp = "sequential",
  hasFilters,
  onClearFilters,
}: {
  data: { label: string; count: number }[];
  sort: "desc" | "preserve";
  ramp?: "sequential" | "ordinal";
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  const rows = sort === "desc" ? [...data].sort((a, b) => b.count - a.count) : data;
  const total = rows.reduce((s, x) => s + x.count, 0);
  const max = Math.max(...rows.map((r) => r.count), 1);

  if (rows.length === 0 || total === 0) {
    return <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />;
  }

  const barColor = (index: number) => {
    if (ramp === "ordinal") {
      return SEQ_RAMP_ORDINAL[Math.min(index, SEQ_RAMP_ORDINAL.length - 1)];
    }
    // sequential descendente: la de mayor magnitud usa --seq-700, luego --seq-500, mínimo --seq-300
    if (sort === "desc") {
      // index 0 = mayor magnitud (por sort)
      if (index === 0) return "var(--seq-700)";
      if (index <= 2) return "var(--seq-500)";
      return "var(--seq-300)";
    }
    return "var(--seq-500)";
  };

  return (
    <div className="ba-bar-group space-y-2">
      {rows.map((r, i) => {
        const widthPct = (r.count / max) * 100;
        const sharePct = total > 0 ? Math.round((r.count / total) * 100) : 0;
        const isZero = r.count === 0;
        return (
          <div
            key={r.label}
            className="ba-bar-row grid items-center gap-3 text-[13px]"
            style={{ gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr) 88px" }}
          >
            <div
              className="truncate font-medium"
              style={{ color: "var(--text-secondary)" }}
              title={r.label}
            >
              {r.label}
            </div>
            <div className="relative h-2 max-w-[480px] rounded-full" style={{ background: "var(--gridline)" }}>
              {!isZero && (
                <div
                  className="ba-bar-fill absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${widthPct}%`, background: barColor(i) }}
                  title={`${r.label}: ${r.count} (${sharePct}%)`}
                />
              )}
            </div>
            <div className="text-right">
              <span className="font-bold" style={{ color: isZero ? "var(--text-muted)" : "var(--text-primary)" }}>
                {r.count}
              </span>{" "}
              <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                {sharePct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------- Stacked 100% ---------------------------- */

function StackedBar100({
  label,
  subLabel,
  segments,
}: {
  label: string;
  subLabel?: string;
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const withPct = segments.map((s) => ({
    ...s,
    pct: total > 0 ? (s.value / total) * 100 : 0,
  }));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </div>
          {subLabel && (
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{subLabel}</div>
          )}
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>n = {total}</div>
      </div>

      {total === 0 ? (
        <div
          className="rounded-md py-3 text-center text-[12px]"
          style={{ background: "var(--bg-surface-subtle)", color: "var(--text-muted)" }}
        >
          Sin datos para este segmento
        </div>
      ) : (
        <div
          className="flex h-[14px] w-full overflow-hidden rounded-md"
          style={{ background: "var(--gridline)", gap: "2px" }}
          role="img"
          aria-label={label}
        >
          {withPct.map((s) => {
            if (s.value === 0) return null;
            const showInline = s.pct >= 12; // ~48px sobre carriles típicos
            const useLightText = isDarkEnough(s.color);
            return (
              <div
                key={s.label}
                className="flex items-center justify-center text-[10px] font-semibold"
                style={{
                  width: `${s.pct}%`,
                  background: s.color,
                  color: useLightText ? "#fff" : "var(--text-primary)",
                }}
                title={`${s.label}: ${s.value} (${Math.round(s.pct)}%)`}
              >
                {showInline ? `${Math.round(s.pct)}%` : ""}
              </div>
            );
          })}
        </div>
      )}

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {withPct.map((s) => (
          <li key={s.label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            <span style={{ color: "var(--text-muted)" }}>
              — <span className="font-semibold" style={{ color: s.value === 0 ? "var(--text-muted)" : "var(--text-primary)" }}>{s.value}</span> · {Math.round(s.pct)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Heurística simple para decidir texto blanco sobre segmento
function isDarkEnough(cssColor: string): boolean {
  // Los tokens que sabemos claros:
  const light = ["var(--seq-100)", "var(--seq-300)", "var(--cat-4)"];
  if (light.includes(cssColor)) return false;
  return true;
}

/* ---------------------------- Approval Funnel ---------------------------- */

function ApprovalFunnel({ approved, pending, rejected }: { approved: number; pending: number; rejected: number }) {
  const total = approved + pending + rejected;
  const segs = [
    { key: "approved", label: "Aprobado", value: approved, color: "var(--status-good)" },
    { key: "pending", label: "Pendiente", value: pending, color: "var(--status-warning)" },
    { key: "rejected", label: "Rechazado", value: rejected, color: "var(--status-critical)" },
  ];

  if (total === 0) {
    return (
      <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
        No hay registros que evaluar.
      </div>
    );
  }

  const dominant = segs.find((s) => s.value === total);

  return (
    <div>
      {dominant && (
        <p className="mb-3 text-[13px]" style={{ color: "var(--text-primary)" }}>
          Los <strong>{total}</strong> negocios registrados están{" "}
          <strong style={{ color: dominant.color }}>{dominant.label.toLowerCase()}s</strong>.{" "}
          {dominant.key === "approved" && "No hay registros pendientes de revisión."}
        </p>
      )}
      <div
        className="flex h-[12px] w-full overflow-hidden rounded-full"
        style={{ background: "var(--gridline)", gap: "2px" }}
        role="img"
        aria-label="Distribución por estado de aprobación"
      >
        {segs.map((s) => {
          if (s.value === 0) return null;
          const w = (s.value / total) * 100;
          return (
            <div key={s.key} style={{ width: `${w}%`, background: s.color }} title={`${s.label}: ${s.value}`} />
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {segs.map((s) => {
          const p = Math.round((s.value / total) * 100);
          return (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
              <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ color: "var(--text-muted)" }}>
                <span className="font-semibold" style={{ color: s.value === 0 ? "var(--text-muted)" : "var(--text-primary)" }}>{s.value}</span> · {p}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------------- Tooltip / states ---------------------------- */

function BaTooltip({ active, payload, label, suffix = "" }: any) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  return (
    <div
      className="rounded-md px-3 py-2 text-[12px] shadow-md"
      style={{ background: "var(--brand-primary)", color: "#fff" }}
    >
      <div className="font-medium">{label}</div>
      <div>{value}{suffix}</div>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
        {hasFilters ? "No hay negocios que cumplan estos filtros." : "Aún no hay datos disponibles."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-[12px] font-medium underline-offset-2 hover:underline"
          style={{ color: "var(--brand-accent)" }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[104px] rounded-lg border animate-pulse"
            style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }}
          />
        ))}
      </div>
      <div
        className="h-72 rounded-lg border animate-pulse"
        style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-lg border animate-pulse"
            style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }}
          />
        ))}
      </div>
    </div>
  );
}
