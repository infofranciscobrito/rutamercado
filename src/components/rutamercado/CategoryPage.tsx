import { Suspense, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { listMarkets } from "@/lib/markets.functions";
import { trackPageView } from "@/lib/analytics.functions";
import {
  applyFilters,
  defaultFilters,
  hasActiveFilters,
  type MarketFilters,
} from "@/lib/market-filters";
import type { EnrichedMarket } from "@/types/market";
import type { CategoryPageConfig } from "@/lib/category-pages";
import { Header } from "./Header";
import { FilterBar } from "./FilterBar";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { MarketGrid } from "./MarketGrid";
import { MarketDetailDialog } from "./MarketDetailDialog";
import { AboutSection } from "./AboutSection";
import { Footer } from "./Footer";
import { SkeletonGrid } from "./SkeletonCard";
import { CategoryIcon } from "./icons/CategoryIcons";
import { Button } from "@/components/ui/button";

const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => listMarkets(),
});

export interface CategoryPageSearch {
  q: string;
  date: MarketFilters["date"];
  region: MarketFilters["region"];
  municipality: string;
  day?: string;
  market?: string;
}

interface Props {
  config: CategoryPageConfig;
  search: CategoryPageSearch;
  routeFrom:
    | "/mercados-agricolas"
    | "/bazares"
    | "/ferias-artesanales"
    | "/food-market"
    | "/mercados-mixtos"
    | "/flea-market";
}

export function CategoryPage({ config, search, routeFrom }: Props) {
  const navigate = useNavigate({ from: routeFrom });

  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackPageView({
      data: {
        page: config.pageViewKey,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
      },
    }).catch(() => {});
  }, [config.pageViewKey]);

  const filters: MarketFilters = {
    q: search.q,
    date: search.date,
    region: search.region,
    municipality: search.municipality,
    category: "all",
    day: search.day,
  };

  type S = CategoryPageSearch;
  const updateFilters = (next: Partial<MarketFilters>) => {
    void navigate({
      search: (prev) => {
        const { category: _ignore, ...rest } = next;
        void _ignore;
        return { ...prev, ...rest } as S;
      },
      replace: true,
    });
  };

  const clearFilters = () => {
    void navigate({
      search: (prev) =>
        ({
          q: defaultFilters.q,
          date: defaultFilters.date,
          region: defaultFilters.region,
          municipality: defaultFilters.municipality,
          day: undefined,
          market: prev.market,
        }) as S,
      replace: true,
    });
  };

  const removeFilter = (key: keyof MarketFilters) => {
    const reset: Partial<MarketFilters> = {};
    if (key === "q") reset.q = "";
    else if (key === "date") reset.date = "all";
    else if (key === "region") reset.region = "all";
    else if (key === "municipality") reset.municipality = "all";
    else if (key === "day") reset.day = undefined;
    updateFilters(reset);
  };

  const openMarket = (id: string) => {
    void navigate({ search: (prev) => ({ ...prev, market: id }) as S });
  };
  const closeMarket = () => {
    void navigate({
      search: (prev) => ({ ...prev, market: undefined }) as S,
      replace: true,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <Header />
      <Suspense
        fallback={
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
              <SkeletonGrid count={6} />
            </div>
          </main>
        }
      >
        <Content
          config={config}
          filters={filters}
          query={search.q}
          onQueryChange={(q) => updateFilters({ q })}
          onChangeFilters={updateFilters}
          onClear={clearFilters}
          onRemove={removeFilter}
          selectedId={search.market}
          onSelect={openMarket}
          onClose={closeMarket}
        />
      </Suspense>
      <AboutSection />
      <Footer />
    </div>
  );
}

function Content({
  config,
  filters,
  onChangeFilters,
  onClear,
  onRemove,
  selectedId,
  onSelect,
  onClose,
}: {
  config: CategoryPageConfig;
  filters: MarketFilters;
  query: string;
  onQueryChange: (q: string) => void;
  onChangeFilters: (next: Partial<MarketFilters>) => void;
  onClear: () => void;
  onRemove: (key: keyof MarketFilters) => void;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { data: allMarkets } = useSuspenseQuery(marketsQueryOptions);

  const inCategory = useMemo<EnrichedMarket[]>(
    () => allMarkets.filter((m) => m.category === config.category),
    [allMarkets, config.category],
  );

  const availableDays = useMemo(() => {
    const set = new Set<string>();
    for (const m of inCategory) for (const u of m.upcoming) set.add(u.date);
    return set;
  }, [inCategory]);

  const municipalities = useMemo(
    () => Array.from(new Set(inCategory.map((m) => m.municipality))).sort((a, b) => a.localeCompare(b, "es")),
    [inCategory],
  );

  const filtered = useMemo(() => {
    const list = applyFilters(inCategory, { ...filters, category: "all" });
    return [...list].sort((a, b) => {
      const fa = a.destacado ? 0 : 1;
      const fb = b.destacado ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return (a.nextDate ?? "") < (b.nextDate ?? "")
        ? -1
        : (a.nextDate ?? "") > (b.nextDate ?? "")
          ? 1
          : 0;
    });
  }, [inCategory, filters]);


  const selected = selectedId
    ? allMarkets.find((m) => m.id === selectedId) ?? null
    : null;

  useEffect(() => {
    if (selectedId && !selected) {
      toast.info(
        "Este mercado ya no está disponible. Descubre otros mercados en nuestro directorio.",
      );
      onClose();
    }
  }, [selectedId, selected, onClose]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-sm text-[#6B7280]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Link to="/" className="hover:text-[#18253f]">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
          <span className="text-[#18253f]">{config.pageTitle}</span>
        </nav>
      </div>

      {/* Title block */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-2 pt-6 sm:px-6">
        <h1
          className="font-display text-[#18253f]"
          style={{ fontSize: "clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)" }}
        >
          {config.pageTitle}
        </h1>
        <p
          className="mt-3 max-w-[600px] text-base text-[#6B7280]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {config.subtitle}
        </p>
        <p
          className="mt-2 text-sm text-[#6B7280]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {filtered.length} {filtered.length === 1 ? "mercado disponible" : "mercados disponibles"}
        </p>
      </div>

      <FilterBar
        filters={filters}
        availableDays={availableDays}
        municipalities={municipalities}
        onChange={onChangeFilters}
        onClear={onClear}
        hideCategory
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <ActiveFilterChips filters={filters} onRemove={onRemove} />
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center rm-shadow-warm">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#54b678]/15 text-[#2f7a4c]">
                <CategoryIcon category={config.category} className="h-10 w-10" />
              </span>
              <h2 className="mt-6 font-display text-2xl text-[#18253f]">
                {hasActiveFilters(filters)
                  ? "No encontramos mercados con esos filtros"
                  : config.emptyText}
              </h2>
              <p className="mt-2 max-w-md text-base text-[#6B7280]">
                {hasActiveFilters(filters)
                  ? "Intenta cambiar los filtros o limpiar la búsqueda."
                  : "Vuelve pronto, estamos actualizando el directorio constantemente"}
              </p>
              {hasActiveFilters(filters) ? (
                <Button
                  onClick={onClear}
                  variant="outline"
                  className="mt-6 h-12 border-[#54b678] px-6 text-base font-semibold text-[#2f7a4c] hover:bg-[#FEF3C7] hover:text-[#2f7a4c]"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link
                  to="/"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-base font-semibold text-[#18253f] hover:bg-[#3f9560]"
                >
                  Volver al directorio
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <MarketGrid markets={filtered} onSelect={onSelect} highlightFeatured />
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
