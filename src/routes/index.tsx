import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { listMarkets } from "@/lib/markets.functions";
import { trackPageView } from "@/lib/analytics.functions";
import {
  applyFilters,
  defaultFilters,
  hasActiveFilters,
  type MarketFilters,
} from "@/lib/market-filters";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import type { EnrichedMarket, MarketCategory } from "@/types/market";
import { Header } from "@/components/rutamercado/Header";
import { Hero } from "@/components/rutamercado/Hero";
import { FilterBar } from "@/components/rutamercado/FilterBar";
import { ActiveFilterChips } from "@/components/rutamercado/ActiveFilterChips";
import { ViewToggle, type ViewMode } from "@/components/rutamercado/ViewToggle";
import { CategoryRow } from "@/components/rutamercado/CategoryRow";
import { MarketGrid } from "@/components/rutamercado/MarketGrid";
import { EmptyState } from "@/components/rutamercado/EmptyState";
import { MarketDetailDialog } from "@/components/rutamercado/MarketDetailDialog";
import { AboutSection } from "@/components/rutamercado/AboutSection";
import { Footer } from "@/components/rutamercado/Footer";
import { SkeletonGrid } from "@/components/rutamercado/SkeletonCard";

const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => listMarkets(),
});

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  date: fallback(z.enum(["today", "week", "month", "all"]), "all").default("all"),
  region: fallback(
    z.enum(["all", ...MARKET_REGIONS] as [string, ...string[]]),
    "all",
  ).default("all"),
  category: fallback(
    z.enum(["all", ...MARKET_CATEGORIES] as [string, ...string[]]),
    "all",
  ).default("all"),
  day: fallback(z.string().regex(ISO_DAY).optional(), undefined),
  market: fallback(z.string().uuid().optional(), undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "RutaMercado — Directorio de Mercados Locales en Puerto Rico" },
      {
        name: "description",
        content:
          "Descubre los mercados locales, ferias artesanales, bazares y mercados agrícolas en Puerto Rico. Encuentra el mercado más cercano a ti.",
      },
      { property: "og:title", content: "RutaMercado — Directorio de Mercados Locales en Puerto Rico" },
      {
        property: "og:description",
        content:
          "Descubre los mercados locales, ferias artesanales, bazares y mercados agrícolas en Puerto Rico. Encuentra el mercado más cercano a ti.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:title", content: "RutaMercado — Mercados Locales en Puerto Rico" },
      {
        name: "twitter:description",
        content:
          "Descubre los mercados locales, ferias artesanales, bazares y mercados agrícolas en Puerto Rico.",
      },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(marketsQueryOptions),
  component: IndexPage,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">Página no encontrada</div>
  ),
});

function IndexPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  // Page view (StrictMode-safe)
  const pageViewSent = useRef(false);
  useEffect(() => {
    if (pageViewSent.current) return;
    pageViewSent.current = true;
    void trackPageView({
      data: {
        page: "/",
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
      },
    }).catch(() => {});
  }, []);

  const filters: MarketFilters = {
    q: search.q,
    date: search.date,
    region: search.region as MarketFilters["region"],
    category: search.category as MarketFilters["category"],
    day: search.day,
  };

  type S = z.infer<typeof searchSchema>;
  const updateFilters = (next: Partial<MarketFilters>) => {
    void navigate({
      search: (prev: S) => ({ ...prev, ...next }) as S,
      replace: true,
    });
  };

  const clearFilters = () => {
    void navigate({
      search: (prev: S) => ({ ...defaultFilters, market: prev.market }) as S,
      replace: true,
    });
  };

  const removeFilter = (key: keyof MarketFilters) => {
    const reset: Partial<MarketFilters> = {};
    if (key === "q") reset.q = "";
    else if (key === "date") reset.date = "all";
    else if (key === "region") reset.region = "all";
    else if (key === "category") reset.category = "all";
    else if (key === "day") reset.day = undefined;
    updateFilters(reset);
  };

  const openMarket = (id: string) => {
    void navigate({ search: (prev: S) => ({ ...prev, market: id }) as S });
  };
  const closeMarket = () => {
    void navigate({
      search: (prev: S) => ({ ...prev, market: undefined }) as S,
      replace: true,
    });
  };

  const switchToWeek = () =>
    updateFilters({ date: "week", day: undefined });

  // View mode (persisted)
  const [viewMode, setViewMode] = useState<ViewMode>("category");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rm-view-mode");
      if (saved === "grid" || saved === "category") setViewMode(saved);
    } catch {
      /* noop */
    }
  }, []);
  const setView = (m: ViewMode) => {
    setViewMode(m);
    try {
      localStorage.setItem("rm-view-mode", m);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <Header />
      <Suspense
        fallback={
          <>
            <Hero
              query={search.q}
              onQueryChange={(q) => updateFilters({ q })}
              stats={{ markets: 0, municipalities: 0, categories: 0 }}
            />
            <main className="flex-1">
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <SkeletonGrid count={8} />
              </div>
            </main>
          </>
        }
      >
        <MarketsContent
          filters={filters}
          query={search.q}
          onQueryChange={(q) => updateFilters({ q })}
          onChangeFilters={updateFilters}
          onClear={clearFilters}
          onRemove={removeFilter}
          selectedId={search.market}
          onSelect={openMarket}
          onClose={closeMarket}
          onSwitchToWeek={switchToWeek}
          viewMode={viewMode}
          onViewChange={setView}
        />
      </Suspense>
      <AboutSection />
      <Footer />
    </div>
  );
}

function MarketsContent({
  filters,
  query,
  onQueryChange,
  onChangeFilters,
  onClear,
  onRemove,
  selectedId,
  onSelect,
  onClose,
  onSwitchToWeek,
  viewMode,
  onViewChange,
}: {
  filters: MarketFilters;
  query: string;
  onQueryChange: (q: string) => void;
  onChangeFilters: (next: Partial<MarketFilters>) => void;
  onClear: () => void;
  onRemove: (key: keyof MarketFilters) => void;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
  onSwitchToWeek: () => void;
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  const { data: markets } = useSuspenseQuery(marketsQueryOptions);

  const stats = useMemo(() => {
    const muni = new Set(markets.map((m) => m.municipality));
    const cats = new Set(markets.map((m) => m.category));
    return {
      markets: markets.length,
      municipalities: muni.size,
      categories: cats.size,
    };
  }, [markets]);

  const availableDays = useMemo(() => {
    const set = new Set<string>();
    for (const m of markets) for (const u of m.upcoming) set.add(u.date);
    return set;
  }, [markets]);

  const filtered = useMemo(
    () => applyFilters(markets, filters),
    [markets, filters],
  );

  const selected = selectedId
    ? markets.find((m) => m.id === selectedId) ?? null
    : null;

  // Group by category, preserving the canonical category order
  const grouped = useMemo(() => {
    const map = new Map<MarketCategory, EnrichedMarket[]>();
    for (const m of filtered) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return MARKET_CATEGORIES.filter((c) => map.has(c)).map((c) => ({
      category: c,
      markets: map.get(c)!,
    }));
  }, [filtered]);

  return (
    <>
      <Hero query={query} onQueryChange={onQueryChange} stats={stats} />

      <FilterBar
        filters={filters}
        availableDays={availableDays}
        onChange={onChangeFilters}
        onClear={onClear}
      />

      <main className="flex-1">
        {/* Results bar */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[#6B7280]">
                Mostrando <span className="font-semibold text-[#1c1e37]">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "mercado" : "mercados"}
              </p>
              <ActiveFilterChips filters={filters} onRemove={onRemove} />
            </div>
            <div className="hidden sm:block">
              <ViewToggle value={viewMode} onChange={onViewChange} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <EmptyState
              hasFilters={hasActiveFilters(filters)}
              onClear={onClear}
              isTodayFilter={filters.date === "today" && !filters.day}
              onSwitchToWeek={onSwitchToWeek}
              filterSummary={describeFilters(filters)}
            />
          </div>
        ) : viewMode === "grid" ? (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <MarketGrid markets={filtered} onSelect={onSelect} />
          </div>
        ) : (
          <div>
            {grouped.map((g, i) => (
              <CategoryRow
                key={g.category}
                category={g.category}
                markets={g.markets}
                alt={i % 2 === 1}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        <MarketDetailDialog
          market={selected}
          open={!!selected}
          onClose={onClose}
        />
      </main>
    </>
  );
}

