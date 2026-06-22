import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, Fragment } from "react";
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
} from "@/lib/admin-analytics.functions";
import { downloadCSV } from "@/lib/csv";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AnalyticsSearch = { market?: string };

export const Route = createFileRoute("/_admin/admin/analytics")({
  validateSearch: (search: Record<string, unknown>): AnalyticsSearch => ({
    market: typeof search.market === "string" ? search.market : undefined,
  }),
  component: AnalyticsPage,
});

const COLORS = ["#54b678", "#18253f", "#22C55E", "#0ea5e9", "#a855f7", "#ef4444", "#f59e0b"];

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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
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
            <Button variant="outline" className={cn("justify-start text-left font-normal", !customFrom && "text-muted-foreground")}>
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
        document.getElementById(`intention-row-${marketFromUrl}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  const logFetch = async <T,>(label: string, fetcher: () => Promise<T>) => {
    try {
      const result = await fetcher();
      return result;
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

  const isLoading =
    overview.isLoading || topMarkets.isLoading || topOrg.isLoading || dist.isLoading ||
    traffic.isLoading || attMetrics.isLoading || attTop.isLoading || attDaily.isLoading ||
    clicksByType.isLoading || trafficSources.isLoading || pageActivity.isLoading || submissions.isLoading;
  const error =
    overview.error ?? topMarkets.error ?? topOrg.error ?? dist.error ?? traffic.error ??
    attMetrics.error ?? attTop.error ?? attDaily.error ?? clicksByType.error ??
    trafficSources.error ?? pageActivity.error ?? submissions.error;

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando analíticas...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar las analíticas: {error.message}</div>;
  }

  const ov = overview.data;
  const subm = submissions.data;

  return (
    <div className="space-y-6 max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Analíticas</h1>
          <p className="text-sm text-muted-foreground">
            {fmtDay(from)} – {fmtDay(to)}
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

      {/* Summary metrics - row 1: traffic + engagement */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Vistas Directorio" value={ov?.homeViews ?? 0} />
        <Metric label="Vistas de Detalle" value={ov?.detailViews ?? 0} />
        <Metric label="Cómo llegar" value={ov?.directionsClicks ?? 0} />
        <Metric label="Engagement" value={`${(ov?.engagementRate ?? 0).toFixed(1)}%`} />
      </div>

      {/* Summary metrics - row 2: contact breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Clics Teléfono" value={ov?.clickPhone ?? 0} />
        <Metric label="Clics Email" value={ov?.clickEmail ?? 0} />
        <Metric label="Clics Instagram" value={ov?.clickInstagram ?? 0} />
        <Metric label="Clics URL Contacto" value={ov?.clickContact ?? 0} />
      </div>

      {/* Summary metrics - row 3: intentions + markets state + submissions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="¡Voy a ir!" value={ov?.willAttend ?? 0} />
        <Metric label="Me interesa" value={ov?.interested ?? 0} />
        <Metric
          label="Mercados activos / inactivos"
          value={`${ov?.activeMarkets ?? 0} / ${ov?.inactiveMarkets ?? 0}`}
        />
        <Metric label="Submissions pendientes" value={ov?.pendingSubmissions ?? 0} />
      </div>

      {/* Top Mercados */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#18253f]">Top 10 Mercados por Vistas</h2>
          <Button
            variant="outline"
            size="sm"
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
            disabled={!topMarkets.data?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead className="text-right">Vistas</TableHead>
                <TableHead className="text-right">Tel</TableHead>
                <TableHead className="text-right">Email</TableHead>
                <TableHead className="text-right">Direcciones</TableHead>
                <TableHead className="text-right">Contacto</TableHead>
                <TableHead className="text-right">Iré</TableHead>
                <TableHead className="text-right">Me interesa</TableHead>
                <TableHead>Recurrencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(topMarkets.data ?? []).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.rank}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-right">{m.views}</TableCell>
                  <TableCell className="text-right">{m.clickPhone}</TableCell>
                  <TableCell className="text-right">{m.clickEmail}</TableCell>
                  <TableCell className="text-right">{m.directionsClicks}</TableCell>
                  <TableCell className="text-right">{m.clickContact}</TableCell>
                  <TableCell className="text-right">{m.willAttend}</TableCell>
                  <TableCell className="text-right">{m.interested}</TableCell>
                  <TableCell>{recurrenceLabel(m.recurrenceType)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Top Organizadores */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#18253f]">Top Organizadores</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV("top-organizadores.csv", topOrg.data ?? [])}
            disabled={!topOrg.data?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organizador</TableHead>
              <TableHead className="text-right">Mercados</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead className="text-right">Clics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(topOrg.data ?? []).map((o) => (
              <TableRow key={o.organizer}>
                <TableCell className="font-medium">{o.organizer}</TableCell>
                <TableCell className="text-right">{o.markets}</TableCell>
                <TableCell className="text-right">{o.views}</TableCell>
                <TableCell className="text-right">{o.clicks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Clicks por Tipo */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#18253f]">Análisis de Clicks por Tipo</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCSV(
                "clicks-por-tipo.csv",
                (clicksByType.data ?? []).map((r) => ({ tipo: r.label, total: r.count })),
              )
            }
            disabled={!clicksByType.data?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={clicksByType.data ?? []} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Clics" fill="#54b678" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Distribución por Categoría">
          <PieChart>
            <Pie data={dist.data?.byCategory ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {(dist.data?.byCategory ?? []).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard title="Distribución por Región">
          <PieChart>
            <Pie data={dist.data?.byRegion ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {(dist.data?.byRegion ?? []).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>

      {/* Tráfico diario */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg text-[#18253f] mb-4">Tráfico Diario</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={traffic.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#54b678" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fuentes de Tráfico */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#18253f]">Fuentes de Tráfico</h2>
          <Button
            variant="outline"
            size="sm"
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
            disabled={!trafficSources.data?.topReferrers?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
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
                  label
                >
                  {(trafficSources.data?.byCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(trafficSources.data?.topReferrers ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      Sin datos en este período
                    </TableCell>
                  </TableRow>
                ) : (
                  (trafficSources.data?.topReferrers ?? []).map((r) => (
                    <TableRow key={r.host}>
                      <TableCell className="font-medium">{truncate(r.host, 40)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#54b678]/15 text-[#18253f] border-0">
                          {r.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{r.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Actividad por Página */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#18253f]">Actividad por Página</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV("actividad-paginas.csv", pageActivity.data ?? [])}
            disabled={!pageActivity.data?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead className="text-right">Visitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pageActivity.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    Sin datos en este período
                  </TableCell>
                </TableRow>
              ) : (
                (pageActivity.data ?? []).map((r) => (
                  <TableRow key={r.page}>
                    <TableCell className="font-medium">{r.page}</TableCell>
                    <TableCell className="text-right">{r.views}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Submissions de Mercados */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-lg text-[#18253f]">Submissions de Mercados</h2>
            <p className="text-sm text-muted-foreground">Total en el período: {subm?.total ?? 0}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-0">
              Pendientes: {subm?.pending ?? 0}
            </Badge>
            <Badge variant="secondary" className="bg-[#54b678]/15 text-[#18253f] border-0">
              Aprobadas: {subm?.approved ?? 0}
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-900 border-0">
              Rechazadas: {subm?.rejected ?? 0}
            </Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(subm?.recent ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  Sin submissions en este período
                </TableCell>
              </TableRow>
            ) : (
              (subm?.recent ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.municipality}</TableCell>
                  <TableCell>{fmtDay(new Date(s.created_at))}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-0",
                        s.status === "pending" && "bg-amber-100 text-amber-900",
                        s.status === "approved" && "bg-[#54b678]/15 text-[#18253f]",
                        s.status === "rejected" && "bg-red-100 text-red-900",
                      )}
                    >
                      {s.status === "pending" ? "Pendiente" : s.status === "approved" ? "Aprobado" : "Rechazado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Attendance Intention */}
      <div className="space-y-6 pt-2">
        <div>
          <h2 className="font-display text-2xl text-[#18253f]">Intención de Asistencia</h2>
          <p className="text-sm text-muted-foreground">Interés expresado por los visitantes</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="¡Voy a ir!" value={attMetrics.data?.willAttend ?? 0} />
          <Metric label="Me interesa" value={attMetrics.data?.interested ?? 0} />
          <Metric label="Tasa de intención" value={`${(attMetrics.data?.intentionRate ?? 0).toFixed(1)}%`} />
          <Metric label="Visitantes únicos" value={attMetrics.data?.uniqueVisitors ?? 0} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-[#18253f]">Top 10 Mercados por Intención de Asistencia</h2>
            <Button
              variant="outline"
              size="sm"
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
              disabled={!attAll.data?.length}
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead className="text-right">Voy a ir</TableHead>
                <TableHead className="text-right">Me interesa</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Vistas</TableHead>
                <TableHead className="text-right">Tasa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(attTop.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                    Aún no hay intenciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                (attTop.data ?? []).map((r) => {
                  const isExpanded = expandedId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <TableRow key={r.id} id={`intention-row-${r.id}`} className={isExpanded ? "bg-[#54b678]/5" : undefined}>
                        <TableCell>{r.rank}</TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            className="inline-flex items-center gap-1 font-medium text-[#18253f] hover:text-[#54b678] hover:underline"
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {r.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-[#54b678]/15 text-[#18253f] border-0">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.municipality}</TableCell>
                        <TableCell className="text-right">{r.willAttend}</TableCell>
                        <TableCell className="text-right">{r.interested}</TableCell>
                        <TableCell className="text-right font-medium">{r.total}</TableCell>
                        <TableCell className="text-right">{r.detailViews}</TableCell>
                        <TableCell className="text-right">{r.intentionRate.toFixed(1)}%</TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${r.id}-detail`} className="bg-[#54b678]/5 hover:bg-[#54b678]/5">
                          <TableCell colSpan={9} className="p-0">
                            <IntentionDetailPanel
                              loading={attDetail.isLoading || attDetail.isFetching}
                              data={attDetail.data && attDetail.data.market.id === r.id ? attDetail.data : null}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg text-[#18253f] mb-4">Intención por Mercado</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={attTop.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    tickFormatter={(v: string) => truncate(v, 14)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const row = payload[0].payload as {
                        name: string;
                        willAttend: number;
                        interested: number;
                        total: number;
                      };
                      return (
                        <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
                          <div className="font-medium text-[#18253f] mb-1">{row.name}</div>
                          <div className="text-muted-foreground">
                            {row.willAttend} van a ir · {row.interested} interesados · {row.total} total
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="willAttend" name="Voy a ir" stackId="a" fill="#54b678" />
                  <Bar dataKey="interested" name="Me interesa" stackId="a" fill="#FEF3C7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg text-[#18253f] mb-4">Intenciones por Día</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={attDaily.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="willAttend" name="Voy a ir" stroke="#54b678" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="interested" name="Me interesa" stroke="#6B7280" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="font-display text-2xl text-[#18253f]">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="font-display text-lg text-[#18253f] mb-4">{title}</h2>
      <div className="h-72">
        <ResponsiveContainer>{children}</ResponsiveContainer>
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
    return <div className="p-6 text-sm text-muted-foreground">Cargando detalle...</div>;
  }
  const donutData = [
    { name: "Voy a ir", value: data.willAttend },
    { name: "Me interesa", value: data.interested },
  ];
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg text-[#18253f]">{data.market.name}</h3>
        <Badge variant="secondary" className="bg-[#54b678]/15 text-[#18253f] border-0">{data.market.category}</Badge>
        <Badge variant="outline">{data.market.municipality}</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Visitantes únicos" value={data.uniqueVisitors} />
        <Metric label="Vistas de detalle" value={data.detailViews} />
        <Metric label="Total intenciones" value={data.total} />
        <Metric label="Tasa de conversión" value={`${data.intentionRate.toFixed(1)}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h4 className="text-sm font-medium text-[#18253f] mb-2">Proporción</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                  <Cell fill="#54b678" />
                  <Cell fill="#FEF3C7" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h4 className="text-sm font-medium text-[#18253f] mb-2">Últimos 30 días</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="willAttend" name="Voy a ir" stroke="#54b678" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="interested" name="Me interesa" stroke="#6B7280" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div>
        <Link
          to="/admin/markets"
          className="text-xs text-[#54b678] hover:underline"
        >
          Ver en gestión de mercados →
        </Link>
      </div>
    </div>
  );
}
