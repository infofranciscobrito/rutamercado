import type { EnrichedMarket } from "@/types/market";
import { MarketCard } from "./MarketCard";

interface Props {
  markets: EnrichedMarket[];
  onSelect: (id: string) => void;
  /** Opt-in: resalta las fichas con `destacado = true` (páginas de categoría). */
  highlightFeatured?: boolean;
}

export function MarketGrid({ markets, onSelect, highlightFeatured }: Props) {
  // Featured markets always render first as a group; ties keep the incoming order.
  const ordered = highlightFeatured
    ? [...markets].sort((a, b) => Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)))
    : markets;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((m, i) => {
        const featured = highlightFeatured ? Boolean(m.destacado) : false;
        return (
          <div
            key={m.id}
            className={`rm-animate-fade-up ${featured ? "sm:col-span-2" : ""}`}
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
          >
            <MarketCard market={m} onClick={m.slug ? undefined : () => onSelect(m.id)} featured={featured} />
          </div>
        );
      })}
    </div>
  );
}
