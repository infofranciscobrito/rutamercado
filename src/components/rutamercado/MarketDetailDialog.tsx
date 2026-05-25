import {
  CalendarDays,
  Clock,
  Instagram,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Repeat,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { EnrichedMarket } from "@/types/market";
import { MarketImage } from "./MarketImage";
import {
  formatDateEs,
  formatTimeRange,
  googleMapsUrl,
  instagramUrl,
} from "@/lib/format";
import {
  incrementMarketView,
  trackMarketClick,
} from "@/lib/analytics.functions";

interface Props {
  market: EnrichedMarket | null;
  open: boolean;
  onClose: () => void;
}

function track(marketId: string, clickType: string) {
  void trackMarketClick({ data: { marketId, clickType } }).catch(() => {});
}

function MiniFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#FFF8EC] p-3.5">
      <div className="text-[#f8b625]">{icon}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-[#6B7280]">
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold text-[#1c1e37]">
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
      {children}
    </h3>
  );
}

type Orientation = "landscape" | "portrait" | "square";

export function MarketDetailDialog({ market, open, onClose }: Props) {
  const trackedRef = useRef<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  useEffect(() => {
    setOrientation("landscape");
  }, [market?.id]);

  useEffect(() => {
    if (!open || !market) return;
    if (trackedRef.current === market.id) return;
    trackedRef.current = market.id;
    void incrementMarketView({ data: { marketId: market.id } }).catch(() => {});
    track(market.id, "view_detail");
  }, [open, market]);

  useEffect(() => {
    if (!open) trackedRef.current = null;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent
        className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl
                   max-w-full sm:max-w-[600px]
                   max-h-[100dvh] sm:max-h-[90vh]
                   rounded-none sm:rounded-[20px]
                   data-[state=open]:duration-[250ms]"
      >
        {market && (
          <div className="flex max-h-[100dvh] flex-col overflow-y-auto sm:max-h-[90vh]">
            <div
              className={`relative w-full shrink-0 overflow-hidden rounded-t-none sm:rounded-t-[20px] max-h-[50vh] ${
                orientation === "portrait"
                  ? "sm:max-h-[500px]"
                  : orientation === "square"
                    ? "sm:max-h-[450px]"
                    : "sm:max-h-[400px]"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #1c1e37 0%, #2d3058 100%)",
              }}
            >
              <MarketImage
                src={market.image_url}
                alt={market.name}
                fit="contain"
                onOrientation={setOrientation}
                className="max-h-[50vh] sm:max-h-[inherit]"
              />
              <span className="absolute left-4 top-4 rounded-md bg-[#f8b625] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1c1e37] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                {market.category}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1c1e37] shadow-md transition-transform hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </div>


            <div className="space-y-6 p-6">
              <div>
                <h2 className="font-display text-2xl leading-tight text-[#1c1e37]">
                  {market.name}
                </h2>
                <div className="mt-3 h-[3px] w-12 bg-[#f8b625]" aria-hidden="true" />
                {market.description && (
                  <p className="mt-4 text-base leading-relaxed text-[#4B5563]">
                    {market.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <SectionTitle>Detalles del Evento</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <MiniFact
                    icon={<CalendarDays className="h-5 w-5" />}
                    label="Próxima fecha"
                    value={
                      market.nextDate
                        ? formatDateEs(market.nextDate)
                        : formatDateEs(market.recurrence_start_date)
                    }
                  />
                  <MiniFact
                    icon={<Clock className="h-5 w-5" />}
                    label="Horario"
                    value={formatTimeRange(
                      market.nextStartTime,
                      market.nextEndTime,
                    )}
                  />
                  {market.recurrence_label && (
                    <MiniFact
                      icon={<Repeat className="h-5 w-5" />}
                      label="Frecuencia"
                      value={market.recurrence_label}
                    />
                  )}
                  <MiniFact
                    icon={<MapPin className="h-5 w-5" />}
                    label="Ubicación"
                    value={`${market.municipality}, ${market.region}`}
                  />
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-[#F9FAFB] px-4 py-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
                  <span className="text-sm text-[#1c1e37]">{market.address}</span>
                </div>
              </div>

              <div className="space-y-3">
                <SectionTitle>Organizador</SectionTitle>
                <div className="rounded-xl bg-[#FAFAF8] p-4">
                  <p className="text-base font-semibold text-[#1c1e37]">
                    {market.organizer_name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {market.organizer_phone && (
                      <a
                        href={`tel:${market.organizer_phone}`}
                        onClick={() => track(market.id, "click_phone")}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#f8b625] px-3 text-sm font-semibold text-[#1c1e37] transition-colors hover:bg-[#f59e0b]"
                      >
                        <Phone className="h-4 w-4" /> Llamar
                      </a>
                    )}
                    {market.organizer_email && (
                      <a
                        href={`mailto:${market.organizer_email}`}
                        onClick={() => track(market.id, "click_email")}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#1c1e37] transition-colors hover:border-[#f8b625]"
                      >
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                    {market.organizer_instagram && (
                      <a
                        href={instagramUrl(market.organizer_instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(market.id, "click_instagram")}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#1c1e37] transition-colors hover:border-[#f8b625]"
                      >
                        <Instagram className="h-4 w-4" /> Redes
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={googleMapsUrl(market.address, market.municipality)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(market.id, "click_directions")}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1c1e37] text-base font-semibold text-white transition-colors hover:bg-[#2d3058]"
              >
                <Navigation className="h-5 w-5" />
                Cómo llegar
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
