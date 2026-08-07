import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation, Repeat } from "lucide-react";
import type { EnrichedMarket } from "@/types/market";
import { formatDateEs, formatTimeRange, googleMapsUrl } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import { track } from "@/components/rutamercado/MarketDetailContent";
import { TicketPerforation } from "./TicketPerforation";

/** Tarjeta "boleto de entrada" con los datos clave y acciones del mercado. */
export function MarketTicketCard({ market }: { market: EnrichedMarket }) {
  const date = market.nextDate ?? market.recurrence_start_date;

  const handleCalendar = () => {
    downloadIcs(market.slug ?? market.id, {
      uid: market.id,
      title: market.name,
      description: market.description,
      location: `${market.address}, ${market.municipality}, Puerto Rico`,
      date,
      startTime: market.nextStartTime ?? market.start_time,
      endTime: market.nextEndTime ?? market.end_time,
      url: market.slug
        ? `https://rutamercadopr.com/mercados/${market.slug}`
        : undefined,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white rm-shadow-warm">
      {/* Perforación lateral que conecta visualmente con el flyer */}
      <div className="pointer-events-none absolute inset-y-4 left-0 hidden lg:block">
        <TicketPerforation orientation="vertical" className="h-full" />
      </div>

      <div className="space-y-5 p-6 lg:pl-8">
        <span className="inline-block rounded-md bg-[#54b678] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#18253f] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          {market.category}
        </span>

        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
            <CalendarDays className="h-4 w-4 text-[#54b678]" />
            Próxima fecha
          </div>
          <p className="mt-1.5 font-display text-2xl leading-tight text-[#18253f]">
            {formatDateEs(date)}
          </p>
        </div>

        <div className="h-px bg-[#E5E7EB]" />

        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#54b678]" />
            <span className="text-[#18253f]">
              {formatTimeRange(
                market.nextStartTime ?? market.start_time,
                market.nextEndTime ?? market.end_time,
              )}
            </span>
          </li>
          {market.recurrence_label && (
            <li className="flex items-start gap-2.5">
              <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-[#54b678]" />
              <span className="text-[#18253f]">{market.recurrence_label}</span>
            </li>
          )}
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#54b678]" />
            <span className="text-[#18253f]">
              {market.address}
              <span className="block text-[#6B7280]">
                {market.municipality}, {market.region}
              </span>
            </span>
          </li>
        </ul>

        <div className="space-y-2.5 pt-1">
          <a
            href={googleMapsUrl(market.address, market.municipality)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(market.id, "click_directions")}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#18253f] text-base font-semibold text-white transition-colors hover:bg-[#2d3058]"
          >
            <Navigation className="h-5 w-5" />
            Cómo llegar
          </a>
          <button
            type="button"
            onClick={handleCalendar}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#54b678] text-base font-semibold text-[#18253f] transition-colors hover:bg-[#3f9560]"
          >
            <CalendarPlus className="h-5 w-5" />
            Agregar a mi calendario
          </button>
        </div>
      </div>
    </div>
  );
}
