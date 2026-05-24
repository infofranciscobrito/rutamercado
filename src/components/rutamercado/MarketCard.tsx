import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Market } from "@/types/market";
import { MarketImage } from "./MarketImage";
import { formatDateEs, formatTimeRange, frequencyLabel } from "@/lib/format";

interface Props {
  market: Market;
  onClick: () => void;
}

export function MarketCard({ market, onClick }: Props) {
  const freq = frequencyLabel(market.frequency, market.event_date);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b625]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <MarketImage src={market.image_url} alt={market.name} />
        <span className="absolute left-3 top-3 rounded-md bg-[#f8b625] px-2 py-1 text-xs font-bold text-[#1c1e37]">
          {market.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-[18px] leading-tight text-[#1c1e37]">
          {market.name}
        </h3>
        <div className="mt-1 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatDateEs(market.event_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatTimeRange(market.start_time, market.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {market.municipality}, {market.region}
            </span>
          </div>
        </div>
        {freq && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full border border-[#f8b625] px-2.5 py-0.5 text-xs font-medium text-[#f8b625]">
            {freq}
          </span>
        )}
      </div>
    </button>
  );
}
