import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Store, Eye, CalendarDays, MousePointerClick, Users, Link2 } from "lucide-react";
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
} from "recharts";
import {
  getDashboardMetrics,
  getViewsPerMarket,
  getClicksPerDay,
  getUpcomingMarkets,
  getAttendanceMetrics,
  getTopMarketsByIntention,
  getShortUrlClicks,
} from "@/lib/admin-analytics.functions";
import { MetricCard } from "@/components/admin/MetricCard";
import { formatDateEs } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const metricsFn = useServerFn(getDashboardMetrics);
  const viewsFn = useServerFn(getViewsPerMarket);
  const clicksFn = useServerFn(getClicksPerDay);
  const upcomingFn = useServerFn(getUpcomingMarkets);
  const attendanceFn = useServerFn(getAttendanceMetrics);
  const topIntentionFn = useServerFn(getTopMarketsByIntention);
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

  const metrics = useQuery({
    queryKey: ["admin", "dashboard", "metrics"],
    queryFn: () => logFetch("dashboard metrics", () => metricsFn()),
  });
  const views = useQuery({
    queryKey: ["admin", "dashboard", "views"],
    queryFn: () => logFetch("dashboard views", () => viewsFn()),
  });
  const clicks = useQuery({
    queryKey: ["admin", "dashboard", "clicks"],
    queryFn: () => logFetch("dashboard clicks", () => clicksFn({ data: { days: 30 } })),
  });
  const upcoming = useQuery({
    queryKey: ["admin", "dashboard", "upcoming"],
    queryFn: () => logFetch("dashboard upcoming", () => upcomingFn()),
  });
  const attendance = useQuery({
    queryKey: ["admin", "dashboard", "attendance"],
    queryFn: () => logFetch("dashboard attendance", () => attendanceFn({ data: {} })),
  });
  const topIntention = useQuery({
    queryKey: ["admin", "dashboard", "topIntention"],
    queryFn: () => logFetch("dashboard topIntention", () => topIntentionFn({ data: { limit: 5 } })),
  });
  const shortUrlFn = useServerFn(getShortUrlClicks);
  const shortUrl = useQuery({
    queryKey: ["admin", "dashboard", "shortUrlClicks"],
    queryFn: () => logFetch("dashboard shortUrlClicks", () => shortUrlFn()),
  });

  const isLoading = metrics.isLoading || views.isLoading || clicks.isLoading || upcoming.isLoading || attendance.isLoading;
  const error = metrics.error ?? views.error ?? clicks.error ?? upcoming.error ?? attendance.error;

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">No se pudo cargar el dashboard: {error.message}</div>;
  }

  const metricsData = metrics.data;
  const viewsData = views.data ?? [];
  const clicksData = clicks.data ?? [];
  const upcomingData = upcoming.data ?? [];

  if (!metricsData) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Sin métricas disponibles.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <h1 className="font-display text-3xl text-[#18253f]">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de RutaMercado</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Mercados Activos" value={metricsData.activeMarkets} icon={Store} />
        <MetricCard label="Vistas Totales" value={metricsData.totalViews} icon={Eye} />
        <MetricCard label="Esta Semana" value={metricsData.upcomingThisWeek} icon={CalendarDays} />
        <MetricCard label="Clics Totales" value={metricsData.totalClicks} icon={MousePointerClick} />
        <MetricCard
          label="Intención de Asistencia"
          value={attendance.data?.total ?? 0}
          icon={Users}
          subtext={`${attendance.data?.willAttend ?? 0} van a ir · ${attendance.data?.interested ?? 0} interesados`}
        />
        <MetricCard
          label="Clics /navimarketath"
          value={shortUrl.data?.total ?? 0}
          icon={Link2}
          subtext={`${shortUrl.data?.last30Days ?? 0} en los últimos 30 días`}
        />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg text-[#18253f] mb-4">Top 5 mercados por intención</h2>
        {(topIntention.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay intenciones registradas</p>
        ) : (
          <ol className="space-y-2">
            {(topIntention.data ?? []).map((m) => (
              <li key={m.id} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground w-6">{m.rank}.</span>
                <Link
                  to="/admin/analytics"
                  search={{ market: m.id }}
                  className="font-medium text-[#18253f] hover:text-[#54b678] hover:underline"
                >
                  {m.name}
                </Link>
                <span className="text-muted-foreground">— {m.willAttend} van a ir · {m.interested} interesados</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg text-[#18253f] mb-4">Vistas por Mercado (Top 10)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#54b678" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg text-[#18253f] mb-4">Actividad de Clics (30 días)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={clicksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#18253f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg text-[#18253f] mb-4">Mercados Próximos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcomingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No hay mercados próximos
                </TableCell>
              </TableRow>
            ) : (
              upcomingData.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.nextDate ? formatDateEs(m.nextDate) : "—"}</TableCell>
                  <TableCell>{m.municipality}</TableCell>
                  <TableCell className="text-right">{m.view_count ?? 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
