import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { selectCategoryPreview } from "@/lib/category-preview";
import type { EnrichedMarket, MarketCategory } from "@/types/market";
import { MarketCard } from "./MarketCard";
import { CategoryIcon } from "./icons/CategoryIcons";

interface Props {
  category: MarketCategory;
  markets: EnrichedMarket[];
  alt?: boolean;
  onSelect: (id: string) => void;
  ctaHref?: string;
  ctaLabel?: string;
}

export function CategoryRow({
  category,
  markets,
  alt,
  onSelect,
  ctaHref,
  ctaLabel,
}: Props) {
  const visible = useMemo(() => selectCategoryPreview(markets), [markets]);

  return (
    <section
      className={alt ? "bg-category-surface-alt" : "bg-category-surface"}
      aria-label={`Categoría ${category}`}
    >
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-12 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-center xl:gap-8">
        <div className="min-w-0">
          <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-action/15 text-brand-action">
            <CategoryIcon category={category} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-3xl leading-tight text-category-heading">
              {category}
            </h2>
            <p className="mt-3 text-sm text-category-caption">
              {markets.length} {markets.length === 1 ? "mercado" : "mercados"}
            </p>
          </div>
          {ctaHref && ctaLabel && (
            <div className="mb-5 mt-4">
              <Button asChild variant="category" className="h-auto min-h-10 max-w-full whitespace-normal px-5 py-2.5 text-center leading-5">
                <Link to={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-3">
          {visible.map((m, i) => (
            <div
              key={`${m.id}-${m.nextDate}`}
              className="min-w-0 rm-animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <MarketCard
                market={m}
                onClick={m.slug ? undefined : () => onSelect(m.id)}
                featured={Boolean(m.destacado)}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
