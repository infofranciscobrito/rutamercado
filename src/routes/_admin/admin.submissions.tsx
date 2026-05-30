import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listSubmissions, type Submission } from "@/lib/submissions.functions";
import { formatDateEs } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubmissionReviewDrawer } from "@/components/admin/SubmissionReviewDrawer";

export const Route = createFileRoute("/_admin/admin/submissions")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const listSubmissionsFn = useServerFn(listSubmissions);
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "submissions"],
    queryFn: async () => {
      console.log("[Admin data] submissions: fetch start");
      try {
        const result = await listSubmissionsFn();
        console.log("[Admin data] submissions: fetch success", result);
        return result;
      } catch (err) {
        console.error("[Admin data] submissions: fetch error", err);
        throw err;
      }
    },
  });
  const [selected, setSelected] = useState<Submission | null>(null);

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando envíos...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar los envíos: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[#1c1e37]">Envíos</h1>
        <p className="mt-1 text-sm text-[#1c1e37]/60">
          Mercados enviados por la comunidad. Revisa, aprueba o rechaza.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mercado</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Organizador</TableHead>
              <TableHead>Recibido</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No hay envíos todavía.
                </TableCell>
              </TableRow>
            ) : (
              data.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer hover:bg-[#FFF8EC]"
                  onClick={() => setSelected(s)}
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.municipality}</TableCell>
                  <TableCell>{s.recurrence_label || formatDateEs(s.recurrence_start_date)}</TableCell>
                  <TableCell>{s.organizer_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("es-PR")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SubmissionReviewDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        submission={selected}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Submission["status"] }) {
  if (status === "pending")
    return <Badge className="bg-[#54b678] text-[#1c1e37] hover:bg-[#54b678]">Pendiente</Badge>;
  if (status === "approved")
    return <Badge className="bg-[#22C55E] text-white hover:bg-[#22C55E]">Aprobado</Badge>;
  return <Badge variant="secondary">Rechazado</Badge>;
}
