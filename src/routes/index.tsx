import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { listMarkets } from "@/lib/markets.functions";
import { trackPageView } from "@/lib/analytics.functions";
import {
  applyFilters,
  defaultFilters,
  hasActiveFilters,
  type MarketFilters,
} from "@/lib/market-filters";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import { Header } from "@/components/rutamercado/Header";
import { FilterBar } from "@/components/rutamercado/FilterBar";
import { MarketGrid } from "@/components/rutamercado/MarketGrid";
import { EmptyState } from "@/components/rutamercado/EmptyState";
import { MarketDetailDialog } from "@/components/rutamercado/MarketDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";

const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => listMarkets(),
});

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

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border">
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
  };

  type S = z.infer<typeof searchSchema>;
  const updateFilters = (next: Partial<MarketFilters>) => {
    void navigate({
      search: (prev: S) => ({ ...prev, ...next }),
      replace: true,
    });
  };

  const clearFilters = () => {
    void navigate({
      search: (prev: S) => ({ ...defaultFilters, market: prev.market }),
      replace: true,
    });
  };

  const openMarket = (id: string) => {
    void navigate({ search: (prev: S) => ({ ...prev, market: id }) });
  };
  const closeMarket = () => {
    void navigate({
      search: (prev: S) => ({ ...prev, market: undefined }),
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
      />
      <Suspense fallback={
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <GridSkeleton />
        </main>
      }>
        <MarketsContent
          filters={filters}
          selectedId={search.market}
          onSelect={openMarket}
          onClose={closeMarket}
          onClear={clearFilters}
        />
      </Suspense>
    </div>
  );
}

function MarketsContent({
  filters,
  selectedId,
  onSelect,
  onClose,
  onClear,
}: {
  filters: MarketFilters;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const { data: markets } = useSuspenseQuery(marketsQueryOptions);
  const filtered = useMemo(() => applyFilters(markets, filters), [markets, filters]);
  const selected = selectedId
    ? markets.find((m) => m.id === selectedId) ?? null
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="mb-4 text-sm text-muted-foreground">
        Mostrando {filtered.length}{" "}
        {filtered.length === 1 ? "mercado" : "mercados"}
      </p>
      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters(filters) || markets.length > 0}
          onClear={onClear}
        />
      ) : (
        <MarketGrid markets={filtered} onSelect={onSelect} />
      )}
      <MarketDetailDialog
        market={selected}
        open={!!selected}
        onClose={onClose}
      />
    </main>
  );
}
