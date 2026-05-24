import type { Market, MarketCategory, MarketRegion } from "@/types/market";

export type DateFilter = "today" | "week" | "month" | "all";

export interface MarketFilters {
  q: string;
  date: DateFilter;
  region: MarketRegion | "all";
  category: MarketCategory | "all";
}

export const defaultFilters: MarketFilters = {
  q: "",
  date: "all",
  region: "all",
  category: "all",
};

function parseEventDate(s: string): Date {
  // event_date is "YYYY-MM-DD" — parse as local date (avoid UTC shift)
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function applyFilters(markets: Market[], filters: MarketFilters): Market[] {
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
    if (filters.category !== "all" && m.category !== filters.category) return false;

    if (filters.date !== "all") {
      const ed = parseEventDate(m.event_date);
      if (filters.date === "today") {
        if (ed.getTime() !== today.getTime()) return false;
      } else if (filters.date === "week") {
        if (ed < today || ed > weekEnd) return false;
      } else if (filters.date === "month") {
        if (
          ed.getFullYear() !== today.getFullYear() ||
          ed.getMonth() !== today.getMonth()
        )
          return false;
      }
    }
    return true;
  });
}

export function hasActiveFilters(f: MarketFilters): boolean {
  return (
    f.q.trim() !== "" ||
    f.date !== "all" ||
    f.region !== "all" ||
    f.category !== "all"
  );
}
