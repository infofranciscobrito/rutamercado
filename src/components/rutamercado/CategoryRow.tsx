import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { selectCategoryPreview } from "@/lib/category-preview";
import { PAGE_BY_CATEGORY } from "@/lib/category-pages";
import type { EnrichedMarket, MarketCategory } from "@/types/market";
import { MarketCard } from "./MarketCard";

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
  const description = PAGE_BY_CATEGORY.get(category)?.subtitle;

  return (
    <section
      style={{ background: alt ? "var(--category-gradient-alt)" : "var(--category-gradient)" }}
      aria-label={`Categoría ${category}`}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <h2 className="font-display text-4xl leading-tight text-category-heading sm:text-5xl">
            {category}
          </h2>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-category-caption">
              {description}
            </p>
          )}
          {ctaHref && ctaLabel && (
            <div className="mt-6">
              <Button asChild variant="category" className="h-auto min-h-10 max-w-full whitespace-normal px-5 py-2.5 text-center leading-5">
                <Link to={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
