import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
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

const submissionsQO = queryOptions({
  queryKey: ["admin", "submissions"],
  queryFn: () => listSubmissions(),
});

export const Route = createFileRoute("/_admin/admin/submissions")({
  loader: ({ context }) => context.queryClient.ensureQueryData(submissionsQO),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { data } = useSuspenseQuery(submissionsQO);
  const [selected, setSelected] = useState<Submission | null>(null);

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
                  <TableCell>{formatDateEs(s.event_date)}</TableCell>
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
    return <Badge className="bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]">Pendiente</Badge>;
  if (status === "approved")
    return <Badge className="bg-[#22C55E] text-white hover:bg-[#22C55E]">Aprobado</Badge>;
  return <Badge variant="secondary">Rechazado</Badge>;
}
