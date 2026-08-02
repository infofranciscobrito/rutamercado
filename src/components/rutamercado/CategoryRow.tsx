import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  const visible = useMemo(() => {
    const sorted = [...markets].sort((a, b) => {
      // Featured markets lead the row; date order is preserved inside each group.
      const fa = a.destacado ? 0 : 1;
      const fb = b.destacado ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const da = a.nextDate ?? a.recurrence_start_date ?? "";
      const db = b.nextDate ?? b.recurrence_start_date ?? "";
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

    // Build a clean 4-column row: featured cards span 2 columns, normal cards 1.
    // Stop once the next card would overflow the 4-column grid or we hit 4 cards.
    const result: EnrichedMarket[] = [];
    let slots = 0;
    for (const m of sorted) {
      const need = m.destacado ? 2 : 1;
      if (slots + need > 4 || result.length >= 4) break;
      result.push(m);
      slots += need;
    }
    return result;
  }, [markets]);

  return (
    <section
      className={alt ? "bg-[#FFF8EC]" : "bg-[#FAFAF8]"}
      aria-label={`Categoría ${category}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#54b678]/15 text-[#2f7a4c]">
            <CategoryIcon category={category} className="h-5 w-5" />
          </span>
          <div>
            <h2
              className="font-display text-[#18253f]"
              style={{ fontSize: "clamp(1.3rem, 1.1rem + 1vw, 1.75rem)" }}
            >
              {category}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {markets.length} {markets.length === 1 ? "mercado" : "mercados"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((m, i) => (
            <div
              key={m.id}
              className={`rm-animate-fade-up ${
                m.destacado ? "lg:col-span-2" : ""
              }`}
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <MarketCard
                market={m}
                onClick={() => onSelect(m.id)}
                featured={Boolean(m.destacado)}
              />
            </div>
          ))}
        </div>

        {ctaHref && ctaLabel && (
          <div style={{ marginTop: "16px", marginBottom: "20px" }}>
            <Link
              to={ctaHref}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#54b678] px-5 text-sm font-semibold text-[#18253f] shadow-sm transition-all duration-200 hover:bg-[#3f9560] hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(84,182,120,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54b678] focus-visible:ring-offset-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                padding: "10px 20px",
              }}
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
