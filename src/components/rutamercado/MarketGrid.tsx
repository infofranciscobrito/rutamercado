import type { Market } from "@/types/market";
import { MarketCard } from "./MarketCard";

interface Props {
  markets: Market[];
  onSelect: (id: string) => void;
}

export function MarketGrid({ markets, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((m) => (
        <MarketCard key={m.id} market={m} onClick={() => onSelect(m.id)} />
      ))}
    </div>
  );
}
