import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download } from "lucide-react";
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
} from "@/lib/admin-analytics.functions";
import { downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_admin/admin/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["#f8b625", "#1c1e37", "#22C55E", "#0ea5e9", "#a855f7", "#ef4444"];

function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const overviewFn = useServerFn(getAnalyticsOverview);
  const topMarketsFn = useServerFn(getTopMarkets);
  const topOrgFn = useServerFn(getTopOrganizers);
  const distFn = useServerFn(getDistribution);
  const trafficFn = useServerFn(getDailyTraffic);
  const attMetricsFn = useServerFn(getAttendanceMetrics);
  const attTopFn = useServerFn(getTopMarketsByIntention);
  const attDailyFn = useServerFn(getIntentionsPerDay);
  const logFetch = async <T,>(label: string, fetcher: () => Promise<T>) => {
    console.log(`[Admin data] ${label}: fetch start`);
    try {
      const result = await fetcher();
      console.log(`[Admin data] ${label}: fetch success`, result);
      return result;
    } catch (err) {
      console.error(`[Admin data] ${label}: fetch error`, err);
      throw err;
    }
  };

  const overview = useQuery({
    queryKey: ["admin", "analytics", "overview", days],
    queryFn: () => logFetch("analytics overview", () => overviewFn({ data: { days } })),
  });
  const topMarkets = useQuery({
    queryKey: ["admin", "analytics", "topMarkets", days],
    queryFn: () => logFetch("analytics top markets", () => topMarketsFn({ data: { days } })),
  });
  const topOrg = useQuery({
    queryKey: ["admin", "analytics", "topOrg", days],
    queryFn: () => logFetch("analytics top organizers", () => topOrgFn({ data: { days } })),
  });
  const dist = useQuery({
    queryKey: ["admin", "analytics", "dist"],
    queryFn: () => logFetch("analytics distribution", () => distFn()),
  });
  const traffic = useQuery({
    queryKey: ["admin", "analytics", "traffic", days],
    queryFn: () => logFetch("analytics traffic", () => trafficFn({ data: { days } })),
  });
  const attMetrics = useQuery({
    queryKey: ["admin", "analytics", "attendance", "metrics"],
    queryFn: () => logFetch("analytics attendance metrics", () => attMetricsFn()),
  });
  const attTop = useQuery({
    queryKey: ["admin", "analytics", "attendance", "top"],
    queryFn: () => logFetch("analytics attendance top", () => attTopFn()),
  });
  const attDaily = useQuery({
    queryKey: ["admin", "analytics", "attendance", "daily", days],
    queryFn: () => logFetch("analytics attendance daily", () => attDailyFn({ data: { days } })),
  });

  const isLoading = overview.isLoading || topMarkets.isLoading || topOrg.isLoading || dist.isLoading || traffic.isLoading || attMetrics.isLoading || attTop.isLoading || attDaily.isLoading;
  const error = overview.error ?? topMarkets.error ?? topOrg.error ?? dist.error ?? traffic.error ?? attMetrics.error ?? attTop.error ?? attDaily.error;

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando analíticas...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar las analíticas: {error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#1c1e37]">Analíticas</h1>
          <p className="text-sm text-muted-foreground">Métricas de actividad y engagement</p>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Vistas Directorio" value={overview.data?.homeViews ?? 0} />
        <Metric label="Vistas de Detalle" value={overview.data?.detailViews ?? 0} />
        <Metric label="Clics Contacto" value={overview.data?.contactClicks ?? 0} />
        <Metric label="Clics Direcciones" value={overview.data?.directionsClicks ?? 0} />
        <Metric label="Engagement" value={`${(overview.data?.engagementRate ?? 0).toFixed(1)}%`} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#1c1e37]">Top 10 Mercados por Vistas</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV("top-mercados.csv", topMarkets.data ?? [])}
            disabled={!topMarkets.data?.length}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Mercado</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead className="text-right">Contacto</TableHead>
              <TableHead className="text-right">Direcciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(topMarkets.data ?? []).map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.rank}</TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-right">{m.views}</TableCell>
                <TableCell className="text-right">{m.contactClicks}</TableCell>
                <TableCell className="text-right">{m.directionsClicks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-[#1c1e37]">Top Organizadores</h2>
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

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg text-[#1c1e37] mb-4">Tráfico Diario</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={traffic.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#f8b625" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Intention */}
      <div className="space-y-6 pt-2">
        <div>
          <h2 className="font-display text-2xl text-[#1c1e37]">Intención de Asistencia</h2>
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
            <h2 className="font-display text-lg text-[#1c1e37]">Top 10 Mercados por Intención de Asistencia</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCSV(
                  "intencion-asistencia.csv",
                  (attTop.data ?? []).map((r) => ({
                    posicion: r.rank,
                    mercado: r.name,
                    voy_a_ir: r.willAttend,
                    me_interesa: r.interested,
                    total_intenciones: r.total,
                    tasa_intencion: `${r.intentionRate.toFixed(1)}%`,
                  })),
                )
              }
              disabled={!attTop.data?.length}
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead className="text-right">Voy a ir</TableHead>
                <TableHead className="text-right">Me interesa</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Tasa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(attTop.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    Aún no hay intenciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                (attTop.data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.rank}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">{r.willAttend}</TableCell>
                    <TableCell className="text-right">{r.interested}</TableCell>
                    <TableCell className="text-right">{r.total}</TableCell>
                    <TableCell className="text-right">{r.intentionRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg text-[#1c1e37] mb-4">Intención por Mercado</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={attTop.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="willAttend" name="Voy a ir" stackId="a" fill="#f8b625" />
                  <Bar dataKey="interested" name="Me interesa" stackId="a" fill="#FEF3C7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg text-[#1c1e37] mb-4">Intenciones por Día</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={attDaily.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="willAttend" name="Voy a ir" stroke="#f8b625" strokeWidth={2} dot={false} />
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
      <div className="font-display text-2xl text-[#1c1e37]">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="font-display text-lg text-[#1c1e37] mb-4">{title}</h2>
      <div className="h-72">
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
