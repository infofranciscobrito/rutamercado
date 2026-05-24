import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import type { DateFilter, MarketFilters } from "@/lib/market-filters";
import { defaultFilters, hasActiveFilters } from "@/lib/market-filters";
import { useEffect, useState } from "react";

interface Props {
  filters: MarketFilters;
  onChange: (next: Partial<MarketFilters>) => void;
  onClear: () => void;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mes" },
  { value: "all", label: "Todos" },
];

function DatePills({
  value,
  onChange,
}: {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DATE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "rounded-full bg-[#f8b625] px-3 py-1.5 text-sm font-medium text-[#1c1e37]"
                : "rounded-full border border-border bg-white px-3 py-1.5 text-sm text-[#1c1e37] hover:border-[#f8b625]"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function RegionSelect({
  value,
  onChange,
}: {
  value: MarketFilters["region"];
  onChange: (v: MarketFilters["region"]) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MarketFilters["region"])}>
      <SelectTrigger className="min-w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las Regiones</SelectItem>
        {MARKET_REGIONS.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: MarketFilters["category"];
  onChange: (v: MarketFilters["category"]) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as MarketFilters["category"])}
    >
      <SelectTrigger className="min-w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las Categorías</SelectItem>
        {MARKET_CATEGORIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBar({ filters, onChange, onClear }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-[64px] z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "border-b border-border"}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Buscar mercado por nombre o municipio..."
              className="pl-9"
            />
          </div>
          <DatePills
            value={filters.date}
            onChange={(date) => onChange({ date })}
          />
          <RegionSelect
            value={filters.region}
            onChange={(region) => onChange({ region })}
          />
          <CategorySelect
            value={filters.category}
            onChange={(category) => onChange({ category })}
          />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Buscar..."
              className="pl-9"
            />
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="shrink-0 gap-2 border-[#1c1e37]/20 text-[#1c1e37]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl text-[#1c1e37]">
                  Filtros
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5 py-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </p>
                  <DatePills
                    value={filters.date}
                    onChange={(date) => onChange({ date })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Región
                  </p>
                  <RegionSelect
                    value={filters.region}
                    onChange={(region) => onChange({ region })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Categoría
                  </p>
                  <CategorySelect
                    value={filters.category}
                    onChange={(category) => onChange({ category })}
                  />
                </div>
              </div>
              <SheetFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onClear();
                  }}
                  disabled={!hasActiveFilters(filters)}
                >
                  Limpiar
                </Button>
                <Button
                  className="flex-1 bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90"
                  onClick={() => setSheetOpen(false)}
                >
                  Ver resultados
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

// re-export to satisfy potential unused-import linters
export { defaultFilters };
