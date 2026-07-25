import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Moon, Sun, Monitor, X, AlertTriangle, MapPin, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
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
  TAMANO_EQUIPO_OPTIONS,
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

const SEQ = ["var(--seq-100)", "var(--seq-300)", "var(--seq-500)", "var(--seq-700)", "var(--seq-900)"];
const CAT = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)", "var(--cat-5)", "var(--cat-6)"];

const REGION_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  Oeste: { x: 0, y: 0, w: 34, h: 62 },
  Norte: { x: 36, y: 0, w: 76, h: 19 },
  Metro: { x: 114, y: 0, w: 56, h: 19 },
  Centro: { x: 36, y: 21, w: 76, h: 19 },
  Este: { x: 114, y: 21, w: 56, h: 41 },
  Sur: { x: 36, y: 42, w: 76, h: 20 },
};

const PRESET_LABEL: Record<Preset, string> = {
  all: "Todo el tiempo",
  today: "Hoy",
  "7": "Últimos 7 días",
  "30": "Últimos 30 días",
  "90": "Últimos 90 días",
  mtd: "Mes a la fecha",
  custom: "Rango personalizado",
};

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

/* ============================================================== */
/*  Theme                                                          */
/* ============================================================== */

function useDashboardTheme(): [ThemeMode, "light" | "dark", (m: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

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
/*  Animated counter                                               */
/* ============================================================== */

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) { setN(target); return; }
    const start = performance.now();
    const from = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return n;
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
    return { from, to, region: region || null, categoria: categoria || null, status: status || null };
  }, [preset, customFrom, customTo, region, categoria, status]);

  const analyticsFn = useServerFn(getBusinessRegistrationAnalytics);
  const exportFn = useServerFn(exportBusinessRegistrationsRows);

  const q = useQuery({
    queryKey: ["admin", "emprendedores", "analytics", filters],
    queryFn: () => analyticsFn({ data: filters }),
  });

  const qAll = useQuery({
    queryKey: ["admin", "emprendedores", "analytics", "unfiltered-total"],
    queryFn: () => analyticsFn({ data: { from: null, to: null, region: null, categoria: null, status: null } }),
    staleTime: 60_000,
  });

  const hasFilters = preset !== "all" || !!region || !!categoria || !!status || !!customFrom || !!customTo;

  const clearAll = () => {
    setPreset("all"); setRegion(""); setCategoria(""); setStatus(""); setCustomFrom(""); setCustomTo("");
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
      {/* Sticky bar */}
      <div
        className="sticky top-0 z-20 -mx-4 border-b px-4 py-3 sm:-mx-6 sm:px-6"
        style={{
          background: "color-mix(in oklab, var(--bg-canvas) 82%, transparent)",
          borderColor: "var(--border-default)",
          backdropFilter: "blur(16px)",
        }}
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
          {preset === "custom" && (
            <>
              <FilterField label="Desde">
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-9" />
              </FilterField>
              <FilterField label="Hasta">
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-9" />
              </FilterField>
            </>
          )}
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
              style={{ background: "var(--accent)", color: "#062a15" }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
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
                style={{ color: "var(--accent)" }}
              >
                Limpiar todo
              </button>
            </>
          )}
          <span className="ml-auto text-[11.5px]" style={{ color: "var(--text-muted)" }}>
            Mostrando <strong style={{ color: "var(--text-primary)" }}>{showing}</strong> de{" "}
            <strong style={{ color: "var(--text-primary)" }}>{totalAll}</strong> negocios registrados
          </span>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1440px]">
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
      <label className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
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
        className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-black/10"
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
  const { kpis, funnel, trendMonthly, byRegion, byCategoria, byCanalVenta, byFormalidad, byDependencia, byTiempoOperando, byTamanoEquipo } = data;
  const total = kpis.total;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const regionsCovered = byRegion.filter((r) => r.count > 0).length;
  const formalizados = byFormalidad.find((f) => f.label === "Sí")?.count ?? 0;
  const principales = byDependencia.find((f) => f.label === "Principal")?.count ?? 0;

  const findings = computeFindings(data);

  if (total === 0) {
    return (
      <div className="ba-card">
        <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Narrative header */}
      <NarrativeHeader
        total={total}
        regionsCovered={regionsCovered}
        totalRegions={MARKET_REGIONS.length}
        formalizados={formalizados}
        formalizadosPct={pct(formalizados)}
        principales={principales}
      />

      {/* KPIs row — 4 tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Total registrados"
          value={total}
          delay={0}
          sparkline={trendMonthly}
          chip={
            kpis.newThisMonth - kpis.newPrevMonth === 0
              ? { text: "sin cambio vs. mes anterior", tone: "neutral" }
              : kpis.newThisMonth > kpis.newPrevMonth
                ? { text: `↑ ${kpis.newThisMonth - kpis.newPrevMonth} vs. mes anterior`, tone: "good" }
                : { text: `↓ ${Math.abs(kpis.newThisMonth - kpis.newPrevMonth)} vs. mes anterior`, tone: "critical" }
          }
        />
        <KpiTile
          label="Aprobados y publicados"
          value={kpis.approved}
          delay={80}
          chip={{ text: `✓ ${pct(kpis.approved)}% del directorio`, tone: "good" }}
        />
        <KpiTile
          label="Empleos estimados del sector"
          value={data.empleosEstimados}
          delay={160}
          chip={{ text: `≈ ${total ? (data.empleosEstimados / total).toFixed(1) : "0"} por negocio`, tone: "neutral" }}
          note="Estimado con el punto medio de cada rango declarado. No es un conteo exacto."
        />
        <KpiTile
          label="Pendientes de revisión"
          value={kpis.pending}
          delay={240}
          chip={
            kpis.pending === 0
              ? { text: "Cola al día", tone: "good" }
              : { text: `${kpis.pending} esperando`, tone: "warning" }
          }
        />
      </div>

      {/* Map + Funnel */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card
            title="Cobertura por región"
            n={byRegion.reduce((s, x) => s + x.count, 0)}
            subtitle="Dónde operan los negocios registrados en Puerto Rico"
            note="Mapa esquemático, no a escala geográfica."
            delay={0}
          >
            <CoverageMap byRegion={byRegion} total={total} />
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card
            title="Embudo de aprobación"
            n={funnel.approved + funnel.pending + funnel.rejected}
            subtitle="Estado de revisión de cada negocio registrado"
            delay={60}
          >
            <ApprovalFunnel approved={funnel.approved} pending={funnel.pending} rejected={funnel.rejected} />
          </Card>
        </div>
      </div>

      {/* Section divider */}
      <SectionDivider label="Qué venden y dónde venden" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Categoría de producto"
          n={byCategoria.reduce((s, x) => s + x.count, 0)}
          subtitle="Distribución de los negocios por categoría principal"
          delay={0}
        >
          <LollipopList data={byCategoria} total={total} />
        </Card>
        <Card
          title="Canales de venta"
          n={total}
          subtitle="Dónde vende cada negocio además de los mercados"
          note="Cada barra es el % de los negocios que usa ese canal, no una repartición del total — un negocio puede marcar varios."
          delay={60}
        >
          <MultiChannelList data={byCanalVenta} total={total} />
        </Card>
      </div>

      {/* Finding bands */}
      {findings.map((f, i) => (
        <FindingBand key={i} tone={f.tone} icon={f.icon} title={f.title} body={f.body} />
      ))}

      {/* Section divider */}
      <SectionDivider label="Perfil del sector" />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card
            title="Formalidad del negocio"
            n={byFormalidad.reduce((s, x) => s + x.count, 0)}
            subtitle="Registro de Comerciante ante Hacienda"
            delay={0}
          >
            <WaffleChart segments={REGISTRO_COMERCIANTE_OPTIONS.map((o, i) => ({
              label: o,
              value: byFormalidad.find((x) => x.label === o)?.count ?? 0,
              color: CAT[i % CAT.length],
            }))} total={total} />
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card
            title="Dependencia económica"
            n={byDependencia.reduce((s, x) => s + x.count, 0)}
            subtitle="Qué tan importante son los mercados como fuente de ingreso"
            delay={60}
          >
            <WaffleChart segments={FUENTE_INGRESO_OPTIONS.map((o, i) => ({
              label: o,
              value: byDependencia.find((x) => x.label === o)?.count ?? 0,
              color: CAT[i % CAT.length],
            }))} total={total} />
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card
            title="Tiempo operando"
            n={byTiempoOperando.reduce((s, x) => s + x.count, 0)}
            subtitle="Antigüedad declarada del negocio"
            delay={120}
          >
            <OrdinalBars
              options={TIEMPO_OPERANDO_OPTIONS as readonly string[]}
              data={byTiempoOperando}
              axisLeft="más nuevo"
              axisRight="más establecido"
            />
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Card
            title="Tamaño del equipo"
            n={byTamanoEquipo.reduce((s, x) => s + x.count, 0)}
            subtitle="Rango de personas trabajando en el negocio"
            delay={0}
          >
            <OrdinalBars
              options={TAMANO_EQUIPO_OPTIONS as readonly string[]}
              data={byTamanoEquipo}
              axisLeft="más pequeño"
              axisRight="más grande"
            />
          </Card>
        </div>
        <div className="lg:col-span-6">
          <Card
            title="Top 10 mercados mencionados"
            n={data.topMercados.reduce((s, x) => s + x.count, 0)}
            subtitle="Mercados donde los negocios quieren vender"
            delay={60}
          >
            {data.topMercados.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
            ) : (
              <ol className="space-y-1">
                {data.topMercados.map((m, i) => (
                  <li key={m.label} className="grid items-baseline gap-3 py-1.5 text-[13px]"
                    style={{
                      gridTemplateColumns: "24px 1fr auto",
                      borderTop: i === 0 ? "none" : "1px solid var(--border-default)",
                    }}>
                    <span style={{ color: "var(--text-muted)" }}>{i + 1}.</span>
                    <span style={{ color: "var(--text-primary)" }}>{m.label}</span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{m.count}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="Tendencia de registros"
        n={trendMonthly.reduce((s, x) => s + x.count, 0)}
        subtitle="Nuevos negocios por mes (últimos 12 meses)"
        delay={0}
      >
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={trendMonthly} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<BaTooltip suffix=" registros" />} cursor={{ stroke: "var(--gridline)" }} />
              <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2}
                dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--bg-surface)", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================== */
/*  Narrative header                                               */
/* ============================================================== */

function NarrativeHeader({
  total, regionsCovered, totalRegions, formalizados, formalizadosPct, principales,
}: {
  total: number; regionsCovered: number; totalRegions: number;
  formalizados: number; formalizadosPct: number; principales: number;
}) {
  const A = (v: React.ReactNode) => (
    <span style={{ color: "var(--accent)", fontWeight: 700 }}>{v}</span>
  );
  return (
    <div className="ba-enter">
      <h2
        className="font-bold tracking-tight"
        style={{
          fontSize: "clamp(22px, 3vw, 34px)",
          lineHeight: 1.15,
          letterSpacing: "-0.028em",
          color: "var(--text-primary)",
        }}
      >
        {A(`${total} negocios`)} registrados en {A(`${regionsCovered} de ${totalRegions} regiones`)} de Puerto Rico,
        con {A(`${formalizadosPct}%`)} ya formalizados ante Hacienda.{" "}
        {principales > 0 && (
          <>Para {A(`${principales} de ellos`)}, los mercados son la fuente principal de ingreso.</>
        )}
      </h2>
      <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
        Estado del directorio con los filtros aplicados. Todo lo que sigue se actualiza en tiempo real.
      </p>
    </div>
  );
}

/* ============================================================== */
/*  KPI tile with counter + sparkline                              */
/* ============================================================== */

type ChipTone = "good" | "warning" | "critical" | "neutral";

function KpiTile({
  label, value, chip, note, sparkline, delay = 0,
}: {
  label: string;
  value: number;
  chip?: { text: string; tone: ChipTone };
  note?: string;
  sparkline?: { month: string; count: number }[];
  delay?: number;
}) {
  const n = useCountUp(value);
  const tone = chip ? {
    good: { bg: "var(--status-good-bg)", fg: "var(--status-good)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning)" },
    critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical)" },
    neutral: { bg: "var(--bg-surface-subtle)", fg: "var(--text-secondary)" },
  }[chip.tone] : null;
  return (
    <div className="ba-card ba-enter" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-2 text-[38px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>
        {n}
      </div>
      {chip && tone && (
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {chip.text}
          </span>
        </div>
      )}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 h-[30px]">
          <ResponsiveContainer>
            <AreaChart data={sparkline} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="ba-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#ba-spark)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {note && (
        <p className="mt-3 border-t pt-2 text-[10.5px]"
          style={{ color: "var(--text-muted)", borderColor: "var(--border-default)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

/* ============================================================== */
/*  Coverage map                                                   */
/* ============================================================== */

function CoverageMap({ byRegion, total }: { byRegion: { label: string; count: number }[]; total: number }) {
  const counts = new Map(byRegion.map((r) => [r.label, r.count]));
  const max = Math.max(...byRegion.map((r) => r.count), 1);
  const min = Math.min(...byRegion.filter((r) => r.count > 0).map((r) => r.count), 0);

  const fillFor = (count: number) => {
    if (count === 0) return "transparent";
    const ratio = count / max;
    if (ratio > 0.8) return "var(--seq-900)";
    if (ratio > 0.6) return "var(--seq-700)";
    if (ratio > 0.4) return "var(--seq-500)";
    if (ratio > 0.2) return "var(--seq-300)";
    return "var(--seq-100)";
  };

  const textColorFor = (count: number) => {
    if (count === 0) return "var(--text-muted)";
    return count / max > 0.5 ? "#fff" : "var(--text-primary)";
  };

  const ordered = [...byRegion].sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_180px]">
      <svg viewBox="-2 -2 174 66" className="ba-map w-full">
        {MARKET_REGIONS.map((name) => {
          const r = REGION_LAYOUT[name];
          if (!r) return null;
          const count = counts.get(name) ?? 0;
          const isEmpty = count === 0;
          const pctVal = total ? Math.round((count / total) * 100) : 0;
          return (
            <g key={name} className="ba-map-region">
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h} rx={5}
                fill={fillFor(count)}
                stroke={isEmpty ? "var(--border-strong)" : "none"}
                strokeWidth={isEmpty ? 1.2 : 0}
                strokeDasharray={isEmpty ? "2 2" : undefined}
              />
              <text
                x={r.x + r.w / 2} y={r.y + r.h / 2 - 1}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: 13, fontWeight: 700, fill: textColorFor(count) }}
              >{count}</text>
              <text
                x={r.x + r.w / 2} y={r.y + r.h / 2 + 8}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: 5, fontWeight: 650, letterSpacing: 0.4, fill: textColorFor(count), textTransform: "uppercase" }}
              >{name.toUpperCase()}</text>
              <title>{`${name}: ${count} negocios${total ? ` (${pctVal}%)` : ""}`}</title>
            </g>
          );
        })}
      </svg>

      <div>
        <ul className="space-y-1.5 text-[12px]">
          {ordered.map((r) => {
            const p = total ? Math.round((r.count / total) * 100) : 0;
            return (
              <li key={r.label} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[3px]"
                  style={{
                    background: fillFor(r.count),
                    border: r.count === 0 ? "1px dashed var(--border-strong)" : "none",
                  }}
                  aria-hidden
                />
                <span className="flex-1 truncate" style={{ color: r.count === 0 ? "var(--text-muted)" : "var(--text-secondary)" }}>
                  {r.label}
                </span>
                <span className="font-bold tabular-nums" style={{ color: r.count === 0 ? "var(--text-muted)" : "var(--text-primary)" }}>
                  {r.count}
                </span>
                <span className="w-9 text-right text-[11px]" style={{ color: "var(--text-muted)" }}>{p}%</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3">
          <div className="h-1.5 rounded-full" style={{
            background: "linear-gradient(90deg, var(--seq-100), var(--seq-300), var(--seq-500), var(--seq-700), var(--seq-900))",
          }} />
          <div className="mt-1 flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span>{min || 0}</span><span>{max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================== */
/*  Approval funnel                                                */
/* ============================================================== */

function ApprovalFunnel({ approved, pending, rejected }: { approved: number; pending: number; rejected: number }) {
  const total = approved + pending + rejected;
  const segs = [
    { key: "approved", label: "Aprobado", value: approved, color: "var(--status-good)" },
    { key: "pending", label: "Pendiente", value: pending, color: "var(--status-warning)" },
    { key: "rejected", label: "Rechazado", value: rejected, color: "var(--status-critical)" },
  ];

  if (total === 0) {
    return <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>No hay registros que evaluar.</p>;
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[44px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>{approved}</span>
        <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          de {total} registros<br />están aprobados y visibles
        </span>
      </div>
      <div
        className="mt-4 flex h-[14px] w-full overflow-hidden rounded-full"
        style={{ background: "var(--gridline)", gap: "2px" }}
        role="img" aria-label="Distribución por estado de aprobación"
      >
        {segs.map((s, i) => {
          if (s.value === 0) return null;
          const w = (s.value / total) * 100;
          return (
            <div key={s.key}
              className="ba-funnel-fill"
              style={{ width: `${w}%`, background: s.color, animationDelay: `${i * 80}ms` }}
              title={`${s.label}: ${s.value}`} />
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {segs.map((s) => {
          const p = Math.round((s.value / total) * 100);
          const dim = s.value === 0;
          return (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: dim ? "var(--text-muted)" : s.color, opacity: dim ? 0.5 : 1 }} aria-hidden />
              <span style={{ color: dim ? "var(--text-muted)" : "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ color: "var(--text-muted)" }}>
                <span className="font-semibold"
                  style={{ color: dim ? "var(--text-muted)" : "var(--text-primary)" }}>{s.value}</span> · {p}%
              </span>
            </li>
          );
        })}
      </ul>
      {rejected === 0 && total > 0 && (
        <p className="mt-3 border-t pt-3 text-[11.5px]" style={{ color: "var(--text-muted)", borderColor: "var(--border-default)" }}>
          Ningún registro ha sido rechazado. Vale revisar si el criterio es lo bastante estricto o si simplemente no está llegando spam.
        </p>
      )}
    </div>
  );
}

/* ============================================================== */
/*  Lollipop                                                       */
/* ============================================================== */

function LollipopList({ data, total }: { data: { label: string; count: number }[]; total: number }) {
  const rows = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map((r) => r.count), 1);

  const colorFor = (i: number, count: number) => {
    if (count === 0) return "var(--text-muted)";
    if (i === 0) return "var(--seq-900)";
    if (i === 1) return "var(--seq-700)";
    if (i === 2) return "var(--seq-500)";
    if (i === 3) return "var(--seq-300)";
    return "var(--seq-100)";
  };

  return (
    <div>
      {rows.map((r, i) => {
        const w = (r.count / max) * 100;
        const p = total ? Math.round((r.count / total) * 100) : 0;
        const c = colorFor(i, r.count);
        return (
          <div
            key={r.label}
            className="ba-lollipop-row grid items-center gap-3 px-1.5 text-[13px]"
            style={{ gridTemplateColumns: "132px minmax(0,1fr) 62px", height: 32 }}
          >
            <div className="truncate" style={{ color: "var(--text-secondary)" }} title={r.label}>
              {r.label}
            </div>
            <div className="relative h-full">
              <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: "var(--border-default)" }} />
              {r.count > 0 && (
                <>
                  <div
                    className="ba-lollipop-stem absolute top-1/2 -translate-y-1/2 rounded"
                    style={{
                      left: 0, height: 2.5, width: `calc(${w}% - 5px)`, background: c,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                  <div
                    className="ba-lollipop-dot absolute top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `calc(${w}% - 5.5px)`,
                      width: 11, height: 11, background: c,
                      border: "2.5px solid var(--bg-surface)",
                      animationDelay: `${i * 60 + 400}ms`,
                    }}
                  />
                </>
              )}
            </div>
            <div className="text-right">
              <span className="font-bold" style={{ color: r.count === 0 ? "var(--text-muted)" : "var(--text-primary)", fontSize: "13.5px" }}>
                {r.count}
              </span>{" "}
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================== */
/*  Multi-channel (multi-select %)                                 */
/* ============================================================== */

function MultiChannelList({ data, total }: { data: { label: string; count: number }[]; total: number }) {
  const rows = [...data].sort((a, b) => b.count - a.count);
  if (rows.length === 0) {
    return <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Sin canales declarados.</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const p = total ? Math.round((r.count / total) * 100) : 0;
        const color = CAT[i % CAT.length];
        return (
          <div key={r.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
              <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
              <span style={{ color: "var(--text-primary)" }}>
                <span className="font-bold">{r.count}</span>{" "}
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>· {p}% de los negocios</span>
              </span>
            </div>
            <div className="relative h-[7px] rounded-full" style={{ background: "var(--gridline)" }}>
              <div
                className="ba-funnel-fill absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${p}%`, background: color, animationDelay: `${i * 60}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================== */
/*  Waffle                                                         */
/* ============================================================== */

function WaffleChart({
  segments, total,
}: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const drawn = segments.filter((s) => s.value > 0);
  const totalCounted = drawn.reduce((s, x) => s + x.value, 0);

  if (totalCounted === 0) {
    return <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Sin datos.</p>;
  }

  // Expand into individual cells
  const cells: { seg: (typeof segments)[number]; index: number }[] = [];
  drawn.forEach((seg) => {
    for (let i = 0; i < seg.value; i++) cells.push({ seg, index: cells.length });
  });

  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 5 }}>
        {cells.map((c) => (
          <div
            key={c.index}
            className="ba-waffle-cell"
            title={c.seg.label}
            style={{
              width: 15, height: 15, borderRadius: 4,
              background: c.seg.color,
              animationDelay: `${c.index * 14}ms`,
            }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-1 text-[12px]">
        {segments.map((s) => {
          const p = total ? Math.round((s.value / total) * 100) : 0;
          const dim = s.value === 0;
          return (
            <li key={s.label} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]"
                style={{ background: dim ? "var(--text-muted)" : s.color, opacity: dim ? 0.5 : 1 }} aria-hidden />
              <span className="flex-1 truncate" style={{ color: dim ? "var(--text-muted)" : "var(--text-secondary)" }}>{s.label}</span>
              <span className="font-bold" style={{ color: dim ? "var(--text-muted)" : "var(--text-primary)" }}>{s.value}</span>
              <span className="w-9 text-right text-[11px]" style={{ color: "var(--text-muted)" }}>{p}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================== */
/*  Ordinal vertical bars                                          */
/* ============================================================== */

function OrdinalBars({
  options, data, axisLeft, axisRight,
}: {
  options: readonly string[];
  data: { label: string; count: number }[];
  axisLeft: string;
  axisRight: string;
}) {
  const counts = new Map(data.map((d) => [d.label, d.count]));
  const values = options.map((o) => counts.get(o) ?? 0);
  const max = Math.max(...values, 1);

  const colorFor = (i: number, total: number) => {
    // Light → dark along the ordinal axis
    const ramp = ["var(--seq-100)", "var(--seq-300)", "var(--seq-500)", "var(--seq-700)", "var(--seq-900)"];
    const idx = Math.min(ramp.length - 1, Math.round((i / Math.max(1, total - 1)) * (ramp.length - 1)));
    return ramp[idx];
  };

  return (
    <div>
      <div className="grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)`, height: 140 }}>
        {options.map((o, i) => {
          const v = counts.get(o) ?? 0;
          const h = max ? (v / max) * 120 : 0;
          return (
            <div key={o} className="flex flex-col items-center justify-end">
              <span className="mb-1 text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {v}
              </span>
              <div
                className="ba-vbar w-full"
                style={{
                  height: Math.max(h, 2),
                  background: v === 0 ? "var(--gridline)" : colorFor(i, options.length),
                  borderRadius: "6px 6px 3px 3px",
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid gap-2 text-[10px] leading-tight"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)`, color: "var(--text-muted)" }}>
        {options.map((o) => (
          <div key={o} className="text-center">{o}</div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span>{axisLeft}</span>
        <div className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, var(--seq-100), var(--seq-900))" }} />
        <span>{axisRight}</span>
      </div>
    </div>
  );
}

/* ============================================================== */
/*  Finding bands                                                  */
/* ============================================================== */

type Finding = {
  tone: "info" | "warn";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
};

function computeFindings(data: BusinessAnalytics): Finding[] {
  const out: Finding[] = [];
  const total = data.kpis.total;

  // Rule 1: any region with 0
  const emptyRegions = data.byRegion.filter((r) => r.count === 0).map((r) => r.label);
  const nonEmptyRegions = data.byRegion.filter((r) => r.count > 0);
  if (emptyRegions.length > 0 && total > 0) {
    const topTwo = [...nonEmptyRegions].sort((a, b) => b.count - a.count).slice(0, 2);
    const topSum = topTwo.reduce((s, x) => s + x.count, 0);
    const topPct = total ? Math.round((topSum / total) * 100) : 0;
    out.push({
      tone: "info",
      icon: MapPin,
      title: `Cobertura faltante en ${emptyRegions.length > 1 ? "regiones" : "la región"} ${emptyRegions.join(", ")}`,
      body: (
        <>
          Ningún negocio registrado opera en {emptyRegions.join(", ")}, mientras que{" "}
          <strong>{topTwo.map((t) => t.label).join(" y ")}</strong> concentran{" "}
          <strong>{topSum} de {total}</strong> registros ({topPct}%).
        </>
      ),
    });
  }

  // Rule 2: one category > 30%
  if (total > 0) {
    const topCat = [...data.byCategoria].sort((a, b) => b.count - a.count)[0];
    if (topCat && topCat.count / total > 0.3) {
      const p = Math.round((topCat.count / total) * 100);
      out.push({
        tone: "info",
        icon: TrendingUp,
        title: `${topCat.label} domina el directorio`,
        body: (
          <>
            <strong>{topCat.count} de {total}</strong> negocios ({p}%) pertenecen a la categoría{" "}
            <strong>{topCat.label}</strong>. Vale explorar campañas para diversificar el mix.
          </>
        ),
      });
    }
  }

  // Rule 3: pending > 0 → we don't have created_at at aggregate level; only surface if pending > 0
  if (data.kpis.pending > 0) {
    out.push({
      tone: "warn",
      icon: AlertTriangle,
      title: `${data.kpis.pending} registro${data.kpis.pending === 1 ? "" : "s"} pendiente${data.kpis.pending === 1 ? "" : "s"} de revisión`,
      body: <>Hay negocios esperando aprobación. Revisa la cola para no perder momentum en el directorio.</>,
    });
  }

  return out;
}

function FindingBand({ tone, icon: Icon, title, body }: Finding) {
  const isWarn = tone === "warn";
  const accentColor = isWarn ? "var(--status-warning)" : "var(--accent)";
  return (
    <div
      className="ba-enter relative flex items-start gap-3 rounded-xl p-4"
      style={{
        background: `linear-gradient(100deg, color-mix(in oklab, ${accentColor} 12%, transparent) 0%, transparent 80%)`,
        border: `1px solid color-mix(in oklab, ${accentColor} 24%, transparent)`,
      }}
    >
      <div
        className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded"
        style={{ background: accentColor, color: "#062a15" }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</div>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>{body}</p>
      </div>
    </div>
  );
}

/* ============================================================== */
/*  Section divider                                                */
/* ============================================================== */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-muted)", letterSpacing: "0.09em" }}
      >
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
    </div>
  );
}

/* ============================================================== */
/*  Card, tooltip, states                                          */
/* ============================================================== */

function Card({
  title, subtitle, n, note, children, delay = 0,
}: {
  title: string; subtitle?: string; n?: number; note?: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <section className="ba-card ba-enter h-full" style={{ animationDelay: `${delay}ms` }}>
      <header className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {title}
          </h3>
          {typeof n === "number" && (
            <span
              className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums"
              style={{ background: "var(--surface-3)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              n = {n}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        )}
      </header>
      {children}
      {note && (
        <p className="mt-3 border-t pt-3 text-[10.5px]"
          style={{ color: "var(--text-muted)", borderColor: "var(--border-default)" }}>
          {note}
        </p>
      )}
    </section>
  );
}

function BaTooltip({ active, payload, label, suffix = "" }: any) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md px-3 py-2 text-[12px] shadow-md"
      style={{ background: "var(--brand-primary)", color: "#fff" }}>
      <div className="font-medium">{label}</div>
      <div>{value}{suffix}</div>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
        {hasFilters ? "No hay negocios que cumplan estos filtros." : "Aún no hay datos disponibles."}
      </p>
      {hasFilters && (
        <button type="button" onClick={onClear}
          className="mt-2 text-[12px] font-medium underline-offset-2 hover:underline"
          style={{ color: "var(--accent)" }}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-6">
      <div className="h-16 rounded-lg animate-pulse" style={{ background: "var(--bg-surface-subtle)" }} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[136px] rounded-lg border animate-pulse"
            style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 h-72 rounded-lg border animate-pulse"
          style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }} />
        <div className="lg:col-span-5 h-72 rounded-lg border animate-pulse"
          style={{ background: "var(--bg-surface-subtle)", borderColor: "var(--border-default)" }} />
      </div>
    </div>
  );
}
