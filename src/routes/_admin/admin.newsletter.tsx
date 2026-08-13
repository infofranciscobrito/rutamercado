import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, Download, Mail, Users } from "lucide-react";
import {
  listNewsletterSubscribers,
  markNewsletterSubscribersSeen,
  NEWSLETTER_SOURCE_LABELS,
} from "@/lib/newsletter.functions";
import { downloadCSV } from "@/lib/csv";
import { MetricCard } from "@/components/admin/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_admin/admin/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  const listFn = useServerFn(listNewsletterSubscribers);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "newsletter-subscribers"],
    queryFn: () => listFn(),
    refetchInterval: 60_000,
  });

  const markSeenFn = useServerFn(markNewsletterSubscribersSeen);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!data) return;
    void markSeenFn().then(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletter", "recent-count"] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const subscribers = data?.subscribers ?? [];
  const stats = data?.stats ?? { totalActive: 0, last7Days: 0, last30Days: 0 };

  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? subscribers.filter((s) => s.email.toLowerCase().includes(q))
      : subscribers;
    return [...filtered].sort((a, b) => {
      const diff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDesc ? -diff : diff;
    });
  }, [subscribers, search, sortDesc]);

  const exportCsv = () => {
    downloadCSV(
      `newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
      subscribers.map((s) => ({
        email: s.email,
        origen: NEWSLETTER_SOURCE_LABELS[s.source] ?? s.source,
        mercado: s.market_name ?? "",
        fecha_suscripcion: new Date(s.created_at).toISOString().slice(0, 10),
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#18253f]">
            Suscriptores del newsletter
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Lista de correos capturados en el sitio.
          </p>
        </div>
        <Button
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="bg-[#54b678] font-semibold text-[#18253f] hover:bg-[#3f9560]"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Suscriptores activos"
          value={stats.totalActive}
          icon={Users}
        />
        <MetricCard
          label="Nuevos esta semana"
          value={stats.last7Days}
          icon={Mail}
          subtext="Últimos 7 días"
        />
        <MetricCard
          label="Nuevos este mes"
          value={stats.last30Days}
          icon={CalendarDays}
          subtext="Últimos 30 días"
        />
      </div>

      {isLoading && <p className="text-sm text-[#6B7280]">Cargando...</p>}
      {error && (
        <p className="text-sm text-destructive">
          No se pudieron cargar los suscriptores.
        </p>
      )}

      {!isLoading && !error && (
        <>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por correo..."
            className="max-w-sm"
            aria-label="Buscar por correo"
          />

          <div className="rounded-2xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Mercado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => setSortDesc((v) => !v)}
                      className="inline-flex items-center gap-1 hover:text-[#18253f]"
                    >
                      Fecha
                      {sortDesc ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUp className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[#6B7280]">
                      {subscribers.length === 0
                        ? "Todavía no hay suscriptores."
                        : "Ningún correo coincide con la búsqueda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-[#18253f]">
                        {s.email}
                      </TableCell>
                      <TableCell>
                        {NEWSLETTER_SOURCE_LABELS[s.source] ?? s.source}
                      </TableCell>
                      <TableCell>{s.market_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(s.created_at).toLocaleDateString("es-PR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
