import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { marketsQueryOptions } from "@/lib/markets-query";
import { trackPageView } from "@/lib/analytics.functions";
import { CATEGORY_PARAM_TO_SLUG } from "@/lib/category-pages";
import { redirectLegacyMarket } from "@/lib/category-route-helpers";
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
import { IntroSEO } from "@/components/rutamercado/IntroSEO";
import { FilterBar } from "@/components/rutamercado/FilterBar";
import { ActiveFilterChips } from "@/components/rutamercado/ActiveFilterChips";
import { ViewToggle, type ViewMode } from "@/components/rutamercado/ViewToggle";
import { CategoryRow } from "@/components/rutamercado/CategoryRow";
import { PAGE_BY_CATEGORY } from "@/lib/category-pages";
import { MarketGrid } from "@/components/rutamercado/MarketGrid";
import { EmptyState } from "@/components/rutamercado/EmptyState";
import { MarketDetailDialog } from "@/components/rutamercado/MarketDetailDialog";
import { AboutSection } from "@/components/rutamercado/AboutSection";
import { ContactSection } from "@/components/rutamercado/ContactSection";
import { Footer } from "@/components/rutamercado/Footer";
import { SkeletonGrid } from "@/components/rutamercado/SkeletonCard";


const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const DATE_LABELS: Record<MarketFilters["date"], string> = {
  today: "hoy",
  week: "esta semana",
  month: "este mes",
  all: "",
};

function describeFilters(f: MarketFilters): string | undefined {
  const parts: string[] = [];
  if (f.q.trim()) parts.push(`"${f.q.trim()}"`);
  if (f.category !== "all") parts.push(`categoría: ${f.category}`);
  if (f.region !== "all") parts.push(`región: ${f.region}`);
  if (f.municipality !== "all") parts.push(`municipio: ${f.municipality}`);
  if (f.day) parts.push(`día: ${f.day}`);
  else if (f.date !== "all") parts.push(DATE_LABELS[f.date]);
  return parts.length ? parts.join(", ") : undefined;
}

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  date: fallback(z.enum(["today", "week", "month", "all"]), "all").default("all"),
  region: fallback(
    z.enum(["all", ...MARKET_REGIONS] as [string, ...string[]]),
    "all",
  ).default("all"),
  municipality: fallback(z.string(), "all").default("all"),
  category: fallback(
    z.enum(["all", ...MARKET_CATEGORIES] as [string, ...string[]]),
    "all",
  ).default("all"),
  day: fallback(z.string().regex(ISO_DAY).optional(), undefined),
  market: fallback(z.string().uuid().optional(), undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  beforeLoad: async ({ search }) => {
    const cat = search.category;
    if (cat && cat !== "all") {
      const slug = CATEGORY_PARAM_TO_SLUG[cat];
      if (slug) {
        throw redirect({ to: `/${slug}` as "/", statusCode: 301 });
      }
    }
    await redirectLegacyMarket(search.market);
  },

  head: ({ loaderData }: { loaderData?: EnrichedMarket[] }) => {
    const title = "Mercados Locales en Puerto Rico | RutaMercado";
    const description =
      "Descubre todos los mercados locales, ferias artesanales, bazares y mercados agrícolas activos en Puerto Rico. Encuentra el mercado más cercano por región, fecha y categoría — actualizado semanalmente.";
    const items = (loaderData ?? [])
      .filter((m) => m.slug && m.nextDate)
      .slice(0, 50)
      .map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.name,
        url: `https://rutamercadopr.com/mercados/${m.slug}`,
      }));

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://rutamercadopr.com/" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "RutaMercado" },
        { property: "og:image", content: "https://rutamercadopr.com/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://rutamercadopr.com/og-image.png" },
      ],
      links: [{ rel: "canonical", href: "https://rutamercadopr.com/" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: "https://rutamercadopr.com/",
            mainEntity: {
              "@type": "ItemList",
              name: "Mercados locales en Puerto Rico",
              numberOfItems: items.length,
              itemListElement: items,
            },
          }),
        },
      ],
    };
  },
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
    municipality: search.municipality,
    category: search.category as MarketFilters["category"],
    day: search.day,
  };

  type S = z.infer<typeof searchSchema>;
  const updateFilters = (next: Partial<MarketFilters>) => {
    // If category is set to a specific value, navigate to its clean route
    if (next.category && next.category !== "all") {
      const slug = CATEGORY_PARAM_TO_SLUG[next.category];
      if (slug) {
        void navigate({ to: `/${slug}` as "/" });
        return;
      }
    }
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
    else if (key === "municipality") reset.municipality = "all";
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
      <ContactSection />
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

  const municipalities = useMemo(
    () => Array.from(new Set(markets.map((m) => m.municipality))).sort((a, b) => a.localeCompare(b, "es")),
    [markets],
  );

  const filtered = useMemo(
    () => applyFilters(markets, filters),
    [markets, filters],
  );

  const selected = selectedId
    ? markets.find((m) => m.id === selectedId) ?? null
    : null;

  useEffect(() => {
    if (selectedId && !selected) {
      toast.info(
        "Este mercado ya no está disponible. Descubre otros mercados en nuestro directorio.",
      );
      onClose();
    }
  }, [selectedId, selected, onClose]);

  // Group by category, preserving the canonical category order
  const grouped = useMemo(() => {
    const map = new Map<MarketCategory, EnrichedMarket[]>();
    for (const m of filtered) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return MARKET_CATEGORIES.filter((c) => map.has(c))
      .map((c) => ({
        category: c,
        markets: map.get(c)!,
      }))
      // Categorías con más mercados primero; las de menos quedan al final.
      .sort((a, b) => b.markets.length - a.markets.length);
  }, [filtered]);

  return (
    <>
      <Hero query={query} onQueryChange={onQueryChange} stats={stats} />

      <IntroSEO />



      <FilterBar
        filters={filters}
        availableDays={availableDays}
        municipalities={municipalities}
        onChange={onChangeFilters}
        onClear={onClear}
      />

      <main className="flex-1">
        {/* Results bar */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[#6B7280]">
                Mostrando <span className="font-semibold text-[#18253f]">{filtered.length}</span>{" "}
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
            {grouped.map((g, i) => {
              const cfg = PAGE_BY_CATEGORY.get(g.category);
              return (
                <CategoryRow
                  key={g.category}
                  category={g.category}
                  markets={g.markets}
                  alt={i % 2 === 1}
                  onSelect={onSelect}
                  ctaHref={cfg ? `/${cfg.slug}` : undefined}
                  ctaLabel={cfg?.ctaLabel}
                />
              );
            })}
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

