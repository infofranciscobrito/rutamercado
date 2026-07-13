import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listContactMessages,
  updateContactMessageStatus,
  CONTACT_ROLE_LABELS,
  type ContactMessage,
} from "@/lib/contact.functions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "new" | "read" | "archived";

export const Route = createFileRoute("/_admin/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const listFn = useServerFn(listContactMessages);
  const updateFn = useServerFn(updateContactMessageStatus);
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "contact-messages"],
    queryFn: () => listFn(),
    refetchInterval: 60_000,
  });

  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [updating, setUpdating] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? data : data.filter((m) => m.status === filter)),
    [data, filter],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] });
    void queryClient.invalidateQueries({
      queryKey: ["admin", "contact-messages", "new-count"],
    });
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === "new") {
      try {
        await updateFn({ data: { id: msg.id, status: "read" } });
        invalidate();
      } catch (err) {
        console.error("[Admin messages] mark read error", err);
      }
    }
  };

  const changeStatus = async (
    id: string,
    status: "new" | "read" | "archived",
  ) => {
    setUpdating(true);
    try {
      await updateFn({ data: { id, status } });
      invalidate();
      setSelected((cur) => (cur && cur.id === id ? { ...cur, status } : cur));
      toast.success("Mensaje actualizado");
    } catch (err) {
      console.error("[Admin messages] update error", err);
      toast.error("No se pudo actualizar el mensaje");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando mensajes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        No se pudieron cargar los mensajes: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Mensajes</h1>
          <p className="mt-1 text-sm text-[#18253f]/60">
            Mensajes recibidos desde el formulario de contacto.
          </p>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Nuevos</SelectItem>
              <SelectItem value="read">Leídos</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Soy</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No hay mensajes.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer hover:bg-[#FFF8EC]"
                  onClick={() => void openMessage(m)}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("es-PR")}
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{CONTACT_ROLE_LABELS[m.role]}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.phone}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Mensaje de {selected.name}</DialogTitle>
                <DialogDescription>
                  Recibido el {new Date(selected.created_at).toLocaleString("es-PR")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <InfoRow label="Soy" value={CONTACT_ROLE_LABELS[selected.role]} />
                <InfoRow
                  label="Correo"
                  value={
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-[#18253f] underline hover:text-[#54b678]"
                    >
                      {selected.email}
                    </a>
                  }
                />
                <InfoRow
                  label="Teléfono"
                  value={
                    <a
                      href={`tel:${selected.phone}`}
                      className="text-[#18253f] underline hover:text-[#54b678]"
                    >
                      {selected.phone}
                    </a>
                  }
                />
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Mensaje
                  </p>
                  <p className="whitespace-pre-wrap rounded-md border bg-[#FAFAF8] p-3">
                    {selected.message}
                  </p>
                </div>
                <InfoRow
                  label="Estado"
                  value={<StatusBadge status={selected.status} />}
                />
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {selected.status !== "archived" && (
                  <Button
                    variant="outline"
                    disabled={updating}
                    onClick={() => void changeStatus(selected.id, "archived")}
                  >
                    Archivar
                  </Button>
                )}
                {selected.status !== "new" && (
                  <Button
                    variant="outline"
                    disabled={updating}
                    onClick={() => void changeStatus(selected.id, "new")}
                  >
                    Marcar como nuevo
                  </Button>
                )}
                {selected.status !== "read" && (
                  <Button
                    disabled={updating}
                    onClick={() => void changeStatus(selected.id, "read")}
                    className="bg-[#54b678] text-[#18253f] hover:bg-[#4aa66b]"
                  >
                    Marcar como leído
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-[#18253f]">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactMessage["status"] }) {
  if (status === "new")
    return (
      <Badge className="bg-[#54b678] text-[#18253f] hover:bg-[#54b678]">Nuevo</Badge>
    );
  if (status === "read") return <Badge variant="secondary">Leído</Badge>;
  return <Badge variant="outline">Archivado</Badge>;
}
