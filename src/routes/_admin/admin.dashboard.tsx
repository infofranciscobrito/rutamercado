import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Store, Eye, CalendarDays, MousePointerClick } from "lucide-react";
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

const metricsQO = queryOptions({
  queryKey: ["admin", "dashboard", "metrics"],
  queryFn: () => getDashboardMetrics(),
});
const viewsQO = queryOptions({
  queryKey: ["admin", "dashboard", "views"],
  queryFn: () => getViewsPerMarket(),
});
const clicksQO = queryOptions({
  queryKey: ["admin", "dashboard", "clicks"],
  queryFn: () => getClicksPerDay({ data: { days: 30 } }),
});
const upcomingQO = queryOptions({
  queryKey: ["admin", "dashboard", "upcoming"],
  queryFn: () => getUpcomingMarkets(),
});

export const Route = createFileRoute("/_admin/admin/dashboard")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(metricsQO),
      context.queryClient.ensureQueryData(viewsQO),
      context.queryClient.ensureQueryData(clicksQO),
      context.queryClient.ensureQueryData(upcomingQO),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: metrics } = useSuspenseQuery(metricsQO);
  const { data: views } = useSuspenseQuery(viewsQO);
  const { data: clicks } = useSuspenseQuery(clicksQO);
  const { data: upcoming } = useSuspenseQuery(upcomingQO);

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <h1 className="font-display text-3xl text-[#1c1e37]">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de RutaMercado</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Mercados Activos" value={metrics.activeMarkets} icon={Store} />
        <MetricCard label="Vistas Totales" value={metrics.totalViews} icon={Eye} />
        <MetricCard label="Esta Semana" value={metrics.upcomingThisWeek} icon={CalendarDays} />
        <MetricCard label="Clics Totales" value={metrics.totalClicks} icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg text-[#1c1e37] mb-4">Vistas por Mercado (Top 10)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={views}>
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
              <LineChart data={clicks}>
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
            {upcoming.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No hay mercados próximos
                </TableCell>
              </TableRow>
            ) : (
              upcoming.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{formatDateEs(m.event_date)}</TableCell>
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
