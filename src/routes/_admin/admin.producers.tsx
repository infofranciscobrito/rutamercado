import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Search, Plus, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  adminListProducers,
  adminUpsertProducer,
  adminDeleteProducer,
  adminAddProducerMarket,
  adminRemoveProducerMarket,
  type AdminProducer,
} from "@/lib/admin-producers.functions";
import { MARKET_REGIONS } from "@/types/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png"] as const;

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

const emptyProducer = (): AdminProducer => ({
  id: "",
  nombre: "",
  region: null,
  email: null,
  telefono: null,
  instagram: null,
  website: null,
  logo_url: null,
  mercados: [],
});

function ProducersAdminPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListProducers);
  const upsertFn = useServerFn(adminUpsertProducer);
  const deleteFn = useServerFn(adminDeleteProducer);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "producers"],
    queryFn: () => listFn(),
  });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminProducer | null>(null);
  const [deleting, setDeleting] = useState<AdminProducer | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (p: AdminProducer) =>
        p.nombre.toLowerCase().includes(term) ||
        (p.region ?? "").toLowerCase().includes(term) ||
        (p.email ?? "").toLowerCase().includes(term),
    );
  }, [data, q]);

  const upsertMutation = useMutation({
    mutationFn: async (vars: UpsertVars) => upsertFn({ data: vars }),
    onSuccess: () => {
      toast.success("Productor guardado.");
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Productor eliminado.");
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
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
            Directorio único de productores con los mercados que organizan.
          </p>
        </div>
        <Button
          onClick={() => setEditing(emptyProducer())}
          className="bg-[#54b678] text-[#18253f] hover:bg-[#3f9560]"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo productor
        </Button>
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
              filtered.map((p: AdminProducer) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-[#18253f]">
                    <div className="flex items-center gap-2">
                      {p.logo_url ? (
                        <img
                          src={p.logo_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : null}
                      <span>{p.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.region ?? "—"}</TableCell>
                  <TableCell className="text-sm">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-sm">{p.telefono ?? "—"}</TableCell>
                  <TableCell>{p.mercados.length}</TableCell>
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

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl text-[#18253f]">
              {editing?.id ? "Editar productor" : "Nuevo productor"}
            </SheetTitle>
            <SheetDescription>
              Datos de contacto, logo y mercados que organiza.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <EditForm
              key={editing.id || "new"}
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={(values) => upsertMutation.mutate(values)}
              submitting={upsertMutation.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar productor?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? (
                <>
                  Se eliminará <strong>{deleting.nombre}</strong> del directorio junto con
                  sus {deleting.mercados.length} mercado(s) vinculado(s). Esta acción no
                  afecta la tabla de mercados.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type UpsertVars = {
  id?: string | null;
  nombre: string;
  region: string | null;
  email: string | null;
  telefono: string | null;
  instagram: string | null;
  website: string | null;
  logo_url: string | null;
  logo?: {
    logo_base64: string;
    logo_filename: string;
    logo_mime: "image/jpeg" | "image/png";
  };
};

function EditForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: AdminProducer;
  onCancel: () => void;
  onSubmit: (v: UpsertVars) => void;
  submitting: boolean;
}) {
  const queryClient = useQueryClient();
  const addMarketFn = useServerFn(adminAddProducerMarket);
  const removeMarketFn = useServerFn(adminRemoveProducerMarket);

  const [nombre, setNombre] = useState(initial.nombre);
  const [region, setRegion] = useState<string>(initial.region ?? "");
  const [telefono, setTelefono] = useState(initial.telefono ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [instagram, setInstagram] = useState(initial.instagram ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mercados, setMercados] = useState(initial.mercados);
  const [newMarket, setNewMarket] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (file: File) => {
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      toast.error("Formato no válido. Solo se aceptan archivos JPG o PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddMarket = async () => {
    const name = newMarket.trim();
    if (!name) return;
    if (!initial.id) {
      toast.error("Guarda el productor antes de añadir mercados.");
      return;
    }
    try {
      const res = await addMarketFn({
        data: { productor_id: initial.id, mercado_nombre: name },
      });
      setMercados((prev) => [...prev, { id: res.id, nombre: res.mercado_nombre }]);
      setNewMarket("");
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleRemoveMarket = async (id: string) => {
    try {
      await removeMarketFn({ data: { id } });
      setMercados((prev) => prev.filter((m) => m.id !== id));
      queryClient.invalidateQueries({ queryKey: ["admin", "producers"] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let logoPayload: UpsertVars["logo"] | undefined;
    if (logoFile) {
      const base64 = await fileToBase64(logoFile);
      logoPayload = {
        logo_base64: base64,
        logo_filename: logoFile.name,
        logo_mime: logoFile.type as "image/jpeg" | "image/png",
      };
    }
    onSubmit({
      id: initial.id || undefined,
      nombre: nombre.trim(),
      region: region || null,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      instagram: instagram.trim() || null,
      website: website.trim() || null,
      logo_url: logoUrl,
      logo: logoPayload,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="admin-prod-name">Nombre del productor</Label>
        <Input
          id="admin-prod-name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Logo del productor</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSelectFile(f);
          }}
        />
        {logoPreview || logoUrl ? (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#18253f]/10 bg-[#FFF8EC] p-3">
            <img
              src={logoPreview ?? logoUrl ?? ""}
              alt="Logo"
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1 text-xs text-[#18253f]/70">
              {logoFile?.name ?? "Logo actual"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeLogo}
              className="text-[#18253f]/60 hover:text-destructive"
              aria-label="Quitar logo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full border-dashed border-[#54b678]/40 text-[#18253f] hover:border-[#54b678] hover:bg-[#54b678]/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4 text-[#54b678]" />
            Seleccionar imagen
          </Button>
        )}
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
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
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
        <Label htmlFor="admin-prod-url">Website / enlace de contacto</Label>
        <Input
          id="admin-prod-url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      <div className="rounded-lg border border-[#18253f]/10 bg-white p-3">
        <Label className="text-sm">Mercados que organiza</Label>
        {!initial.id ? (
          <p className="mt-1 text-xs text-[#18253f]/60">
            Guarda el productor primero para añadir mercados.
          </p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mercados.length === 0 ? (
                <span className="text-xs italic text-[#18253f]/50">
                  Aún no hay mercados.
                </span>
              ) : (
                mercados.map((m) => (
                  <Badge
                    key={m.id}
                    variant="secondary"
                    className="gap-1 bg-[#54b678]/10 text-[#18253f]"
                  >
                    {m.nombre}
                    <button
                      type="button"
                      onClick={() => handleRemoveMarket(m.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive"
                      aria-label={`Quitar ${m.nombre}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                placeholder="Nombre del mercado"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMarket();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddMarket}
                className="bg-[#54b678] text-[#18253f] hover:bg-[#3f9560]"
              >
                Añadir
              </Button>
            </div>
          </>
        )}
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
          {submitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
