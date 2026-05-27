import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = (el.clientWidth - 80) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section
      className={alt ? "bg-[#FFF8EC]" : "bg-[#FAFAF8]"}
      aria-label={`Categoría ${category}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8b625]/15 text-[#d97706]">
              <CategoryIcon category={category} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-[#1c1e37]" style={{ fontSize: "clamp(1.3rem, 1.1rem + 1vw, 1.75rem)" }}>
                {category}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {markets.length} {markets.length === 1 ? "mercado" : "mercados"}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label={`Anterior en ${category}`}
              onClick={() => scrollBy(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1c1e37] transition-colors hover:border-[#f8b625] hover:text-[#d97706] sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              aria-label={`Siguiente en ${category}`}
              onClick={() => scrollBy(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1c1e37] transition-colors hover:border-[#f8b625] hover:text-[#d97706] sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 rm-no-scrollbar"
          style={{ scrollPaddingInline: "1rem" }}
        >
          {markets.map((m, i) => (
            <div
              key={m.id}
              className="snap-start rm-animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex flex-col items-start gap-3">
                <MarketCard market={m} onClick={() => onSelect(m.id)} fixedWidth />
                {i === 0 && ctaHref && ctaLabel && (
                  <Link
                    to={ctaHref}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#f8b625] px-5 text-sm font-semibold text-[#1c1e37] shadow-sm transition-all duration-200 hover:bg-[#f59e0b] hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(248,182,37,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b625] focus-visible:ring-offset-2"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      padding: "10px 20px",
                    }}
                  >
                    {ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
          <div className="w-2 shrink-0 sm:w-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

