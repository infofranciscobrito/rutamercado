import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Store, Eye, CalendarDays, MousePointerClick, Users } from "lucide-react";
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
    queryFn: () => logFetch("dashboard attendance", () => attendanceFn()),
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
        <h1 className="font-display text-3xl text-[#1c1e37]">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de RutaMercado</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Mercados Activos" value={metricsData.activeMarkets} icon={Store} />
        <MetricCard label="Vistas Totales" value={metricsData.totalViews} icon={Eye} />
        <MetricCard label="Esta Semana" value={metricsData.upcomingThisWeek} icon={CalendarDays} />
        <MetricCard label="Clics Totales" value={metricsData.totalClicks} icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg text-[#1c1e37] mb-4">Vistas por Mercado (Top 10)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#f8b625" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg text-[#1c1e37] mb-4">Actividad de Clics (30 días)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={clicksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#1c1e37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg text-[#1c1e37] mb-4">Mercados Próximos</h2>
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
