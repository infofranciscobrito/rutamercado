import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CalendarDays, Clock, MapPin, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveSubmission,
  deleteSubmission,
  rejectSubmission,
  type Submission,
} from "@/lib/submissions.functions";
import { formatDateEs, formatTimeRange } from "@/lib/format";

export function SubmissionReviewDrawer({
  open,
  onOpenChange,
  submission,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submission: Submission | null;
}) {
  const qc = useQueryClient();
  const approveFn = useServerFn(approveSubmission);
  const rejectFn = useServerFn(rejectSubmission);
  const [notes, setNotes] = useState("");

  const approve = useMutation({
    mutationFn: () => approveFn({ data: { id: submission!.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "submissions"] });
      qc.invalidateQueries({ queryKey: ["admin", "markets"] });
      qc.invalidateQueries({ queryKey: ["markets"] });
      qc.invalidateQueries({ queryKey: ["admin", "submissions", "pending-count"] });
      toast.success("Mercado publicado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: () =>
      rejectFn({ data: { id: submission!.id, notes: notes || undefined } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "submissions"] });
      qc.invalidateQueries({ queryKey: ["admin", "submissions", "pending-count"] });
      toast.success("Envío rechazado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!submission) return null;
  const pending = submission.status === "pending";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{submission.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {submission.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#FFF8EC]">
              <img
                src={submission.image_url}
                alt={submission.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <Row icon={<CalendarDays className="h-4 w-4" />}>
            {submission.recurrence_label || formatDateEs(submission.recurrence_start_date)}
            {submission.recurrence_label
              ? ` · empieza ${formatDateEs(submission.recurrence_start_date)}`
              : ""}
          </Row>
          <Row icon={<Clock className="h-4 w-4" />}>
            {formatTimeRange(submission.start_time, submission.end_time)}
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />}>
            {submission.address} · {submission.municipality}, {submission.region}
          </Row>
          <Row icon={<User className="h-4 w-4" />}>
            {submission.organizer_name}
          </Row>

          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            {submission.organizer_phone && (
              <Mini label="Teléfono" value={submission.organizer_phone} />
            )}
            {submission.organizer_email && (
              <Mini label="Email" value={submission.organizer_email} />
            )}
            {submission.organizer_instagram && (
              <Mini label="Redes sociales" value={submission.organizer_instagram} />
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Categoría
            </p>
            <p className="text-sm font-medium">{submission.category}</p>
          </div>

          {submission.description && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Descripción
              </p>
              <p className="whitespace-pre-line text-sm">
                {submission.description}
              </p>
            </div>
          )}

          {pending ? (
            <div className="space-y-3 border-t pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notas (opcional, solo para rechazo)
                </p>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Motivo del rechazo…"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#22C55E] text-white hover:bg-[#16a34a]"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => approve.mutate()}
                >
                  {approve.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Aprobar y publicar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => reject.mutate()}
                >
                  {reject.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Rechazar
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              Estado:{" "}
              <span className="font-semibold capitalize">{submission.status}</span>
              {submission.admin_notes ? ` · ${submission.admin_notes}` : ""}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-[#54b678]">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#FFF8EC] p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  );
}
