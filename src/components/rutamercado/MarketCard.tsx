import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Market } from "@/types/market";
import { MarketImage } from "./MarketImage";
import {
  formatDateEs,
  formatTimeRange,
  frequencyLabel,
  isToday,
  isTomorrow,
} from "@/lib/format";

interface Props {
  market: Market;
  onClick: () => void;
  fixedWidth?: boolean;
}

export function MarketCard({ market, onClick, fixedWidth }: Props) {
  const freq = frequencyLabel(market.frequency, market.event_date);
  const today = isToday(market.event_date);
  const tomorrow = !today && isTomorrow(market.event_date);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver detalles de ${market.name}`}
      className={`group flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-[250ms] ease-out rm-shadow-warm hover:-translate-y-1.5 hover:rm-shadow-warm-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b625] focus-visible:ring-offset-2 ${
        fixedWidth ? "w-[280px] sm:w-[320px]" : "w-full"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#FFF8EC]">
        <MarketImage src={market.image_url} alt={market.name} />
        <span className="absolute left-3 top-3 rounded-md bg-[#f8b625] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1c1e37] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          {market.category}
        </span>
        {today && (
          <span className="absolute right-3 top-3 rounded-md bg-[#22C55E] px-2 py-1 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] rm-animate-pulse-soft">
            HOY
          </span>
        )}
        {tomorrow && (
          <span className="absolute right-3 top-3 rounded-md bg-[#3B82F6] px-2 py-1 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            MAÑANA
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <h3 className="font-display rm-text-card-title text-[#1c1e37] line-clamp-2">
          {market.name}
        </h3>
        <div className="h-[2px] w-10 bg-[#f8b625]" aria-hidden="true" />
        <div className="mt-1 space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-[#1c1e37]">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#f8b625]" />
            <span>{formatDateEs(market.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B7280]">
            <Clock className="h-4 w-4 shrink-0 text-[#f8b625]" />
            <span>{formatTimeRange(market.start_time, market.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B7280]">
            <MapPin className="h-4 w-4 shrink-0 text-[#f8b625]" />
            <span>
              {market.municipality}, {market.region}
            </span>
          </div>
        </div>
        {freq && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full border border-[#f8b625] px-2.5 py-0.5 text-xs font-medium text-[#d97706]">
            {freq}
          </span>
        )}
      </div>
    </button>
  );
}
