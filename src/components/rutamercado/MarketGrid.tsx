import type { Market } from "@/types/market";
import { MarketCard } from "./MarketCard";
import { parseEventDate } from "@/lib/market-filters";

interface Props {
  markets: Market[];
  onSelect: (id: string) => void;
}

export function MarketGrid({ markets, onSelect }: Props) {
  const sorted = [...markets].sort(
    (a, b) =>
      parseEventDate(a.event_date).getTime() -
      parseEventDate(b.event_date).getTime(),
  );
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((m, i) => (
        <div
          key={m.id}
          className="rm-animate-fade-up"
          style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
        >
          <MarketCard market={m} onClick={() => onSelect(m.id)} />
        </div>
      ))}
    </div>
  );
}
