import type { EnrichedMarket } from "@/types/market";
import { MarketCard } from "./MarketCard";

/** Carrusel horizontal de mercados relacionados. */
export function RelatedMarkets({ markets }: { markets: EnrichedMarket[] }) {
  if (!markets || markets.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl text-[#18253f]">
        Otros mercados que te pueden interesar
      </h2>
      <div className="h-[3px] w-12 bg-[#54b678]" aria-hidden="true" />
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-4">
        {markets.map((m) => (
          <div key={m.id} className="snap-start lg:contents">
            <MarketCard market={m} fixedWidth />
          </div>
        ))}
      </div>
    </section>
  );
}
