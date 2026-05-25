import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listAllMarkets,
  deleteMarket,
  toggleMarketActive,
} from "@/lib/admin-markets.functions";
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
  const deleteFn = useServerFn(deleteMarket);
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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Market | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Market | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return markets.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [markets, search, category]);

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
          <h1 className="font-display text-3xl text-[#1c1e37]">Gestión de Mercados</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} mercados</p>
        </div>
        <Button onClick={openCreate} className="bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90">
          <Plus className="h-4 w-4 mr-1" /> Agregar Mercado
        </Button>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
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
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#f8b625]/15 text-[#1c1e37] border-0">
                      {m.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.municipality}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.recurrence_label || formatDateEs(m.recurrence_start_date)}</TableCell>
                  <TableCell className="text-right">{m.view_count ?? 0}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
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
