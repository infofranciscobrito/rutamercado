import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import {
  Download,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
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
  AreaChart,
  Area,
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
  getFeaturedPerformance,
} from "@/lib/admin-analytics.functions";
import { downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECURRENCE_TYPE_HUMAN, type RecurrenceType } from "@/lib/recurrence";

type AnalyticsSearch = { market?: string };

export const Route = createFileRoute("/_admin/admin/analytics")({
  validateSearch: (search: Record<string, unknown>): AnalyticsSearch => ({
    market: typeof search.market === "string" ? search.market : undefined,
  }),
  component: AnalyticsPage,
});

/* ============================================================== */
/*  Constants                                                      */
/* ============================================================== */

type Preset = "today" | "7" | "30" | "90" | "mtd" | "year" | "custom" | "all";
type ThemeMode = "light" | "dark" | "system";
const THEME_KEY = "rm-analytics-theme";

const PRESET_LABEL: Record<Preset, string> = {
  all: "Todo",
  today: "Hoy",
  "7": "Últimos 7 días",
  "30": "Últimos 30 días",
  "90": "Últimos 90 días",
  mtd: "Mes a la fecha",
  year: "Este año",
  custom: "Personalizado",
};

const SEQ = [
  "var(--seq-100)",
  "var(--seq-300)",
  "var(--seq-500)",
  "var(--seq-700)",
  "var(--seq-900)",
];
const CAT = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
];
const PIE_COLORS = [
  "var(--accent)",
  "var(--seq-700)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
];

/* ============================================================== */
/*  Date range                                                     */
/* ============================================================== */

function computeRange(
  preset: Preset,
  from?: string,
  to?: string,
): { from: string | null; to: string | null } {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  if (preset === "all") return { from: null, to: null };
  if (preset === "today") {
    const s = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    return { from: s, to: end.toISOString() };
  }
  if (preset === "mtd") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { from: s, to: end.toISOString() };
  }
  if (preset === "year") {
    const s = new Date(now.getFullYear(), 0, 1).toISOString();
    return { from: s, to: end.toISOString() };
  }
  if (preset === "custom") {
    return {
      from: from ? new Date(from + "T00:00:00").toISOString() : null,
      to: to ? new Date(to + "T23:59:59").toISOString() : null,
    };
  }
  const days = Number(preset);
  const s = new Date(end.getTime() - (days - 1) * 86400000);
  s.setHours(0, 0, 0, 0);
  return { from: s.toISOString(), to: end.toISOString() };
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("es-PR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function recurrenceLabel(t: string): string {
  if (!t) return "—";
  return RECURRENCE_TYPE_HUMAN[t as RecurrenceType] ?? t;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* ============================================================== */
/*  Theme                                                          */
/* ============================================================== */

function useDashboardTheme(): [
  ThemeMode,
  "light" | "dark",
  (m: ThemeMode) => void,
] {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(THEME_KEY) as ThemeMode | null)
        : null;
    if (stored === "light" || stored === "dark" || stored === "system")
      setMode(stored);
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
    try {
      localStorage.setItem(THEME_KEY, m);
    } catch {
      /* noop */
    }
  };

  return [mode, resolved, setPersist];
}

function ThemeToggle({
  mode,
  onChange,
}: {
  mode: ThemeMode;
  onChange: (m: ThemeMode) => void;
}) {
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
      style={{
        borderColor: "var(--border-default)",
        background: "var(--bg-surface)",
      }}
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
/*  Counter                                                        */
/* ============================================================== */

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) {
      setN(target);
      return;
    }
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);
  return n;
}

/* ============================================================== */
/*  Primitives                                                     */
/* ============================================================== */

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-[10.5px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({
  title,
  subtitle,
  n,
  note,
  action,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  n?: number;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="ba-card ba-enter h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-[14px] font-bold"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {typeof n === "number" && (
              <span
                className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                n = {n}
              </span>
            )}
            {action}
          </div>
        </div>
        {subtitle && (
          <p
            className="mt-1 text-[11.5px]"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </header>
      {children}
      {note && (
        <p
          className="mt-3 border-t pt-3 text-[10.5px]"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border-default)",
          }}
        >
          {note}
        </p>
      )}
    </section>
  );
}

type ChipTone = "good" | "warning" | "critical" | "neutral" | "accent";

function KpiTile({
  label,
  value,
  suffix,
  chip,
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  chip?: { text: string; tone: ChipTone };
  delay?: number;
}) {
  const n = useCountUp(value);
  const display = suffix
    ? `${n.toFixed(1).replace(/\.0$/, "")}${suffix}`
    : n.toLocaleString("es-PR");
  const toneMap: Record<ChipTone, { bg: string; fg: string }> = {
    good: { bg: "var(--status-good-bg)", fg: "var(--status-good)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning)" },
    critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical)" },
    neutral: { bg: "var(--bg-surface-subtle)", fg: "var(--text-secondary)" },
    accent: {
      bg: "color-mix(in oklab, var(--accent) 14%, transparent)",
      fg: "var(--accent)",
    },
  };
  return (
    <div
      className="ba-card ba-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="text-[11.5px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </div>
      <div
        className="mt-2 text-[38px] font-bold leading-none tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {display}
      </div>
      {chip && (
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold"
            style={{
              background: toneMap[chip.tone].bg,
              color: toneMap[chip.tone].fg,
            }}
          >
            {chip.text}
          </span>
        </div>
      )}
    </div>
  );
}

function CsvButton({
  onClick,
  disabled,
  label = "CSV",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: "var(--border-default)",
        color: "var(--text-secondary)",
        background: "var(--bg-surface)",
      }}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "good" | "warning" | "critical" | "neutral";
  children: ReactNode;
}) {
  const map = {
    good: { bg: "var(--status-good-bg)", fg: "var(--status-good)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning)" },
    critical: {
      bg: "var(--status-critical-bg)",
      fg: "var(--status-critical)",
    },
    neutral: {
      bg: "var(--bg-surface-subtle)",
      fg: "var(--text-secondary)",
    },
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: map[tone].bg, color: map[tone].fg }}
    >
      {children}
    </span>
  );
}

/* Recharts custom tooltip */
function BaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md px-3 py-2 text-[12px] shadow-md"
      style={{ background: "var(--brand-primary)", color: "#fff" }}
    >
      {label && <div className="font-medium">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 tabular-nums">
          <span style={{ opacity: 0.8 }}>{p.name}</span>
          <span className="font-semibold">
            {typeof p.value === "number"
              ? p.value.toLocaleString("es-PR")
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================== */
/*  Page                                                           */
/* ============================================================== */

function AnalyticsPage() {
  const { market: marketFromUrl } = Route.useSearch();
  const [preset, setPreset] = useState<Preset>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(
    marketFromUrl ?? null,
  );
  const [themeMode, resolvedTheme, setThemeMode] = useDashboardTheme();

  const { from, to } = useMemo(
    () => computeRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );
  const rangeArg = { from: from ?? "", to: to ?? "" };
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

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
  const featuredFn = useServerFn(getFeaturedPerformance);

  const rangeKey = [from ?? "", to ?? ""];

  const overview = useQuery({
    queryKey: ["admin", "analytics", "overview", ...rangeKey],
    queryFn: () => overviewFn({ data: rangeArg }),
  });
  const topMarkets = useQuery({
    queryKey: ["admin", "analytics", "topMarkets", ...rangeKey],
    queryFn: () => topMarketsFn({ data: rangeArg }),
  });
  const topOrg = useQuery({
    queryKey: ["admin", "analytics", "topOrg", ...rangeKey],
    queryFn: () => topOrgFn({ data: rangeArg }),
  });
  const dist = useQuery({
    queryKey: ["admin", "analytics", "dist"],
    queryFn: () => distFn(),
  });
  const traffic = useQuery({
    queryKey: ["admin", "analytics", "traffic", ...rangeKey],
    queryFn: () => trafficFn({ data: rangeArg }),
  });
  const attMetrics = useQuery({
    queryKey: ["admin", "analytics", "attendance", "metrics", ...rangeKey],
    queryFn: () => attMetricsFn({ data: rangeArg }),
  });
  const attTop = useQuery({
    queryKey: ["admin", "analytics", "attendance", "top"],
    queryFn: () => attTopFn({ data: { limit: 10 } }),
  });
  const attAll = useQuery({
    queryKey: ["admin", "analytics", "attendance", "all"],
    queryFn: () => attTopFn({ data: {} }),
  });
  const attDaily = useQuery({
    queryKey: ["admin", "analytics", "attendance", "daily", ...rangeKey],
    queryFn: () => attDailyFn({ data: rangeArg }),
  });
  const attDetail = useQuery({
    queryKey: ["admin", "analytics", "attendance", "detail", expandedId],
    queryFn: () =>
      attDetailFn({ data: { marketId: expandedId!, days: 30 } }),
    enabled: !!expandedId,
  });
  const clicksByType = useQuery({
    queryKey: ["admin", "analytics", "clicksByType", ...rangeKey],
    queryFn: () => clicksByTypeFn({ data: rangeArg }),
  });
  const trafficSources = useQuery({
    queryKey: ["admin", "analytics", "trafficSources", ...rangeKey],
    queryFn: () => trafficSourcesFn({ data: rangeArg }),
  });
  const pageActivity = useQuery({
    queryKey: ["admin", "analytics", "pageActivity", ...rangeKey],
    queryFn: () => pageActivityFn({ data: rangeArg }),
  });
  const submissions = useQuery({
    queryKey: ["admin", "analytics", "submissions", ...rangeKey],
    queryFn: () => submissionsFn({ data: rangeArg }),
  });
  const amenities = useQuery({
    queryKey: ["admin", "analytics", "amenities"],
    queryFn: () => amenitiesFn(),
  });
  const featured = useQuery({
    queryKey: ["admin", "analytics", "featured", ...rangeKey],
    queryFn: () => featuredFn({ data: rangeArg }),
  });

  const isLoading =
    overview.isLoading ||
    topMarkets.isLoading ||
    topOrg.isLoading ||
    dist.isLoading ||
    traffic.isLoading ||
    attMetrics.isLoading ||
    attTop.isLoading ||
    attDaily.isLoading ||
    clicksByType.isLoading ||
    trafficSources.isLoading ||
    pageActivity.isLoading ||
    submissions.isLoading;
  const error =
    overview.error ??
    topMarkets.error ??
    topOrg.error ??
    dist.error ??
    traffic.error ??
    attMetrics.error ??
    attTop.error ??
    attDaily.error ??
    clicksByType.error ??
    trafficSources.error ??
    pageActivity.error ??
    submissions.error;

  const ov = overview.data;
  const subm = submissions.data;
  const clicks = clicksByType.data ?? [];
  const clicksMax = Math.max(1, ...clicks.map((c) => c.count));

  return (
    <div
      className="business-analytics-dashboard -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6"
      data-theme={resolvedTheme}
    >
      {/* Sticky filter bar */}
      <div
        className="sticky top-0 z-20 -mx-4 border-b px-4 py-3 sm:-mx-6 sm:px-6"
        style={{
          background:
            "color-mix(in oklab, var(--bg-canvas) 82%, transparent)",
          borderColor: "var(--border-default)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <FilterField label="Rango">
            <Select
              value={preset}
              onValueChange={(v) => setPreset(v as Preset)}
            >
              <SelectTrigger className="h-9 w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "today",
                    "7",
                    "30",
                    "90",
                    "mtd",
                    "year",
                    "all",
                    "custom",
                  ] as Preset[]
                ).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRESET_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          {preset === "custom" && (
            <>
              <FilterField label="Desde">
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-9"
                />
              </FilterField>
              <FilterField label="Hasta">
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-9"
                />
              </FilterField>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle mode={themeMode} onChange={setThemeMode} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="text-[11.5px]"
            style={{ color: "var(--text-muted)" }}
          >
            Mostrando datos{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {fromDate && toDate
                ? `${fmtDay(fromDate)} — ${fmtDay(toDate)}`
                : "de todo el histórico"}
            </strong>
          </span>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1440px] space-y-6">
        {isLoading ? (
          <SkeletonState />
        ) : error ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: "var(--status-critical)" }}
          >
            Error: {(error as Error).message}
          </div>
        ) : (
          <>
            {/* Narrative header */}
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
                <span
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  {(ov?.detailViews ?? 0).toLocaleString("es-PR")} vistas
                </span>{" "}
                a mercados con{" "}
                <span
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  {(ov?.engagementRate ?? 0).toFixed(1)}% de engagement
                </span>{" "}
                y{" "}
                <span
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  {((ov?.willAttend ?? 0) + (ov?.interested ?? 0)).toLocaleString(
                    "es-PR",
                  )}{" "}
                  intenciones
                </span>{" "}
                registradas en el período.
              </h2>
              <p
                className="mt-2 text-[13.5px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Panel operativo del directorio. Todo se actualiza según el
                rango de fechas seleccionado.
              </p>
            </div>

            {/* KPIs — Alcance */}
            <SectionDivider label="Alcance del directorio" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile
                label="Vistas del directorio"
                value={ov?.homeViews ?? 0}
                delay={0}
              />
              <KpiTile
                label="Vistas de detalle"
                value={ov?.detailViews ?? 0}
                delay={60}
              />
              <KpiTile
                label="Clics en cómo llegar"
                value={ov?.directionsClicks ?? 0}
                delay={120}
              />
              <KpiTile
                label="Engagement"
                value={ov?.engagementRate ?? 0}
                suffix="%"
                chip={{ text: "detalle / directorio", tone: "accent" }}
                delay={180}
              />
            </div>

            {/* KPIs — Interacción */}
            <SectionDivider label="Interacción con organizadores" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile label="Clics Teléfono" value={ov?.clickPhone ?? 0} />
              <KpiTile label="Clics Email" value={ov?.clickEmail ?? 0} delay={60} />
              <KpiTile
                label="Clics Instagram"
                value={ov?.clickInstagram ?? 0}
                delay={120}
              />
              <KpiTile
                label="Clics URL Contacto"
                value={ov?.clickContact ?? 0}
                delay={180}
              />
            </div>

            {/* KPIs — Intención & estado */}
            <SectionDivider label="Intención y estado del catálogo" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile
                label="¡Voy a ir!"
                value={ov?.willAttend ?? 0}
                chip={{ text: "alta intención", tone: "good" }}
              />
              <KpiTile
                label="Me interesa"
                value={ov?.interested ?? 0}
                delay={60}
              />
              <div className="ba-card ba-enter" style={{ animationDelay: "120ms" }}>
                <div
                  className="text-[11.5px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Mercados activos / inactivos
                </div>
                <div
                  className="mt-2 text-[38px] font-bold leading-none tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {ov?.activeMarkets ?? 0}{" "}
                  <span
                    style={{ color: "var(--text-muted)", fontSize: 28 }}
                  >
                    / {ov?.inactiveMarkets ?? 0}
                  </span>
                </div>
                <div className="mt-3">
                  <span
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: "var(--status-good-bg)",
                      color: "var(--status-good)",
                    }}
                  >
                    {ov?.activeMarkets ?? 0} publicados
                  </span>
                </div>
              </div>
              <KpiTile
                label="Submissions pendientes"
                value={ov?.pendingSubmissions ?? 0}
                chip={
                  (ov?.pendingSubmissions ?? 0) > 0
                    ? { text: "requieren revisión", tone: "warning" }
                    : { text: "cola al día", tone: "good" }
                }
                delay={180}
              />
            </div>

            {/* Top Mercados */}
            <SectionDivider label="Rendimiento por mercado" />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Card
                  title="Top 10 mercados por vistas"
                  subtitle="Ranking de mercados con mayor tráfico en el período"
                  n={topMarkets.data?.length ?? 0}
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
                >
                  <TopMarketsTable rows={topMarkets.data ?? []} />
                </Card>
              </div>
              <div className="lg:col-span-4">
                <Card
                  title="Top organizadores"
                  subtitle="Quiénes tienen más tracción"
                  n={topOrg.data?.length ?? 0}
                  action={
                    <CsvButton
                      disabled={!topOrg.data?.length}
                      onClick={() =>
                        downloadCSV(
                          "top-organizadores.csv",
                          topOrg.data ?? [],
                        )
                      }
                    />
                  }
                  delay={80}
                >
                  <TopOrganizersList rows={topOrg.data ?? []} />
                </Card>
              </div>
            </div>

            {/* Clicks + Distribución */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Card
                  title="Clicks por tipo"
                  subtitle="Qué acciones toman los visitantes"
                  n={clicks.reduce((s, c) => s + c.count, 0)}
                  action={
                    <CsvButton
                      disabled={!clicks.length}
                      onClick={() =>
                        downloadCSV(
                          "clicks-por-tipo.csv",
                          clicks.map((r) => ({
                            tipo: r.label,
                            total: r.count,
                          })),
                        )
                      }
                    />
                  }
                >
                  {clicks.length === 0 ? (
                    <EmptyLine />
                  ) : (
                    <ul className="space-y-3">
                      {clicks.map((c, i) => {
                        const pct = (c.count / clicksMax) * 100;
                        return (
                          <li key={c.label} className="space-y-1.5">
                            <div className="flex items-baseline justify-between text-[12.5px]">
                              <span style={{ color: "var(--text-secondary)" }}>
                                {c.label}
                              </span>
                              <span
                                className="font-bold tabular-nums"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {c.count.toLocaleString("es-PR")}
                              </span>
                            </div>
                            <div
                              className="relative h-[7px] rounded-full"
                              style={{ background: "var(--gridline)" }}
                            >
                              <div
                                className="ba-funnel-fill absolute inset-y-0 left-0 rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: CAT[i % CAT.length],
                                  animationDelay: `${i * 60}ms`,
                                }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>
              </div>
              <div className="lg:col-span-7">
                <Card
                  title="Distribución del catálogo"
                  subtitle="Por categoría y por región"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <PieBlock
                      title="Por categoría"
                      data={dist.data?.byCategory ?? []}
                    />
                    <PieBlock
                      title="Por región"
                      data={dist.data?.byRegion ?? []}
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* Tráfico diario + Fuentes */}
            <SectionDivider label="Tráfico y adquisición" />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Card
                  title="Tráfico diario"
                  subtitle="Vistas por día en el período"
                  n={(traffic.data ?? []).reduce(
                    (s: number, d: any) => s + (d.views ?? 0),
                    0,
                  )}
                >
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart
                        data={traffic.data ?? []}
                        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="rm-traffic"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--accent)"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--accent)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--gridline)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: 11,
                            fill: "var(--text-secondary)",
                          }}
                          axisLine={{ stroke: "var(--border-default)" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "var(--text-secondary)",
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<BaTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="views"
                          name="Vistas"
                          stroke="var(--accent)"
                          strokeWidth={2}
                          fill="url(#rm-traffic)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-5">
                <Card
                  title="Fuentes de tráfico"
                  subtitle="De dónde llegan los visitantes"
                  action={
                    <CsvButton
                      disabled={!trafficSources.data?.topReferrers?.length}
                      onClick={() =>
                        downloadCSV(
                          "fuentes-trafico.csv",
                          (trafficSources.data?.topReferrers ?? []).map(
                            (r) => ({
                              referrer: r.host,
                              categoria: r.category,
                              visitas: r.count,
                            }),
                          ),
                        )
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-52">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={trafficSources.data?.byCategory ?? []}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            stroke="var(--bg-surface)"
                            strokeWidth={2}
                          >
                            {(trafficSources.data?.byCategory ?? []).map(
                              (_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip content={<BaTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="space-y-1.5 text-[12px]">
                      {(trafficSources.data?.topReferrers ?? [])
                        .slice(0, 8)
                        .map((r, i) => (
                          <li
                            key={r.host}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-[3px]"
                              style={{
                                background:
                                  PIE_COLORS[i % PIE_COLORS.length],
                              }}
                              aria-hidden
                            />
                            <span
                              className="flex-1 truncate"
                              style={{ color: "var(--text-secondary)" }}
                              title={r.host}
                            >
                              {truncate(r.host, 22)}
                            </span>
                            <span
                              className="font-bold tabular-nums"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {r.count}
                            </span>
                          </li>
                        ))}
                      {(trafficSources.data?.topReferrers ?? []).length ===
                        0 && <EmptyLine />}
                    </ul>
                  </div>
                </Card>
              </div>
            </div>

            {/* Actividad por página + Submissions */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Card
                  title="Actividad por página"
                  subtitle="Vistas por ruta del sitio"
                  n={pageActivity.data?.length ?? 0}
                  action={
                    <CsvButton
                      disabled={!pageActivity.data?.length}
                      onClick={() =>
                        downloadCSV(
                          "actividad-paginas.csv",
                          pageActivity.data ?? [],
                        )
                      }
                    />
                  }
                >
                  <div className="max-h-80 overflow-y-auto">
                    <TableSimple
                      head={["Página", "Vistas"]}
                      rows={(pageActivity.data ?? []).map((r) => [
                        r.page,
                        r.views.toLocaleString("es-PR"),
                      ])}
                      alignRight={[false, true]}
                    />
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-7">
                <Card
                  title="Submissions de mercados"
                  subtitle={`Total en el período: ${subm?.total ?? 0}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="warning">
                        Pendientes · {subm?.pending ?? 0}
                      </StatusBadge>
                      <StatusBadge tone="good">
                        Aprobadas · {subm?.approved ?? 0}
                      </StatusBadge>
                      <StatusBadge tone="critical">
                        Rechazadas · {subm?.rejected ?? 0}
                      </StatusBadge>
                    </div>
                  }
                >
                  <SubmissionsTable rows={subm?.recent ?? []} />
                </Card>
              </div>
            </div>

            {/* Servicios */}
            <SectionDivider label="Servicios e instalaciones" />
            <Card
              title="Distribución de servicios"
              subtitle={`Datos declarados en ${amenities.data?.totalActive ?? 0} mercados activos`}
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
            >
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
                {(amenities.data?.groups ?? []).map((g) => (
                  <div key={g.key} className="space-y-3">
                    <div
                      className="flex items-baseline justify-between border-b pb-2"
                      style={{ borderColor: "var(--border-default)" }}
                    >
                      <h4
                        className="text-[12px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {g.label}
                      </h4>
                      <span
                        className="text-[11px] tabular-nums"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {g.withData}/{g.total}
                      </span>
                    </div>
                    {g.options.length === 0 ? (
                      <EmptyLine />
                    ) : (
                      <ul className="space-y-2.5">
                        {g.options.map((o, i) => (
                          <li key={o.value} className="space-y-1">
                            <div className="flex items-baseline justify-between gap-3 text-[12px]">
                              <span
                                className="truncate"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {o.value}
                              </span>
                              <span
                                className="tabular-nums shrink-0"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <span className="font-bold">{o.count}</span>
                                <span
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {" "}
                                  · {o.percent.toFixed(0)}%
                                </span>
                              </span>
                            </div>
                            <div
                              className="relative h-[6px] rounded-full"
                              style={{ background: "var(--gridline)" }}
                            >
                              <div
                                className="ba-funnel-fill absolute inset-y-0 left-0 rounded-full"
                                style={{
                                  width: `${Math.min(100, o.percent)}%`,
                                  background: SEQ[i % SEQ.length],
                                  animationDelay: `${i * 50}ms`,
                                }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Intención de asistencia */}
            <SectionDivider label="Intención de asistencia" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile
                label="¡Voy a ir!"
                value={attMetrics.data?.willAttend ?? 0}
                chip={{ text: "alta intención", tone: "good" }}
              />
              <KpiTile
                label="Me interesa"
                value={attMetrics.data?.interested ?? 0}
                delay={60}
              />
              <KpiTile
                label="Tasa de intención"
                value={attMetrics.data?.intentionRate ?? 0}
                suffix="%"
                chip={{ text: "sobre visitantes", tone: "accent" }}
                delay={120}
              />
              <KpiTile
                label="Visitantes únicos"
                value={attMetrics.data?.uniqueVisitors ?? 0}
                delay={180}
              />
            </div>

            <Card
              title="Top 10 mercados por intención"
              subtitle="Expande cada fila para ver el detalle diario"
              n={attTop.data?.length ?? 0}
              action={
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
              }
            >
              <IntentionTable
                rows={attTop.data ?? []}
                expandedId={expandedId}
                onToggle={(id) =>
                  setExpandedId(expandedId === id ? null : id)
                }
                detail={attDetail.data}
                detailLoading={attDetail.isLoading || attDetail.isFetching}
              />
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card
                title="Intención por mercado"
                subtitle="Voy a ir vs. Me interesa (top 10)"
              >
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart
                      data={attTop.data ?? []}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--gridline)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: "var(--text-secondary)",
                        }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={70}
                        axisLine={{ stroke: "var(--border-default)" }}
                        tickLine={false}
                        tickFormatter={(v: string) => truncate(v, 12)}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "var(--text-secondary)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<BaTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="willAttend"
                        name="Voy a ir"
                        stackId="a"
                        fill="var(--accent)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="interested"
                        name="Me interesa"
                        stackId="a"
                        fill="var(--seq-700)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card title="Intenciones por día" subtitle="Evolución diaria">
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart
                      data={attDaily.data ?? []}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--gridline)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 11,
                          fill: "var(--text-secondary)",
                        }}
                        axisLine={{ stroke: "var(--border-default)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "var(--text-secondary)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<BaTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="willAttend"
                        name="Voy a ir"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="interested"
                        name="Me interesa"
                        stroke="var(--seq-700)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </>
        )}
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
        style={{
          color: "var(--text-muted)",
          letterSpacing: "0.09em",
        }}
      >
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{ background: "var(--border-default)" }}
      />
    </div>
  );
}

/* ============================================================== */
/*  Table primitives                                               */
/* ============================================================== */

function TableSimple({
  head,
  rows,
  alignRight,
}: {
  head: string[];
  rows: (string | ReactNode)[][];
  alignRight?: boolean[];
}) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr
          style={{
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          {head.map((h, i) => (
            <th
              key={h}
              className="py-2 text-[10.5px] font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                textAlign: alignRight?.[i] ? "right" : "left",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={head.length}
              className="py-6 text-center text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              Sin datos en este período
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={
                    alignRight?.[j]
                      ? "py-2.5 text-right font-semibold tabular-nums"
                      : "py-2.5"
                  }
                >
                  {c}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function TopMarketsTable({
  rows,
}: {
  rows: {
    id: string;
    rank: number;
    name: string;
    views: number;
    clickPhone: number;
    clickEmail: number;
    directionsClicks: number;
    clickContact: number;
    willAttend: number;
    interested: number;
    recurrenceType: string;
  }[];
}) {
  if (rows.length === 0) return <EmptyLine />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            {[
              "#",
              "Mercado",
              "Vistas",
              "Tel",
              "Email",
              "Dir",
              "Contacto",
              "Iré",
              "Interés",
              "Recurrencia",
            ].map((h, i) => (
              <th
                key={h}
                className="py-2 text-[10.5px] font-semibold uppercase tracking-wider"
                style={{ textAlign: i >= 2 && i <= 8 ? "right" : "left" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr
              key={m.id}
              style={{
                borderBottom: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <td
                className="py-2.5 tabular-nums"
                style={{ color: "var(--text-muted)" }}
              >
                {String(m.rank).padStart(2, "0")}
              </td>
              <td className="py-2.5 font-semibold">{m.name}</td>
              <td className="py-2.5 text-right font-bold tabular-nums">
                {m.views}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.clickPhone}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.clickEmail}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.directionsClicks}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.clickContact}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.willAttend}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {m.interested}
              </td>
              <td
                className="py-2.5 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                {recurrenceLabel(m.recurrenceType)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopOrganizersList({
  rows,
}: {
  rows: {
    organizer: string;
    markets: number;
    views: number;
    clicks: number;
  }[];
}) {
  if (rows.length === 0) return <EmptyLine />;
  return (
    <ol className="space-y-1">
      {rows.slice(0, 10).map((o, i) => (
        <li
          key={o.organizer}
          className="grid items-baseline gap-3 py-2 text-[13px]"
          style={{
            gridTemplateColumns: "24px 1fr auto",
            borderTop:
              i === 0 ? "none" : "1px solid var(--border-default)",
          }}
        >
          <span
            className="tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {i + 1}.
          </span>
          <div className="min-w-0">
            <div
              className="truncate font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {o.organizer}
            </div>
            <div
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {o.markets} mercado{o.markets === 1 ? "" : "s"} · {o.clicks}{" "}
              clics
            </div>
          </div>
          <span
            className="font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {o.views}
          </span>
        </li>
      ))}
    </ol>
  );
}

function SubmissionsTable({
  rows,
}: {
  rows: {
    id: string;
    name: string;
    municipality: string;
    status: string;
    created_at: string;
  }[];
}) {
  if (rows.length === 0) return <EmptyLine />;
  return (
    <div className="max-h-80 overflow-y-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            {["Nombre", "Municipio", "Fecha", "Estado"].map((h) => (
              <th
                key={h}
                className="py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              style={{
                borderBottom: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <td className="py-2.5 font-semibold">{s.name}</td>
              <td
                className="py-2.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.municipality}
              </td>
              <td
                className="py-2.5 tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {fmtDay(new Date(s.created_at))}
              </td>
              <td className="py-2.5">
                <StatusBadge
                  tone={
                    s.status === "pending"
                      ? "warning"
                      : s.status === "approved"
                        ? "good"
                        : "critical"
                  }
                >
                  {s.status === "pending"
                    ? "Pendiente"
                    : s.status === "approved"
                      ? "Aprobado"
                      : "Rechazado"}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================== */
/*  Intention table                                                */
/* ============================================================== */

type DetailData = {
  market: {
    id: string;
    name: string;
    category: string;
    municipality: string;
    view_count: number | null;
  };
  willAttend: number;
  interested: number;
  total: number;
  detailViews: number;
  uniqueVisitors: number;
  intentionRate: number;
  daily: { date: string; willAttend: number; interested: number }[];
};

function IntentionTable({
  rows,
  expandedId,
  onToggle,
  detail,
  detailLoading,
}: {
  rows: {
    id: string;
    rank: number;
    name: string;
    category: string;
    municipality: string;
    willAttend: number;
    interested: number;
    total: number;
    detailViews: number;
    intentionRate: number;
  }[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  detail: DetailData | undefined;
  detailLoading: boolean;
}) {
  if (rows.length === 0) return <EmptyLine label="Aún no hay intenciones registradas" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            {[
              "#",
              "Mercado",
              "Categoría",
              "Municipio",
              "Voy a ir",
              "Me interesa",
              "Total",
              "Vistas",
              "Tasa",
            ].map((h, i) => (
              <th
                key={h}
                className="py-2 text-[10.5px] font-semibold uppercase tracking-wider"
                style={{ textAlign: i >= 4 ? "right" : "left" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <Fragment key={r.id}>
                <tr
                  id={`intention-row-${r.id}`}
                  style={{
                    borderBottom: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    background: isExpanded
                      ? "var(--bg-surface-subtle)"
                      : "transparent",
                  }}
                >
                  <td
                    className="py-2.5 tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {String(r.rank).padStart(2, "0")}
                  </td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => onToggle(r.id)}
                      className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      {r.name}
                    </button>
                  </td>
                  <td className="py-2.5">
                    <StatusBadge tone="neutral">{r.category}</StatusBadge>
                  </td>
                  <td
                    className="py-2.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {r.municipality}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {r.willAttend}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {r.interested}
                  </td>
                  <td className="py-2.5 text-right font-bold tabular-nums">
                    {r.total}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {r.detailViews}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {r.intentionRate.toFixed(1)}%
                  </td>
                </tr>
                {isExpanded && (
                  <tr style={{ background: "var(--bg-surface-subtle)" }}>
                    <td colSpan={9} className="p-0">
                      <IntentionDetailPanel
                        loading={detailLoading}
                        data={
                          detail && detail.market.id === r.id
                            ? detail
                            : null
                        }
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IntentionDetailPanel({
  loading,
  data,
}: {
  loading: boolean;
  data: DetailData | null;
}) {
  if (loading || !data) {
    return (
      <div
        className="p-6 text-[12px]"
        style={{ color: "var(--text-muted)" }}
      >
        Cargando detalle…
      </div>
    );
  }
  const donutData = [
    { name: "Voy a ir", value: data.willAttend },
    { name: "Me interesa", value: data.interested },
  ];
  return (
    <div
      className="space-y-5 p-5"
      style={{ borderTop: "1px solid var(--border-default)" }}
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <h4
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {data.market.name}
        </h4>
        <StatusBadge tone="neutral">{data.market.category}</StatusBadge>
        <StatusBadge tone="neutral">{data.market.municipality}</StatusBadge>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          label="Visitantes únicos"
          value={data.uniqueVisitors}
        />
        <KpiTile
          label="Vistas de detalle"
          value={data.detailViews}
          delay={60}
        />
        <KpiTile label="Total intenciones" value={data.total} delay={120} />
        <KpiTile
          label="Tasa de conversión"
          value={data.intentionRate}
          suffix="%"
          chip={{ text: "conversión", tone: "accent" }}
          delay={180}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Proporción
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                >
                  <Cell fill="var(--accent)" />
                  <Cell fill="var(--seq-700)" />
                </Pie>
                <Tooltip content={<BaTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Últimos 30 días
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart
                data={data.daily}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--gridline)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  axisLine={{ stroke: "var(--border-default)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BaTooltip />} />
                <Line
                  type="monotone"
                  dataKey="willAttend"
                  name="Voy a ir"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="interested"
                  name="Me interesa"
                  stroke="var(--seq-700)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Link
        to="/admin/markets"
        className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
        style={{ color: "var(--accent)" }}
      >
        Ver en gestión de mercados →
      </Link>
    </div>
  );
}

/* ============================================================== */
/*  Pie block                                                      */
/* ============================================================== */

function PieBlock({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div>
      <div
        className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              stroke="var(--bg-surface)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<BaTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ============================================================== */
/*  Empty + skeleton                                               */
/* ============================================================== */

function EmptyLine({
  label = "Sin datos en este período",
}: {
  label?: string;
}) {
  return (
    <p
      className="py-6 text-center text-[12px]"
      style={{ color: "var(--text-muted)" }}
    >
      {label}
    </p>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-6">
      <div
        className="h-16 rounded-lg animate-pulse"
        style={{ background: "var(--bg-surface-subtle)" }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[136px] rounded-lg border animate-pulse"
            style={{
              background: "var(--bg-surface-subtle)",
              borderColor: "var(--border-default)",
            }}
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div
          className="h-72 rounded-lg border animate-pulse lg:col-span-8"
          style={{
            background: "var(--bg-surface-subtle)",
            borderColor: "var(--border-default)",
          }}
        />
        <div
          className="h-72 rounded-lg border animate-pulse lg:col-span-4"
          style={{
            background: "var(--bg-surface-subtle)",
            borderColor: "var(--border-default)",
          }}
        />
      </div>
    </div>
  );
}
