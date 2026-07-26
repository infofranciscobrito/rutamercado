import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, Fragment, type ReactNode } from "react";
import { Download, ChevronDown, ChevronRight, CalendarIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getAnalyticsOverview,
  getTopMarkets,
  getTopOrganizers,
  getDistribution,
  getDailyTraffic,
  getAttendanceMetrics,
  getTopMarketsByIntention,
  getIntentionsPerDay,
  getIntentionMarketDetail,
  getClicksByType,
  getTrafficSources,
  getPageActivity,
  getSubmissionsStats,
  getAmenitiesDistribution,
} from "@/lib/admin-analytics.functions";
import { downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RECURRENCE_TYPE_HUMAN, type RecurrenceType } from "@/lib/recurrence";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AnalyticsSearch = { market?: string };

export const Route = createFileRoute("/_admin/admin/analytics")({
  validateSearch: (search: Record<string, unknown>): AnalyticsSearch => ({
    market: typeof search.market === "string" ? search.market : undefined,
  }),
  component: AnalyticsPage,
});

// ---------- Design tokens (locked) ----------
const INK = "#18253f";
const ACCENT = "#54b678";
const CREAM = "#FFF8EC";
const PAPER = "#FAFAF8";
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const BODY = '"Work Sans", ui-sans-serif, system-ui, sans-serif';
const PIE_COLORS = [ACCENT, INK, "#7BC9A0", "#3A5378", "#B6E0C6", "#0ea5e9", "#a855f7"];

// ---------- Helpers ----------
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

type Preset = "7" | "30" | "90" | "year" | "custom";

function computeRange(preset: Preset, customFrom?: Date, customTo?: Date): { from: Date; to: Date } {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (preset === "custom" && customFrom && customTo) {
    const from = new Date(customFrom.getFullYear(), customFrom.getMonth(), customFrom.getDate(), 0, 0, 0, 0);
    const to = new Date(customTo.getFullYear(), customTo.getMonth(), customTo.getDate(), 23, 59, 59, 999);
    return { from, to };
  }
  if (preset === "year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: endOfToday };
  }
  const days = preset === "7" ? 7 : preset === "90" ? 90 : 30;
  const from = new Date(endOfToday);
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return { from, to: endOfToday };
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("es-PR", { day: "2-digit", month: "short", year: "numeric" });
}

function recurrenceLabel(t: string): string {
  if (!t) return "—";
  return RECURRENCE_TYPE_HUMAN[t as RecurrenceType] ?? t;
}

function padRank(n: number) {
  return String(n).padStart(2, "0");
}

// ---------- Motion: count-up hook ----------
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !Number.isFinite(target)) {
      setVal(target);
      return;
    }
    startRef.current = null;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return val;
}

// ---------- Primitives ----------
function SectionHeader({
  chapter,
  title,
  subtitle,
  action,
}: {
  chapter?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-end justify-between gap-3 pb-3 border-b"
      style={{ borderColor: INK }}
    >
      <div>
        {chapter && (
          <div
            className="text-[10px] tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: MONO, color: INK, opacity: 0.5 }}
          >
            {chapter}
          </div>
        )}
        <h2
          className="text-2xl md:text-3xl leading-none"
          style={{ fontFamily: MONO, color: INK, fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-xs" style={{ fontFamily: BODY, color: INK, opacity: 0.6 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function CsvButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
      style={{
        fontFamily: MONO,
        borderColor: INK,
        color: INK,
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = INK;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Download className="h-3 w-3" /> CSV
    </button>
  );
}

function KpiTile({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  const animated = useCountUp(value);
  const display = suffix
    ? `${animated.toFixed(1)}${suffix}`
    : Math.round(animated).toLocaleString("es-PR");
  return (
    <div
      className="flex flex-col justify-between p-5 border-t"
      style={{ borderColor: INK, minHeight: 118 }}
    >
      <div
        className="text-4xl md:text-5xl leading-none tabular-nums"
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          color: accent ? ACCENT : INK,
          letterSpacing: "-0.03em",
        }}
      >
        {display}
      </div>
      <div
        className="mt-4 text-[10px] uppercase tracking-[0.2em]"
        style={{ fontFamily: MONO, color: INK, opacity: 0.55 }}
      >
        {label}
      </div>
    </div>
  );
}

function KpiPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between p-5 border-t" style={{ borderColor: INK, minHeight: 118 }}>
      <div
        className="text-4xl md:text-5xl leading-none tabular-nums"
        style={{ fontFamily: MONO, fontWeight: 700, color: INK, letterSpacing: "-0.03em" }}
      >
        {value}
      </div>
      <div
        className="mt-4 text-[10px] uppercase tracking-[0.2em]"
        style={{ fontFamily: MONO, color: INK, opacity: 0.55 }}
      >
        {label}
      </div>
    </div>
  );
}

// Editorial table wrappers
function EdTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-left border-collapse"
        style={{ fontFamily: BODY, color: INK }}
      >
        {children}
      </table>
    </div>
  );
}
function EdTh({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "py-3 font-normal text-[10px] uppercase tracking-[0.22em]",
        align === "right" && "text-right",
        className,
      )}
      style={{ fontFamily: MONO, color: INK, opacity: 0.55, borderBottom: `1px solid ${INK}` }}
    >
      {children}
    </th>
  );
}
function EdTr({ children, id, highlighted }: { children: ReactNode; id?: string; highlighted?: boolean }) {
  return (
    <tr
      id={id}
      className="transition-colors"
      style={{
        background: highlighted ? CREAM : "transparent",
        borderBottom: `1px solid ${INK}1A`,
      }}
      onMouseEnter={(e) => {
        if (!highlighted) e.currentTarget.style.background = CREAM;
      }}
      onMouseLeave={(e) => {
        if (!highlighted) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </tr>
  );
}
function EdTd({
  children,
  className,
  align = "left",
  mono,
  bold,
  muted,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
  mono?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={cn("py-4 text-sm", align === "right" && "text-right tabular-nums", className)}
      style={{
        fontFamily: mono ? MONO : BODY,
        fontWeight: bold ? 600 : 400,
        opacity: muted ? 0.5 : 1,
      }}
    >
      {children}
    </td>
  );
}

function PillBadge({ tone = "ink", children }: { tone?: "ink" | "accent" | "muted" | "warn" | "danger"; children: ReactNode }) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    ink: { bg: "transparent", fg: INK, bd: INK },
    accent: { bg: `${ACCENT}1F`, fg: INK, bd: ACCENT },
    muted: { bg: "transparent", fg: INK, bd: `${INK}33` },
    warn: { bg: "#FFF3D6", fg: "#7A4E00", bd: "#E7B94A" },
    danger: { bg: "#FBE3E3", fg: "#7A1D1D", bd: "#E29A9A" },
  };
  const c = map[tone];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
      style={{ fontFamily: MONO, background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}
    >
      {children}
    </span>
  );
}

// Custom Recharts tooltip
function InkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="text-xs px-3 py-2"
      style={{ background: INK, color: "white", fontFamily: MONO, letterSpacing: "0.02em" }}
    >
      {label && <div className="opacity-70 mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 tabular-nums">
          <span>{p.name}</span>
          <span>{typeof p.value === "number" ? p.value.toLocaleString("es-PR") : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Date range control ----------
function DateRangeControl({
  preset,
  setPreset,
  customFrom,
  customTo,
  setCustom,
}: {
  preset: Preset;
  setPreset: (p: Preset) => void;
  customFrom?: Date;
  customTo?: Date;
  setCustom: (from: Date | undefined, to: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    preset === "custom" && customFrom && customTo
      ? `${fmtDay(customFrom)} – ${fmtDay(customTo)}`
      : "Seleccionar rango";

  return (
    <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: MONO }}>
      <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
        <SelectTrigger
          className="w-52 rounded-none text-xs uppercase tracking-[0.16em]"
          style={{ borderColor: INK, color: INK, fontFamily: MONO }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Últimos 7 días</SelectItem>
          <SelectItem value="30">Últimos 30 días</SelectItem>
          <SelectItem value="90">Últimos 90 días</SelectItem>
          <SelectItem value="year">Este año</SelectItem>
          <SelectItem value="custom">Rango personalizado</SelectItem>
        </SelectContent>
      </Select>
      {preset === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-none justify-start text-left font-normal text-xs uppercase tracking-[0.16em]",
                !customFrom && "text-muted-foreground",
              )}
              style={{ borderColor: INK, color: INK, fontFamily: MONO }}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: customFrom, to: customTo }}
              onSelect={(range) => {
                setCustom(range?.from, range?.to);
                if (range?.from && range?.to) setOpen(false);
              }}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// ========================================================================
// PAGE
// ========================================================================

function AnalyticsPage() {
  const { market: marketFromUrl } = Route.useSearch();
  const [preset, setPreset] = useState<Preset>("30");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(marketFromUrl ?? null);

  const { from, to } = useMemo(
    () => computeRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );
  const fromISO = from.toISOString();
  const toISO = to.toISOString();
  const rangeArg = { from: fromISO, to: toISO };

  useEffect(() => {
    if (marketFromUrl) {
      setExpandedId(marketFromUrl);
      setTimeout(() => {
        document
          .getElementById(`intention-row-${marketFromUrl}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [marketFromUrl]);

  const overviewFn = useServerFn(getAnalyticsOverview);
  const topMarketsFn = useServerFn(getTopMarkets);
  const topOrgFn = useServerFn(getTopOrganizers);
  const distFn = useServerFn(getDistribution);
  const trafficFn = useServerFn(getDailyTraffic);
  const attMetricsFn = useServerFn(getAttendanceMetrics);
  const attTopFn = useServerFn(getTopMarketsByIntention);
  const attDailyFn = useServerFn(getIntentionsPerDay);
  const attDetailFn = useServerFn(getIntentionMarketDetail);
  const clicksByTypeFn = useServerFn(getClicksByType);
  const trafficSourcesFn = useServerFn(getTrafficSources);
  const pageActivityFn = useServerFn(getPageActivity);
  const submissionsFn = useServerFn(getSubmissionsStats);
  const amenitiesFn = useServerFn(getAmenitiesDistribution);

  const logFetch = async <T,>(label: string, fetcher: () => Promise<T>) => {
    try {
      return await fetcher();
    } catch (err) {
      console.error(`[Admin data] ${label}: fetch error`, err);
      throw err;
    }
  };

  const rangeKey = [fromISO, toISO];

  const overview = useQuery({
    queryKey: ["admin", "analytics", "overview", ...rangeKey],
    queryFn: () => logFetch("overview", () => overviewFn({ data: rangeArg })),
  });
  const topMarkets = useQuery({
    queryKey: ["admin", "analytics", "topMarkets", ...rangeKey],
    queryFn: () => logFetch("topMarkets", () => topMarketsFn({ data: rangeArg })),
  });
  const topOrg = useQuery({
    queryKey: ["admin", "analytics", "topOrg", ...rangeKey],
    queryFn: () => logFetch("topOrg", () => topOrgFn({ data: rangeArg })),
  });
  const dist = useQuery({
    queryKey: ["admin", "analytics", "dist"],
    queryFn: () => logFetch("dist", () => distFn()),
  });
  const traffic = useQuery({
    queryKey: ["admin", "analytics", "traffic", ...rangeKey],
    queryFn: () => logFetch("traffic", () => trafficFn({ data: rangeArg })),
  });
  const attMetrics = useQuery({
    queryKey: ["admin", "analytics", "attendance", "metrics", ...rangeKey],
    queryFn: () => logFetch("att metrics", () => attMetricsFn({ data: rangeArg })),
  });
  const attTop = useQuery({
    queryKey: ["admin", "analytics", "attendance", "top"],
    queryFn: () => logFetch("att top", () => attTopFn({ data: { limit: 10 } })),
  });
  const attAll = useQuery({
    queryKey: ["admin", "analytics", "attendance", "all"],
    queryFn: () => logFetch("att all", () => attTopFn({ data: {} })),
  });
  const attDaily = useQuery({
    queryKey: ["admin", "analytics", "attendance", "daily", ...rangeKey],
    queryFn: () => logFetch("att daily", () => attDailyFn({ data: rangeArg })),
  });
  const attDetail = useQuery({
    queryKey: ["admin", "analytics", "attendance", "detail", expandedId],
    queryFn: () => logFetch("att detail", () => attDetailFn({ data: { marketId: expandedId!, days: 30 } })),
    enabled: !!expandedId,
  });
  const clicksByType = useQuery({
    queryKey: ["admin", "analytics", "clicksByType", ...rangeKey],
    queryFn: () => logFetch("clicks by type", () => clicksByTypeFn({ data: rangeArg })),
  });
  const trafficSources = useQuery({
    queryKey: ["admin", "analytics", "trafficSources", ...rangeKey],
    queryFn: () => logFetch("traffic sources", () => trafficSourcesFn({ data: rangeArg })),
  });
  const pageActivity = useQuery({
    queryKey: ["admin", "analytics", "pageActivity", ...rangeKey],
    queryFn: () => logFetch("page activity", () => pageActivityFn({ data: rangeArg })),
  });
  const submissions = useQuery({
    queryKey: ["admin", "analytics", "submissions", ...rangeKey],
    queryFn: () => logFetch("submissions", () => submissionsFn({ data: rangeArg })),
  });
  const amenities = useQuery({
    queryKey: ["admin", "analytics", "amenities"],
    queryFn: () => logFetch("amenities", () => amenitiesFn()),
  });

  const isLoading =
    overview.isLoading || topMarkets.isLoading || topOrg.isLoading || dist.isLoading ||
    traffic.isLoading || attMetrics.isLoading || attTop.isLoading || attDaily.isLoading ||
    clicksByType.isLoading || trafficSources.isLoading || pageActivity.isLoading || submissions.isLoading;
  const error =
    overview.error ?? topMarkets.error ?? topOrg.error ?? dist.error ?? traffic.error ??
    attMetrics.error ?? attTop.error ?? attDaily.error ?? clicksByType.error ??
    trafficSources.error ?? pageActivity.error ?? submissions.error;

  if (isLoading) {
    return (
      <div
        className="py-24 text-center text-xs uppercase tracking-[0.25em]"
        style={{ fontFamily: MONO, color: INK, opacity: 0.5 }}
      >
        Cargando analíticas…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="py-24 text-center text-xs uppercase tracking-[0.25em] text-destructive"
        style={{ fontFamily: MONO }}
      >
        No se pudieron cargar las analíticas: {error.message}
      </div>
    );
  }

  const ov = overview.data;
  const subm = submissions.data;
  const clicks = clicksByType.data ?? [];
  const clicksMax = Math.max(1, ...clicks.map((c) => c.count));

  return (
    <div
      className="mx-auto w-full max-w-6xl px-2 md:px-4 py-4 space-y-16"
      style={{ background: PAPER, color: INK, fontFamily: BODY }}
    >
      {/* ================= HEADER ================= */}
      <header
        className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b-2"
        style={{ borderColor: INK }}
      >
        <div>
          <div
            className="text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: MONO, opacity: 0.5 }}
          >
            Reporte · Vol. {new Date().getFullYear()}
          </div>
          <h1
            className="text-5xl md:text-7xl leading-[0.9]"
            style={{ fontFamily: MONO, fontWeight: 700, letterSpacing: "-0.04em" }}
          >
            Analíticas
          </h1>
          <p
            className="mt-3 text-sm uppercase tracking-[0.2em]"
            style={{ fontFamily: MONO, opacity: 0.55 }}
          >
            {fmtDay(from)} — {fmtDay(to)}
          </p>
        </div>
        <DateRangeControl
          preset={preset}
          setPreset={(p) => {
            setPreset(p);
            if (p !== "custom") {
              setCustomFrom(undefined);
              setCustomTo(undefined);
            }
          }}
          customFrom={customFrom}
          customTo={customTo}
          setCustom={(f, t) => {
            setCustomFrom(f);
            setCustomTo(t);
          }}
        />
      </header>

      {/* ================= 01 · ALCANCE ================= */}
      <section className="space-y-4">
        <SectionHeader chapter="Capítulo 01" title="Alcance" subtitle="Volumen de tráfico y engagement general" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          <KpiTile label="Vistas Directorio" value={ov?.homeViews ?? 0} />
          <KpiTile label="Vistas de Detalle" value={ov?.detailViews ?? 0} />
          <KpiTile label="Cómo llegar" value={ov?.directionsClicks ?? 0} />
          <KpiTile label="Engagement" value={ov?.engagementRate ?? 0} suffix="%" accent />
        </div>
      </section>

      {/* ================= 02 · INTERACCIÓN ================= */}
      <section className="space-y-4">
        <SectionHeader chapter="Capítulo 02" title="Interacción" subtitle="Clics de contacto con organizadores" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          <KpiTile label="Clics Teléfono" value={ov?.clickPhone ?? 0} />
          <KpiTile label="Clics Email" value={ov?.clickEmail ?? 0} />
          <KpiTile label="Clics Instagram" value={ov?.clickInstagram ?? 0} />
          <KpiTile label="Clics URL Contacto" value={ov?.clickContact ?? 0} />
        </div>
      </section>

      {/* ================= 03 · INTENCIÓN & ESTADO ================= */}
      <section className="space-y-4">
        <SectionHeader chapter="Capítulo 03" title="Intención & Estado" subtitle="Actividad de usuarios y salud del catálogo" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          <KpiTile label="¡Voy a ir!" value={ov?.willAttend ?? 0} accent />
          <KpiTile label="Me interesa" value={ov?.interested ?? 0} />
          <KpiPair
            label="Mercados activos / inactivos"
            value={`${ov?.activeMarkets ?? 0} / ${ov?.inactiveMarkets ?? 0}`}
          />
          <KpiTile label="Submissions pendientes" value={ov?.pendingSubmissions ?? 0} />
        </div>
      </section>

      {/* ================= 04 · TOP MERCADOS ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 04"
          title="Top 10 Mercados por Vistas"
          action={
            <CsvButton
              disabled={!topMarkets.data?.length}
              onClick={() =>
                downloadCSV(
                  "top-mercados.csv",
                  (topMarkets.data ?? []).map((m) => ({
                    rank: m.rank,
                    mercado: m.name,
                    vistas: m.views,
                    telefono: m.clickPhone,
                    email: m.clickEmail,
                    direcciones: m.directionsClicks,
                    contacto: m.clickContact,
                    ire: m.willAttend,
                    me_interesa: m.interested,
                    recurrencia: recurrenceLabel(m.recurrenceType),
                  })),
                )
              }
            />
          }
        />
        <EdTable>
          <thead>
            <tr>
              <EdTh className="w-12">#</EdTh>
              <EdTh>Mercado</EdTh>
              <EdTh align="right">Vistas</EdTh>
              <EdTh align="right">Tel</EdTh>
              <EdTh align="right">Email</EdTh>
              <EdTh align="right">Dir.</EdTh>
              <EdTh align="right">Contacto</EdTh>
              <EdTh align="right">Iré</EdTh>
              <EdTh align="right">Me interesa</EdTh>
              <EdTh>Recurrencia</EdTh>
            </tr>
          </thead>
          <tbody>
            {(topMarkets.data ?? []).map((m) => (
              <EdTr key={m.id}>
                <EdTd mono muted>{padRank(m.rank)}</EdTd>
                <EdTd bold>{m.name}</EdTd>
                <EdTd align="right" mono bold>{m.views}</EdTd>
                <EdTd align="right" mono>{m.clickPhone}</EdTd>
                <EdTd align="right" mono>{m.clickEmail}</EdTd>
                <EdTd align="right" mono>{m.directionsClicks}</EdTd>
                <EdTd align="right" mono>{m.clickContact}</EdTd>
                <EdTd align="right" mono>{m.willAttend}</EdTd>
                <EdTd align="right" mono>{m.interested}</EdTd>
                <EdTd>
                  <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: MONO, opacity: 0.7 }}>
                    {recurrenceLabel(m.recurrenceType)}
                  </span>
                </EdTd>
              </EdTr>
            ))}
          </tbody>
        </EdTable>
      </section>

      {/* ================= 05 · TOP ORGANIZADORES ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 05"
          title="Top Organizadores"
          action={
            <CsvButton
              disabled={!topOrg.data?.length}
              onClick={() => downloadCSV("top-organizadores.csv", topOrg.data ?? [])}
            />
          }
        />
        <EdTable>
          <thead>
            <tr>
              <EdTh className="w-12">#</EdTh>
              <EdTh>Organizador</EdTh>
              <EdTh align="right">Mercados</EdTh>
              <EdTh align="right">Vistas</EdTh>
              <EdTh align="right">Clics</EdTh>
            </tr>
          </thead>
          <tbody>
            {(topOrg.data ?? []).map((o, i) => (
              <EdTr key={o.organizer}>
                <EdTd mono muted>{padRank(i + 1)}</EdTd>
                <EdTd bold>{o.organizer}</EdTd>
                <EdTd align="right" mono>{o.markets}</EdTd>
                <EdTd align="right" mono bold>{o.views}</EdTd>
                <EdTd align="right" mono>{o.clicks}</EdTd>
              </EdTr>
            ))}
          </tbody>
        </EdTable>
      </section>

      {/* ================= 06 · CLICS POR TIPO ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 06"
          title="Análisis de Clicks por Tipo"
          action={
            <CsvButton
              disabled={!clicks.length}
              onClick={() =>
                downloadCSV(
                  "clicks-por-tipo.csv",
                  clicks.map((r) => ({ tipo: r.label, total: r.count })),
                )
              }
            />
          }
        />
        <ul className="space-y-4">
          {clicks.length === 0 ? (
            <li className="py-6 text-center text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
              Sin datos en este período
            </li>
          ) : (
            clicks.map((c) => {
              const pct = (c.count / clicksMax) * 100;
              return (
                <li key={c.label} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO }}>
                      {c.label}
                    </span>
                    <span className="tabular-nums" style={{ fontFamily: MONO, fontWeight: 700 }}>
                      {c.count.toLocaleString("es-PR")}
                    </span>
                  </div>
                  <div className="h-2" style={{ background: `${INK}0F` }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: ACCENT }}
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* ================= 07 · DISTRIBUCIÓN ================= */}
      <section className="space-y-5">
        <SectionHeader chapter="Capítulo 07" title="Distribución del Catálogo" subtitle="Todos los mercados activos" />
        <div className="grid gap-10 lg:grid-cols-2">
          <PieBlock title="Por Categoría" data={dist.data?.byCategory ?? []} />
          <PieBlock title="Por Región" data={dist.data?.byRegion ?? []} />
        </div>
      </section>

      {/* ================= 08 · TRÁFICO DIARIO ================= */}
      <section className="space-y-5">
        <SectionHeader chapter="Capítulo 08" title="Tráfico Diario" />
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={traffic.data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={INK} strokeOpacity={0.08} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }}
                axisLine={{ stroke: INK, strokeOpacity: 0.2 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<InkTooltip />} />
              <Line type="monotone" dataKey="views" name="Visitas" stroke={ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ================= 09 · FUENTES DE TRÁFICO ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 09"
          title="Fuentes de Tráfico"
          action={
            <CsvButton
              disabled={!trafficSources.data?.topReferrers?.length}
              onClick={() =>
                downloadCSV(
                  "fuentes-trafico.csv",
                  (trafficSources.data?.topReferrers ?? []).map((r) => ({
                    referrer: r.host,
                    categoria: r.category,
                    visitas: r.count,
                  })),
                )
              }
            />
          }
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={trafficSources.data?.byCategory ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  stroke={PAPER}
                  strokeWidth={2}
                  label={{ fontSize: 10, fontFamily: MONO, fill: INK }}
                >
                  {(trafficSources.data?.byCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<InkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <EdTable>
            <thead>
              <tr>
                <EdTh>Referrer</EdTh>
                <EdTh>Categoría</EdTh>
                <EdTh align="right">Visitas</EdTh>
              </tr>
            </thead>
            <tbody>
              {(trafficSources.data?.topReferrers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
                    Sin datos en este período
                  </td>
                </tr>
              ) : (
                (trafficSources.data?.topReferrers ?? []).map((r) => (
                  <EdTr key={r.host}>
                    <EdTd bold>{truncate(r.host, 40)}</EdTd>
                    <EdTd><PillBadge tone="accent">{r.category}</PillBadge></EdTd>
                    <EdTd align="right" mono bold>{r.count}</EdTd>
                  </EdTr>
                ))
              )}
            </tbody>
          </EdTable>
        </div>
      </section>

      {/* ================= 10 · ACTIVIDAD POR PÁGINA ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 10"
          title="Actividad por Página"
          action={
            <CsvButton
              disabled={!pageActivity.data?.length}
              onClick={() => downloadCSV("actividad-paginas.csv", pageActivity.data ?? [])}
            />
          }
        />
        <div className="max-h-96 overflow-y-auto">
          <EdTable>
            <thead>
              <tr>
                <EdTh>Página</EdTh>
                <EdTh align="right">Visitas</EdTh>
              </tr>
            </thead>
            <tbody>
              {(pageActivity.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
                    Sin datos en este período
                  </td>
                </tr>
              ) : (
                (pageActivity.data ?? []).map((r) => (
                  <EdTr key={r.page}>
                    <EdTd bold>{r.page}</EdTd>
                    <EdTd align="right" mono bold>{r.views}</EdTd>
                  </EdTr>
                ))
              )}
            </tbody>
          </EdTable>
        </div>
      </section>

      {/* ================= 11 · SUBMISSIONS ================= */}
      <section className="space-y-5">
        <SectionHeader
          chapter="Capítulo 11"
          title="Submissions de Mercados"
          subtitle={`Total en el período: ${subm?.total ?? 0}`}
          action={
            <div className="flex flex-wrap gap-2">
              <PillBadge tone="warn">Pendientes · {subm?.pending ?? 0}</PillBadge>
              <PillBadge tone="accent">Aprobadas · {subm?.approved ?? 0}</PillBadge>
              <PillBadge tone="danger">Rechazadas · {subm?.rejected ?? 0}</PillBadge>
            </div>
          }
        />
        <EdTable>
          <thead>
            <tr>
              <EdTh>Nombre</EdTh>
              <EdTh>Municipio</EdTh>
              <EdTh>Fecha</EdTh>
              <EdTh>Estado</EdTh>
            </tr>
          </thead>
          <tbody>
            {(subm?.recent ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
                  Sin submissions en este período
                </td>
              </tr>
            ) : (
              (subm?.recent ?? []).map((s: { id: string; name: string; municipality: string; status: string; created_at: string }) => (
                <EdTr key={s.id}>
                  <EdTd bold>{s.name}</EdTd>
                  <EdTd>{s.municipality}</EdTd>
                  <EdTd mono>{fmtDay(new Date(s.created_at))}</EdTd>
                  <EdTd>
                    <PillBadge
                      tone={s.status === "pending" ? "warn" : s.status === "approved" ? "accent" : "danger"}
                    >
                      {s.status === "pending" ? "Pendiente" : s.status === "approved" ? "Aprobado" : "Rechazado"}
                    </PillBadge>
                  </EdTd>
                </EdTr>
              ))
            )}
          </tbody>
        </EdTable>
      </section>

      {/* ================= 12 · SERVICIOS E INSTALACIONES ================= */}
      <section className="space-y-5 p-6 md:p-8" style={{ background: CREAM, borderTop: `1px solid ${INK}` }}>
        <SectionHeader
          chapter="Capítulo 12"
          title="Servicios e Instalaciones"
          subtitle={`Distribución en ${amenities.data?.totalActive ?? 0} mercados activos`}
          action={
            <CsvButton
              disabled={!amenities.data?.groups?.length}
              onClick={() => {
                const rows: Record<string, string | number>[] = [];
                for (const g of amenities.data?.groups ?? []) {
                  for (const o of g.options) {
                    rows.push({
                      servicio: g.label,
                      opcion: o.value,
                      mercados: o.count,
                      porcentaje: `${o.percent.toFixed(1)}%`,
                    });
                  }
                }
                downloadCSV("servicios-mercados.csv", rows);
              }}
            />
          }
        />
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {(amenities.data?.groups ?? []).map((g) => (
            <div key={g.key} className="space-y-4">
              <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: `${INK}33` }}>
                <h3 className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>
                  {g.label}
                </h3>
                <span className="text-[10px] tabular-nums" style={{ fontFamily: MONO, opacity: 0.55 }}>
                  {g.withData}/{g.total}
                </span>
              </div>
              {g.options.length === 0 ? (
                <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>Sin datos</p>
              ) : (
                <ul className="space-y-3">
                  {g.options.map((o) => (
                    <li key={o.value} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="truncate" style={{ fontFamily: BODY }}>{o.value}</span>
                        <span className="tabular-nums shrink-0" style={{ fontFamily: MONO, opacity: 0.7 }}>
                          {o.count} · {o.percent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-[3px]" style={{ background: `${INK}14` }}>
                        <div
                          className="h-full"
                          style={{ width: `${Math.min(100, o.percent)}%`, background: ACCENT }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= 13 · INTENCIÓN DE ASISTENCIA ================= */}
      <section className="space-y-8">
        <SectionHeader
          chapter="Capítulo 13"
          title="Intención de Asistencia"
          subtitle="Interés expresado por los visitantes"
        />
        <div className="grid grid-cols-2 md:grid-cols-4">
          <KpiTile label="¡Voy a ir!" value={attMetrics.data?.willAttend ?? 0} accent />
          <KpiTile label="Me interesa" value={attMetrics.data?.interested ?? 0} />
          <KpiTile label="Tasa de intención" value={attMetrics.data?.intentionRate ?? 0} suffix="%" />
          <KpiTile label="Visitantes únicos" value={attMetrics.data?.uniqueVisitors ?? 0} />
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between border-b pb-3" style={{ borderColor: `${INK}33` }}>
            <h3 className="text-lg uppercase tracking-[0.18em]" style={{ fontFamily: MONO, fontWeight: 700 }}>
              Top 10 por Intención
            </h3>
            <CsvButton
              disabled={!attAll.data?.length}
              onClick={() =>
                downloadCSV(
                  "intencion-asistencia.csv",
                  (attAll.data ?? []).map((r) => ({
                    nombre_mercado: r.name,
                    categoria: r.category,
                    municipio: r.municipality,
                    vistas: r.detailViews,
                    voy_a_ir: r.willAttend,
                    me_interesa: r.interested,
                    total_intenciones: r.total,
                    tasa_intencion: `${r.intentionRate.toFixed(1)}%`,
                  })),
                )
              }
            />
          </div>
          <EdTable>
            <thead>
              <tr>
                <EdTh className="w-12">#</EdTh>
                <EdTh>Mercado</EdTh>
                <EdTh>Categoría</EdTh>
                <EdTh>Municipio</EdTh>
                <EdTh align="right">Voy a ir</EdTh>
                <EdTh align="right">Me interesa</EdTh>
                <EdTh align="right">Total</EdTh>
                <EdTh align="right">Vistas</EdTh>
                <EdTh align="right">Tasa</EdTh>
              </tr>
            </thead>
            <tbody>
              {(attTop.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
                    Aún no hay intenciones registradas
                  </td>
                </tr>
              ) : (
                (attTop.data ?? []).map((r) => {
                  const isExpanded = expandedId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <EdTr id={`intention-row-${r.id}`} highlighted={isExpanded}>
                        <EdTd mono muted>{padRank(r.rank)}</EdTd>
                        <EdTd>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            className="inline-flex items-center gap-1.5 hover:underline"
                            style={{ color: INK, fontWeight: 600 }}
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {r.name}
                          </button>
                        </EdTd>
                        <EdTd><PillBadge tone="accent">{r.category}</PillBadge></EdTd>
                        <EdTd>{r.municipality}</EdTd>
                        <EdTd align="right" mono>{r.willAttend}</EdTd>
                        <EdTd align="right" mono>{r.interested}</EdTd>
                        <EdTd align="right" mono bold>{r.total}</EdTd>
                        <EdTd align="right" mono>{r.detailViews}</EdTd>
                        <EdTd align="right" mono>{r.intentionRate.toFixed(1)}%</EdTd>
                      </EdTr>
                      {isExpanded && (
                        <tr style={{ background: CREAM }}>
                          <td colSpan={9} className="p-0">
                            <IntentionDetailPanel
                              loading={attDetail.isLoading || attDetail.isFetching}
                              data={attDetail.data && attDetail.data.market.id === r.id ? attDetail.data : null}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </EdTable>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>
              Intención por Mercado
            </h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={attTop.data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={INK} strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    axisLine={{ stroke: INK, strokeOpacity: 0.2 }}
                    tickLine={false}
                    tickFormatter={(v: string) => truncate(v, 14)}
                  />
                  <YAxis tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<InkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
                  <Bar dataKey="willAttend" name="Voy a ir" stackId="a" fill={ACCENT} />
                  <Bar dataKey="interested" name="Me interesa" stackId="a" fill={INK} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>
              Intenciones por Día
            </h3>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={attDaily.data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={INK} strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }} axisLine={{ stroke: INK, strokeOpacity: 0.2 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<InkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
                  <Line type="monotone" dataKey="willAttend" name="Voy a ir" stroke={ACCENT} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="interested" name="Me interesa" stroke={INK} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Footer bar */}
      <footer
        className="pt-8 pb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] border-t"
        style={{ fontFamily: MONO, borderColor: INK, opacity: 0.5 }}
      >
        <span>RutaMercado · Analytics</span>
        <span>Generado {fmtDay(new Date())}</span>
      </footer>
    </div>
  );
}

// ---------- Sub-blocks ----------

function PieBlock({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              stroke={PAPER}
              strokeWidth={2}
              label={{ fontSize: 10, fontFamily: MONO, fill: INK }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<InkTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type DetailData = {
  market: { id: string; name: string; category: string; municipality: string; view_count: number | null };
  willAttend: number;
  interested: number;
  total: number;
  detailViews: number;
  uniqueVisitors: number;
  intentionRate: number;
  daily: { date: string; willAttend: number; interested: number }[];
};

function IntentionDetailPanel({ loading, data }: { loading: boolean; data: DetailData | null }) {
  if (loading || !data) {
    return (
      <div className="p-6 text-xs uppercase tracking-[0.22em]" style={{ fontFamily: MONO, opacity: 0.5 }}>
        Cargando detalle…
      </div>
    );
  }
  const donutData = [
    { name: "Voy a ir", value: data.willAttend },
    { name: "Me interesa", value: data.interested },
  ];
  return (
    <div className="p-6 space-y-6" style={{ borderTop: `1px solid ${INK}22` }}>
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-xl" style={{ fontFamily: MONO, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>
          {data.market.name}
        </h3>
        <PillBadge tone="accent">{data.market.category}</PillBadge>
        <PillBadge tone="muted">{data.market.municipality}</PillBadge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4">
        <KpiTile label="Visitantes únicos" value={data.uniqueVisitors} />
        <KpiTile label="Vistas de detalle" value={data.detailViews} />
        <KpiTile label="Total intenciones" value={data.total} />
        <KpiTile label="Tasa de conversión" value={data.intentionRate} suffix="%" accent />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>Proporción</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} stroke={CREAM} strokeWidth={2}>
                  <Cell fill={ACCENT} />
                  <Cell fill={INK} />
                </Pie>
                <Tooltip content={<InkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-[0.22em]" style={{ fontFamily: MONO, fontWeight: 700 }}>Últimos 30 días</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={data.daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={INK} strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }} axisLine={{ stroke: INK, strokeOpacity: 0.2 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: MONO, fill: INK, opacity: 0.6 }} axisLine={false} tickLine={false} />
                <Tooltip content={<InkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.15em" }} />
                <Line type="monotone" dataKey="willAttend" name="Voy a ir" stroke={ACCENT} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="interested" name="Me interesa" stroke={INK} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div>
        <Link
          to="/admin/markets"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] hover:underline"
          style={{ fontFamily: MONO, color: INK }}
        >
          Ver en gestión de mercados →
        </Link>
      </div>
    </div>
  );
}
