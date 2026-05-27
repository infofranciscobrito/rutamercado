import { SlidersHorizontal, X } from "lucide-react";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import type { DateFilter, MarketFilters } from "@/lib/market-filters";
import { hasActiveFilters } from "@/lib/market-filters";
import { useEffect, useState } from "react";


interface Props {
  filters: MarketFilters;
  availableDays?: Set<string>;
  onChange: (next: Partial<MarketFilters>) => void;
  onClear: () => void;
  hideCategory?: boolean;
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
  disabled,
}: {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DATE_OPTIONS.map((opt) => {
        const active = !disabled && value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`min-h-11 rounded-full px-4 text-sm transition-all duration-150 ${
              active
                ? "bg-[#f8b625] font-semibold text-[#1c1e37] scale-[1.02]"
                : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#f8b625] hover:text-[#1c1e37]"
            } ${disabled ? "opacity-50" : ""}`}
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
      <SelectTrigger className="h-10 min-w-[180px] rounded-lg border-[#E5E7EB]">
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
      <SelectTrigger className="h-10 min-w-[210px] rounded-lg border-[#E5E7EB]">
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

export function FilterBar({ filters, onChange, onClear, hideCategory }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dayActive = !!filters.day;

  return (
    <div
      className={`sticky top-[64px] z-40 bg-white transition-shadow duration-300 ${
        scrolled
          ? "shadow-[0_4px_12px_rgba(28,30,55,0.06)]"
          : "border-b border-[#E5E7EB]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* Row: pills + dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DatePills
            value={filters.date}
            onChange={(date) => onChange({ date, day: undefined })}
            disabled={dayActive}
          />

          <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
            <RegionSelect
              value={filters.region}
              onChange={(region) => onChange({ region })}
            />
            {!hideCategory && (
              <CategorySelect
                value={filters.category}
                onChange={(category) => onChange({ category })}
              />
            )}
            {hasActiveFilters(filters) && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[#d97706] hover:bg-[#FEF3C7]"
              >
                <X className="h-4 w-4" /> Limpiar
              </button>
            )}
          </div>

          {/* Mobile: filters sheet */}
          <div className="ml-auto md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="min-h-11 gap-2 border-[#E5E7EB] text-[#1c1e37]"
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
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Región
                    </p>
                    <RegionSelect
                      value={filters.region}
                      onChange={(region) => onChange({ region })}
                    />
                  </div>
                  {!hideCategory && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                        Categoría
                      </p>
                      <CategorySelect
                        value={filters.category}
                        onChange={(category) => onChange({ category })}
                      />
                    </div>
                  )}
                </div>
                <SheetFooter className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onClear()}
                    disabled={!hasActiveFilters(filters)}
                  >
                    Limpiar
                  </Button>
                  <Button
                    className="flex-1 bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90"
                    onClick={() => setSheetOpen(false)}
                  >
                    Aplicar Filtros
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
