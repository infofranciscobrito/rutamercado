import type { EnrichedMarket, MarketCategory, MarketRegion } from "@/types/market";

export type DateFilter = "today" | "week" | "month" | "all";

export interface MarketFilters {
  q: string;
  date: DateFilter;
  region: MarketRegion | "all";
  municipality: string;
  category: MarketCategory | "all";
  day?: string;
}

export const defaultFilters: MarketFilters = {
  q: "",
  date: "all",
  region: "all",
  municipality: "all",
  category: "all",
  day: undefined,
};

export function parseEventDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function applyFilters(
  markets: EnrichedMarket[],
  filters: MarketFilters,
): EnrichedMarket[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const q = filters.q.trim().toLowerCase();

  return markets.filter((m) => {
    if (q) {
      const hay = `${m.name} ${m.municipality}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.region !== "all" && m.region !== filters.region) return false;
    if (filters.municipality !== "all" && m.municipality !== filters.municipality) return false;
    if (filters.category !== "all" && m.category !== filters.category) return false;

    if (filters.day) {
      if (!m.upcoming.some((u) => u.date === filters.day)) return false;
    } else if (filters.date !== "all") {
      const matches = m.upcoming.some((u) => {
        const ed = parseEventDate(u.date);
        if (filters.date === "today") return ed.getTime() === today.getTime();
        if (filters.date === "week") return ed >= today && ed <= weekEnd;
        if (filters.date === "month")
          return (
            ed.getFullYear() === today.getFullYear() &&
            ed.getMonth() === today.getMonth()
          );
        return true;
      });
      if (!matches) return false;
    }
    return true;
  });
}

export function hasActiveFilters(f: MarketFilters): boolean {
  return (
    f.q.trim() !== "" ||
    f.date !== "all" ||
    f.region !== "all" ||
    f.municipality !== "all" ||
    f.category !== "all" ||
    !!f.day
  );
}
