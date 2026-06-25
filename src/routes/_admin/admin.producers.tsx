import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  listAdminProducers,
  updateAdminProducer,
  deleteAdminProducer,
  type AdminProducer,
} from "@/lib/admin-producers.functions";
import { MARKET_REGIONS } from "@/types/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/_admin/admin/producers")({
  component: ProducersAdminPage,
});

type EditState = AdminProducer & { _isNew?: boolean };

function ProducersAdminPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listAdminProducers);
  const updateFn = useServerFn(updateAdminProducer);
  const deleteFn = useServerFn(deleteAdminProducer);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "producers"],
    queryFn: () => listFn(),
  });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<AdminProducer | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (p) =>
        p.organizer_name.toLowerCase().includes(term) ||
        (p.region ?? "").toLowerCase().includes(term) ||
        (p.organizer_email ?? "").toLowerCase().includes(term),
    );
  }, [data, q]);

  const mutation = useMutation({
    mutationFn: async (vars: {
      original_name: string;
      organizer_name: string;
      region: string | null;
      organizer_phone: string | null;
      organizer_email: string | null;
      organizer_instagram: string | null;
      organizer_contact_url: string | null;
    }) => updateFn({ data: vars as Parameters<typeof updateFn>[0]["data"] }),
    onSuccess: (res) => {
      toast.success(`Productor actualizado (${res.updated} mercado(s)).`);
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (vars: { original_name: string; hardDelete: boolean }) =>
      deleteFn({ data: vars }),
    onSuccess: (res) => {
      toast.success(`Productor eliminado (${res.affected} mercado(s) afectado(s)).`);
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Productores</h1>
          <p className="mt-1 text-sm text-[#18253f]/60">
            Gestiona los productores agrupados por nombre del organizador.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#18253f]/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar productor, email o región..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Productor</TableHead>
              <TableHead>Región</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead># Mercados</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No hay productores.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-medium text-[#18253f]">
                    {p.organizer_name}
                  </TableCell>
                  <TableCell>{p.region ?? "—"}</TableCell>
                  <TableCell className="text-sm">{p.organizer_email ?? "—"}</TableCell>
                  <TableCell className="text-sm">{p.organizer_phone ?? "—"}</TableCell>
                  <TableCell>{p.market_ids.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(p)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleting(p)}
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit drawer */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl text-[#18253f]">
              Editar productor
            </SheetTitle>
            <SheetDescription>
              Los cambios se aplican a todos los mercados con este nombre de organizador.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <EditForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={(values) => mutation.mutate(values)}
              submitting={mutation.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar productor?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? (
                <>
                  Esta acción <strong>desactivará</strong> los{" "}
                  {deleting.market_ids.length} mercado(s) de{" "}
                  <strong>{deleting.organizer_name}</strong> y borrará su información de
                  contacto. Los mercados no se eliminarán de la base de datos.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleting &&
                deleteMutation.mutate({
                  original_name: deleting.organizer_name,
                  hardDelete: false,
                })
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: AdminProducer;
  onCancel: () => void;
  onSubmit: (v: {
    original_name: string;
    organizer_name: string;
    region: string | null;
    organizer_phone: string | null;
    organizer_email: string | null;
    organizer_instagram: string | null;
    organizer_contact_url: string | null;
  }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial.organizer_name);
  const [region, setRegion] = useState<string>(initial.region ?? "");
  const [phone, setPhone] = useState(initial.organizer_phone ?? "");
  const [email, setEmail] = useState(initial.organizer_email ?? "");
  const [instagram, setInstagram] = useState(initial.organizer_instagram ?? "");
  const [contactUrl, setContactUrl] = useState(initial.organizer_contact_url ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      original_name: initial.organizer_name,
      organizer_name: name.trim(),
      region: region || null,
      organizer_phone: phone.trim() || null,
      organizer_email: email.trim() || null,
      organizer_instagram: instagram.trim() || null,
      organizer_contact_url: contactUrl.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="admin-prod-name">Nombre</Label>
        <Input
          id="admin-prod-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="admin-prod-region">Región</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger id="admin-prod-region" className="mt-1">
            <SelectValue placeholder="Selecciona una región" />
          </SelectTrigger>
          <SelectContent>
            {MARKET_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="admin-prod-email">Email</Label>
        <Input
          id="admin-prod-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="admin-prod-phone">Teléfono</Label>
        <Input
          id="admin-prod-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="admin-prod-ig">Instagram</Label>
        <Input
          id="admin-prod-ig"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@usuario"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="admin-prod-url">Página web / enlace de contacto</Label>
        <Input
          id="admin-prod-url"
          value={contactUrl}
          onChange={(e) => setContactUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1"
        />
      </div>
      <div className="rounded-lg bg-[#FFF8EC] p-3 text-xs text-[#18253f]/70">
        Se aplicará a {initial.market_ids.length} mercado(s):{" "}
        {initial.market_names.join(", ")}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#54b678] text-[#18253f] hover:bg-[#3f9560]"
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
