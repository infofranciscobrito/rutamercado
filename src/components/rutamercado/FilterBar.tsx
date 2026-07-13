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
import { useEffect, useMemo, useState } from "react";


interface Props {
  filters: MarketFilters;
  availableDays?: Set<string>;
  municipalities?: string[];
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

const FEATURED_MUNICIPALITIES = [
  "San Juan",
  "Aguadilla",
  "Caguas",
  "Canóvanas",
  "Hatillo",
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
                ? "bg-[#54b678] font-semibold text-[#18253f] scale-[1.02]"
                : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#54b678] hover:text-[#18253f]"
            } ${disabled ? "opacity-50" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MunicipalityChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = useMemo(
    () => [{ value: "all", label: "Todos" }, ...FEATURED_MUNICIPALITIES.map((m) => ({ value: m, label: m }))],
    [],
  );
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm transition-all duration-150 ${
                active
                  ? "bg-[#54b678] font-semibold text-[#18253f] scale-[1.02]"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#54b678] hover:text-[#18253f]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
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

function MunicipalitySelect({
  value,
  municipalities,
  onChange,
}: {
  value: string;
  municipalities: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 min-w-[200px] rounded-lg border-[#E5E7EB]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los Municipios</SelectItem>
        {municipalities.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
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

export function FilterBar({ filters, municipalities = [], onChange, onClear, hideCategory }: Props) {
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
          ? "shadow-[0_4px_12px_rgba(24,37,63,0.06)]"
          : "border-b border-[#E5E7EB]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* Row 1: date pills + dropdowns */}
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
            <MunicipalitySelect
              value={filters.municipality}
              municipalities={municipalities}
              onChange={(municipality) => onChange({ municipality })}
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
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[#2f7a4c] hover:bg-[#FEF3C7]"
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
                  className="min-h-11 gap-2 border-[#E5E7EB] text-[#18253f]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-[#18253f]">
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
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Municipio
                    </p>
                    <MunicipalitySelect
                      value={filters.municipality}
                      municipalities={municipalities}
                      onChange={(municipality) => onChange({ municipality })}
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
                    className="flex-1 bg-[#54b678] text-[#18253f] hover:bg-[#54b678]/90"
                    onClick={() => setSheetOpen(false)}
                  >
                    Aplicar Filtros
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Row 2: municipality chips */}
        <div id="municipios" className="mt-3 scroll-mt-24">
          <MunicipalityChips
            value={filters.municipality}
            onChange={(municipality) => onChange({ municipality })}
          />
        </div>

      </div>
    </div>
  );
}
