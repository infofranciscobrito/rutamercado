import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import {
  listNewsletterSubscribers,
  NEWSLETTER_SOURCE_LABELS,
} from "@/lib/newsletter.functions";
import { downloadCSV } from "@/lib/csv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "newsletter-subscribers"],
    queryFn: () => listFn(),
    refetchInterval: 60_000,
  });

  const exportCsv = () => {
    downloadCSV(
      `newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
      data.map((s) => ({
        email: s.email,
        origen: NEWSLETTER_SOURCE_LABELS[s.source] ?? s.source,
        mercado: s.market_slug ?? "",
        estado: s.status,
        fecha: new Date(s.created_at).toLocaleString("es-PR"),
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#18253f]">Newsletter</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {data.length} {data.length === 1 ? "suscriptor" : "suscriptores"}
          </p>
        </div>
        <Button
          onClick={exportCsv}
          disabled={data.length === 0}
          className="bg-[#54b678] font-semibold text-[#18253f] hover:bg-[#3f9560]"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {isLoading && <p className="text-sm text-[#6B7280]">Cargando...</p>}
      {error && (
        <p className="text-sm text-destructive">
          No se pudieron cargar los suscriptores.
        </p>
      )}

      {!isLoading && !error && (
        <div className="rounded-2xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#6B7280]">
                    Todavía no hay suscriptores.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-[#18253f]">
                      {s.email}
                    </TableCell>
                    <TableCell>
                      {NEWSLETTER_SOURCE_LABELS[s.source] ?? s.source}
                    </TableCell>
                    <TableCell>{s.market_slug ?? "—"}</TableCell>
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
      )}
    </div>
  );
}
