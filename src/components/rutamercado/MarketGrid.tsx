import type { EnrichedMarket } from "@/types/market";
import { MarketCard } from "./MarketCard";

interface Props {
  markets: EnrichedMarket[];
  onSelect: (id: string) => void;
  /** Opt-in: resalta las fichas con `destacado = true` (páginas de categoría). */
  highlightFeatured?: boolean;
}

export function MarketGrid({ markets, onSelect, highlightFeatured }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((m, i) => (
        <div
          key={m.id}
          className="rm-animate-fade-up"
          style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
        >
          <MarketCard
            market={m}
            onClick={() => onSelect(m.id)}
            featured={highlightFeatured ? Boolean(m.destacado) : false}
          />
        </div>
      ))}
    </div>
  );
}
