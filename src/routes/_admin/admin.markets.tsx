import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Hand, Eye, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  listAllMarkets,
  deleteMarket,
  toggleMarketActive,
  toggleMarketDestacado,

} from "@/lib/admin-markets.functions";
import { getIntentionsPerMarketAll } from "@/lib/admin-analytics.functions";
import { MARKET_CATEGORIES, type Market } from "@/types/market";
import { formatDateEs } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MarketFormDrawer } from "@/components/admin/MarketFormDrawer";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/_admin/admin/markets")({
  component: MarketsPage,
});

function MarketsPage() {
  const queryClient = useQueryClient();
  const listMarketsFn = useServerFn(listAllMarkets);
  const toggleFn = useServerFn(toggleMarketActive);
  const toggleDestacadoFn = useServerFn(toggleMarketDestacado);

  const deleteFn = useServerFn(deleteMarket);
  const intentionsFn = useServerFn(getIntentionsPerMarketAll);
  const { data: markets = [], isLoading, error } = useQuery({
    queryKey: ["admin", "markets"],
    queryFn: async () => {
      console.log("[Admin data] markets: fetch start");
      try {
        const result = await listMarketsFn();
        console.log("[Admin data] markets: fetch success", result);
        return result;
      } catch (err) {
        console.error("[Admin data] markets: fetch error", err);
        throw err;
      }
    },
  });
  const { data: intentions = {} } = useQuery({
    queryKey: ["admin", "markets", "intentions"],
    queryFn: () => intentionsFn(),
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [completeness, setCompleteness] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Market | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Market | null>(null);

  const getMissing = (m: Market): string[] => {
    const missing: string[] = [];
    if (!m.pets) missing.push("Mascotas");
    if (!m.parking) missing.push("Estacionamiento");
    if (!m.accessibility) missing.push("Accesibilidad");
    if (!m.family_friendly) missing.push("Familiar");
    if (!m.food_area) missing.push("Área de comida");
    if (!m.payment_methods || m.payment_methods.length === 0) missing.push("Métodos de pago");
    return missing;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return markets.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (completeness !== "all") {
        const missingCount = getMissing(m).length;
        if (completeness === "incomplete" && missingCount === 0) return false;
        if (completeness === "empty" && missingCount !== 6) return false;
        if (completeness === "complete" && missingCount !== 0) return false;
      }
      return true;
    });
  }, [markets, search, category, completeness]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = useMutation({
    mutationFn: (v: { id: string; isActive: boolean }) => toggleFn({ data: v }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleDestacado = useMutation({
    mutationFn: (v: { id: string; destacado: boolean }) => toggleDestacadoFn({ data: v }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_d, _id, ctx) => {
      const name = confirmDelete?.name ?? "El mercado";
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "submissions"] });
      toast.success(`${name} ha sido eliminado completamente del sistema`);
      setConfirmDelete(null);
    },
    onError: () => toast.error("Error al eliminar. No se borró nada. Intenta de nuevo."),
  });

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (m: Market) => {
    setEditing(m);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando mercados...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">No se pudieron cargar los mercados: {error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#18253f]">Gestión de Mercados</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} mercados</p>
        </div>
        <Button onClick={openCreate} className="bg-[#54b678] text-[#18253f] hover:bg-[#54b678]/90">
          <Plus className="h-4 w-4 mr-1" /> Agregar Mercado
        </Button>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
          name="market-filter-q"
          id="market-filter-q"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          readOnly
          onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
        />

        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {MARKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={completeness} onValueChange={(v) => { setCompleteness(v); setPage(1); }}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (servicios)</SelectItem>
            <SelectItem value="incomplete">Con servicios incompletos</SelectItem>
            <SelectItem value="empty">Sin ningún servicio</SelectItem>
            <SelectItem value="complete">Servicios completos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <TooltipProvider delayDuration={150}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead className="text-right">Intención</TableHead>
              <TableHead>Destacado</TableHead>
              <TableHead>Activo</TableHead>

              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((m) => {
                const int = (intentions as Record<string, { willAttend: number; interested: number }>)[m.id] ?? { willAttend: 0, interested: 0 };
                const total = int.willAttend + int.interested;
                const missing = getMissing(m);
                const filled = 6 - missing.length;
                const badgeClass =
                  missing.length === 0
                    ? "bg-[#54b678]/15 text-[#166534] border-0"
                    : missing.length === 6
                      ? "bg-[#DC2626]/15 text-[#DC2626] border-0"
                      : "bg-[#F59E0B]/15 text-[#B45309] border-0";
                return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    {missing.length === 0 ? (
                      <Badge variant="secondary" className={badgeClass}>6/6</Badge>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className={`${badgeClass} cursor-help gap-1`}>
                            <AlertCircle className="h-3 w-3" />
                            {filled}/6
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="text-xs font-medium mb-1">Falta completar:</div>
                          <ul className="text-xs list-disc pl-4 space-y-0.5">
                            {missing.map((f) => <li key={f}>{f}</li>)}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#54b678]/15 text-[#18253f] border-0">
                      {m.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.municipality}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.recurrence_label || formatDateEs(m.recurrence_start_date)}</TableCell>
                  <TableCell className="text-right">{m.view_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    {total === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Link
                        to="/admin/analytics"
                        search={{ market: m.id }}
                        className="inline-flex items-center gap-2 whitespace-nowrap text-[#18253f] hover:text-[#54b678] hover:underline"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Hand className="h-3.5 w-3.5 text-[#54b678]" />
                          {int.willAttend}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          {int.interested}
                        </span>
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(m.destacado)}
                      onCheckedChange={(v) => toggleDestacado.mutate({ id: m.id, destacado: v })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={m.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: m.id, isActive: v })}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(m)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </TooltipProvider>
      </div>


      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <MarketFormDrawer open={drawerOpen} onOpenChange={setDrawerOpen} market={editing} />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => {
          if (!remove.isPending && !o) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este mercado permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{confirmDelete?.name}" de todas las secciones del sitio — directorio público, panel de administración, envíos, analíticas y estadísticas. También se eliminará su imagen. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmDelete) remove.mutate(confirmDelete.id);
              }}
              disabled={remove.isPending}
              className="bg-[#DC2626] text-white hover:bg-[#DC2626]/90"
            >
              {remove.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando…
                </>
              ) : (
                "Eliminar de todo el sistema"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
