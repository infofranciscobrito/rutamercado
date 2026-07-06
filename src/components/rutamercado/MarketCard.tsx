import { CalendarDays, Clock, MapPin, RefreshCcw, AlertTriangle } from "lucide-react";
import type { EnrichedMarket } from "@/types/market";
import { MarketImage } from "./MarketImage";
import { formatDateEs, formatTimeRange, isToday, isTomorrow } from "@/lib/format";

interface Props {
  market: EnrichedMarket;
  onClick: () => void;
  fixedWidth?: boolean;
}

export function MarketCard({ market, onClick, fixedWidth }: Props) {
  const nextDate = market.nextDate ?? market.recurrence_start_date;
  const today = isToday(nextDate);
  const tomorrow = !today && isTomorrow(nextDate);
  const label = market.recurrence_label?.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver detalles de ${market.name}`}
      className={`group flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-[250ms] ease-out rm-shadow-warm hover:-translate-y-1.5 hover:rm-shadow-warm-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54b678] focus-visible:ring-offset-2 ${
        fixedWidth ? "w-[280px] sm:w-[320px]" : "w-full"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#FFF8EC]">
        <MarketImage
          src={market.image_url}
          alt={market.name}
          objectPosition={`${market.focal_x ?? 50}% ${market.focal_y ?? 50}%`}
        />
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
        <h3 className="font-display rm-text-card-title text-[#18253f] line-clamp-2">
          {market.name}
        </h3>
        <div className="h-[2px] w-10 bg-[#54b678]" aria-hidden="true" />
        <div className="mt-1 space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-[#18253f]">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#54b678]" />
            <span>{formatDateEs(nextDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B7280]">
            <Clock className="h-4 w-4 shrink-0 text-[#54b678]" />
            <span>{formatTimeRange(market.nextStartTime ?? market.start_time, market.nextEndTime ?? market.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B7280]">
            <MapPin className="h-4 w-4 shrink-0 text-[#54b678]" />
            <span>
              {market.municipality}, {market.region}
            </span>
          </div>
        </div>
        {label && (
          <span
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "#FFF8EC",
              borderColor: "#54b678",
              color: "#92400E",
            }}
          >
            <RefreshCcw className="h-3 w-3" />
            {label}
          </span>
        )}
        {market.nextIsOverridden && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#2f7a4c]">
            <AlertTriangle className="h-3 w-3" />
            Fecha modificada{market.nextOverrideNote ? `: ${market.nextOverrideNote}` : ""}
          </span>
        )}
      </div>
    </button>
  );
}
