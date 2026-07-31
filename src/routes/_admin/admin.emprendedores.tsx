import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Search, Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import {
  adminListEmprendedores,
  adminUpsertEmprendedor,
  adminApproveEmprendedor,
  adminRejectEmprendedor,
  adminDeleteEmprendedor,
  type AdminEmprendedor,
} from "@/lib/admin-emprendedores.functions";
import {
  EMPRENDEDOR_CATEGORIES,
  TIEMPO_OPERANDO_OPTIONS,
  REGISTRO_COMERCIANTE_OPTIONS,
  FUENTE_INGRESO_OPTIONS,
  CANALES_VENTA_OPTIONS,
  TAMANO_EQUIPO_OPTIONS,
  ARTESANO_CERTIFICADO_OPTIONS,
  type EmprendedorCategory,
} from "@/lib/emprendedores.functions";
import { MARKET_REGIONS } from "@/types/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LogoUploader } from "@/components/admin/LogoUploader";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessAnalyticsDashboard } from "@/components/admin/BusinessAnalyticsDashboard";

export const Route = createFileRoute("/_admin/admin/emprendedores")({
  component: EmprendedoresAdminPage,
});


const emptyItem = (): AdminEmprendedor => ({
  id: "",
  nombre_negocio: "",
  logo_url: null,
  descripcion: "",
  categoria_producto: "Otro",
  region: null,
  municipio: null,
  instagram: null,
  email: null,
  telefono: null,
  persona_contacto: null,
  mercados_interes: [],
  tiempo_operando: null,
  registro_comerciante: null,
  fuente_ingreso: null,
  canales_venta: [],
  tamano_equipo: null,
  categoria_otro: null,
  artesano_certificado: null,
  status: "approved",
  created_at: new Date().toISOString(),
});

function EmprendedoresAdminPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListEmprendedores);
  const upsertFn = useServerFn(adminUpsertEmprendedor);
  const approveFn = useServerFn(adminApproveEmprendedor);
  const rejectFn = useServerFn(adminRejectEmprendedor);
  const deleteFn = useServerFn(adminDeleteEmprendedor);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "emprendedores"],
    queryFn: () => listFn(),
  });
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table" | "analytics">("analytics");
  const [tab, setTab] = useState<"approved" | "pending" | "rejected">("pending");
  const [editing, setEditing] = useState<AdminEmprendedor | null>(null);
  const [deleting, setDeleting] = useState<AdminEmprendedor | null>(null);


  const counts = useMemo(
    () => ({
      pending: data.filter((r) => r.status === "pending").length,
      approved: data.filter((r) => r.status === "approved").length,
      rejected: data.filter((r) => r.status === "rejected").length,
    }),
    [data],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const byTab = data.filter((r) => r.status === tab);
    if (!term) return byTab;
    return byTab.filter(
      (r) =>
        r.nombre_negocio.toLowerCase().includes(term) ||
        r.categoria_producto.toLowerCase().includes(term) ||
        (r.region ?? "").toLowerCase().includes(term) ||
        (r.municipio ?? "").toLowerCase().includes(term) ||
        (r.email ?? "").toLowerCase().includes(term),
    );
  }, [data, q, tab]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "emprendedores"] });
    queryClient.invalidateQueries({
      queryKey: ["admin", "emprendedores", "pending-count"],
    });
    queryClient.invalidateQueries({ queryKey: ["emprendedores"] });
  };

  const approveMut = useMutation({
    mutationFn: (id: string) => approveFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Negocio aprobado.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Negocio rechazado.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Negocio eliminado.");
      setDeleting(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Registro de negocios</h1>
          <p className="mt-1 text-sm text-[#18253f]/60">
            Registros del Directorio de Negocios. Revisa, aprueba o rechaza.
          </p>
        </div>
        <Button
          onClick={() => setEditing(emptyItem())}
          className="bg-[#54b678] text-white hover:bg-[#439660]"
        >
          Nuevo negocio
        </Button>
      </div>

      <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setView("analytics")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${view === "analytics" ? "bg-[#18253f] text-white" : "text-[#18253f] hover:bg-[#18253f]/5"}`}
        >
          Analítica
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${view === "table" ? "bg-[#18253f] text-white" : "text-[#18253f] hover:bg-[#18253f]/5"}`}
        >
          Tabla ({data.length})
        </button>
      </div>

      {view === "analytics" ? (
        <BusinessAnalyticsDashboard />
      ) : (
      <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprobados ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazados ({counts.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => exportRows(filtered, `negocios-${tab}`)}
            className="shrink-0 gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar ({filtered.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => exportRows(data, "negocios-todos")}
            className="shrink-0 gap-2"
          >
            <Download className="h-4 w-4" />
            Todos ({data.length})
          </Button>
        </div>
      </div>



      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Negocio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Región / Municipio</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="w-40 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay negocios en esta pestaña.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {r.logo_url ? (
                        <img
                          src={r.logo_url}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#54b678]/20" />
                      )}
                      <div>
                        <div className="font-medium text-[#18253f]">
                          {r.nombre_negocio}
                        </div>
                        <div className="line-clamp-1 max-w-xs text-xs text-[#18253f]/60">
                          {r.descripcion}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.categoria_producto}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#18253f]/80">
                    {[r.region, r.municipio].filter(Boolean).join(" · ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#18253f]/80">
                    <div className="space-y-0.5">
                      {r.email ? <div>{r.email}</div> : null}
                      {r.telefono ? <div>{r.telefono}</div> : null}
                      {r.instagram ? <div>{r.instagram}</div> : null}
                      {!r.email && !r.telefono && !r.instagram ? "—" : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approveMut.mutate(r.id)}
                            className="text-[#54b678] hover:bg-[#54b678]/10 hover:text-[#439660]"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectMut.mutate(r.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleting(r)}
                        className="text-destructive hover:bg-destructive/10"
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

      {editing ? (
        <EmprendedorEditor
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            invalidate();
          }}
          upsertFn={upsertFn as unknown as (args: { data: unknown }) => Promise<{ ok: true; id: string }>}
        />
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{deleting?.nombre_negocio}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMut.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
      )}
    </div>

  );
}

function EmprendedorEditor({
  value,
  onClose,
  onSaved,
  upsertFn,
}: {
  value: AdminEmprendedor;
  onClose: () => void;
  onSaved: () => void;
  upsertFn: (args: { data: unknown }) => Promise<{ ok: true; id: string }>;
}) {
  const [form, setForm] = useState(value);
  const [mercadosStr, setMercadosStr] = useState(
    (value.mercados_interes ?? []).join(", "),
  );
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AdminEmprendedor>(
    k: K,
    v: AdminEmprendedor[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.nombre_negocio.trim()) {
      toast.error("El nombre del negocio es obligatorio.");
      return;
    }
    if (!form.descripcion.trim()) {
      toast.error("La descripción es obligatoria.");
      return;
    }
    setSaving(true);
    try {
      await upsertFn({
        data: {
          id: form.id || null,
          nombre_negocio: form.nombre_negocio,
          descripcion: form.descripcion,
          categoria_producto: form.categoria_producto as EmprendedorCategory,
          region: form.region,
          municipio: form.municipio,
          instagram: form.instagram,
          email: form.email,
          telefono: form.telefono,
          persona_contacto: form.persona_contacto,
          mercados_interes: mercadosStr,
          tiempo_operando: (form.tiempo_operando as never) ?? null,
          registro_comerciante: (form.registro_comerciante as never) ?? null,
          fuente_ingreso: (form.fuente_ingreso as never) ?? null,
          canales_venta: (form.canales_venta as never) ?? null,
          tamano_equipo: (form.tamano_equipo as never) ?? null,
          categoria_otro: form.categoria_otro ?? null,
          artesano_certificado: (form.artesano_certificado as never) ?? null,
          logo_url: form.logo_url,
        },
      });
      toast.success("Negocio guardado.");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{form.id ? "Editar negocio" : "Nuevo negocio"}</SheetTitle>
          <SheetDescription>
            {form.id ? "Actualiza los datos del negocio." : "Crea un nuevo perfil aprobado."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Nombre del negocio *</Label>
            <Input
              value={form.nombre_negocio}
              onChange={(e) => set("nombre_negocio", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Descripción *</Label>
            <Textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={form.categoria_producto}
              onValueChange={(v) => set("categoria_producto", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPRENDEDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Región</Label>
              <Select
                value={form.region ?? ""}
                onValueChange={(v) => set("region", v || null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Región" />
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
              <Label>Municipio</Label>
              <Input
                value={form.municipio ?? ""}
                onChange={(e) => set("municipio", e.target.value || null)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Persona de contacto</Label>
            <Input
              value={form.persona_contacto ?? ""}
              onChange={(e) => set("persona_contacto", e.target.value || null)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              value={form.instagram ?? ""}
              onChange={(e) => set("instagram", e.target.value || null)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value || null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={form.telefono ?? ""}
                onChange={(e) => set("telefono", e.target.value || null)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Mercados de interés (separa por comas)</Label>
            <Input
              value={mercadosStr}
              onChange={(e) => setMercadosStr(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="rounded-md border border-dashed border-[#18253f]/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#18253f]/60">
              Datos internos (no se muestran públicamente)
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <Label>Tiempo operando</Label>
                <Select
                  value={form.tiempo_operando ?? ""}
                  onValueChange={(v) => set("tiempo_operando", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIEMPO_OPERANDO_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Registro de comerciante</Label>
                <Select
                  value={form.registro_comerciante ?? ""}
                  onValueChange={(v) => set("registro_comerciante", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRO_COMERCIANTE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fuente de ingreso</Label>
                <Select
                  value={form.fuente_ingreso ?? ""}
                  onValueChange={(v) => set("fuente_ingreso", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUENTE_INGRESO_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Canales de venta</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CANALES_VENTA_OPTIONS.map((o) => {
                    const selected = (form.canales_venta ?? []).includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => {
                          const cur = form.canales_venta ?? [];
                          set(
                            "canales_venta",
                            (cur.includes(o)
                              ? cur.filter((v) => v !== o)
                              : [...cur, o]) as never,
                          );
                        }}
                        className={
                          selected
                            ? "rounded-md border border-[#54b678] bg-[#54b678] px-3 py-1 text-xs text-white"
                            : "rounded-md border border-[#18253f]/20 bg-white px-3 py-1 text-xs text-[#18253f]"
                        }
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Tamaño del equipo</Label>
                <Select
                  value={form.tamano_equipo ?? ""}
                  onValueChange={(v) => set("tamano_equipo", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAMANO_EQUIPO_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            {form.categoria_producto === "Otro" ? (
              <div className="mt-4">
                <Label>Categoría personalizada (máx. 20 palabras)</Label>
                <Input
                  value={form.categoria_otro ?? ""}
                  onChange={(e) => set("categoria_otro", e.target.value || null)}
                  className="mt-1"
                  maxLength={200}
                />
              </div>
            ) : null}
            {form.categoria_producto === "Artesanías" ? (
              <div className="mt-4">
                <Label>Artesano/a certificado/a</Label>
                <Select
                  value={form.artesano_certificado ?? ""}
                  onValueChange={(v) => set("artesano_certificado", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTESANO_CERTIFICADO_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          </div>
          <div>
            <Label>Logo</Label>
            <LogoUploader
              value={form.logo_url}
              onChange={(url) => set("logo_url", url)}
            />
            <Input
              value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value || null)}
              placeholder="o pega una URL: https://..."
              className="mt-2"
            />
          </div>


          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#54b678] text-white hover:bg-[#439660]"
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
