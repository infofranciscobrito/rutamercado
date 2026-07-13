import { X } from "lucide-react";
import type { MarketFilters } from "@/lib/market-filters";
import { formatDateEs } from "@/lib/format";

interface Props {
  filters: MarketFilters;
  onRemove: (key: keyof MarketFilters) => void;
}

const DATE_LABELS: Record<MarketFilters["date"], string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
  all: "",
};

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2.5 py-1 text-xs font-medium text-[#92400E]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-[#54b678]/30"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function ActiveFilterChips({ filters, onRemove }: Props) {
  const chips: { key: keyof MarketFilters; label: string }[] = [];
  if (filters.q.trim()) chips.push({ key: "q", label: `"${filters.q.trim()}"` });
  if (filters.day) chips.push({ key: "day", label: formatDateEs(filters.day) });
  if (filters.date !== "all" && !filters.day)
    chips.push({ key: "date", label: DATE_LABELS[filters.date] });
  if (filters.region !== "all") chips.push({ key: "region", label: filters.region });
  if (filters.municipality !== "all")
    chips.push({ key: "municipality", label: filters.municipality });
  if (filters.category !== "all")
    chips.push({ key: "category", label: filters.category });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <Chip key={c.key} label={c.label} onRemove={() => onRemove(c.key)} />
      ))}
    </div>
  );
}
