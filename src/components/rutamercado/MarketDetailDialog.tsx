import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Repeat,
  User,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Market } from "@/types/market";
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
  market: Market | null;
  open: boolean;
  onClose: () => void;
}

function track(marketId: string, clickType: string) {
  void trackMarketClick({ data: { marketId, clickType } }).catch(() => {});
}

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-[#1c1e37]">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function MarketDetailDialog({ market, open, onClose }: Props) {
  const trackedRef = useRef<string | null>(null);

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
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-[600px]">
        {market && (
          <>
            <div className="relative aspect-video w-full overflow-hidden">
              <MarketImage src={market.image_url} alt={market.name} />
              <span className="absolute left-4 top-4 rounded-md bg-[#f8b625] px-2.5 py-1 text-xs font-bold text-[#1c1e37]">
                {market.category}
              </span>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <h2 className="font-display text-[24px] leading-tight text-[#1c1e37]">
                  {market.name}
                </h2>
                {market.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {market.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <SectionTitle>Detalles del Evento</SectionTitle>
                <DetailRow icon={<CalendarDays className="h-4 w-4" />}>
                  {formatDateEs(market.event_date)}
                </DetailRow>
                <DetailRow icon={<Clock className="h-4 w-4" />}>
                  {formatTimeRange(market.start_time, market.end_time)}
                </DetailRow>
                {market.frequency && (
                  <DetailRow icon={<Repeat className="h-4 w-4" />}>
                    {market.frequency}
                  </DetailRow>
                )}
                <DetailRow icon={<MapPin className="h-4 w-4" />}>
                  <div>
                    <div>{market.address}</div>
                    <div className="text-muted-foreground">
                      {market.municipality}, {market.region}
                    </div>
                  </div>
                </DetailRow>
              </div>

              <div className="space-y-3">
                <SectionTitle>Contacto del Organizador</SectionTitle>
                <DetailRow icon={<User className="h-4 w-4" />}>
                  {market.organizer_name}
                </DetailRow>
                {market.organizer_phone && (
                  <DetailRow icon={<Phone className="h-4 w-4" />}>
                    <a
                      href={`tel:${market.organizer_phone}`}
                      onClick={() => track(market.id, "click_phone")}
                      className="text-[#1c1e37] underline-offset-2 hover:text-[#f8b625] hover:underline"
                    >
                      {market.organizer_phone}
                    </a>
                  </DetailRow>
                )}
                {market.organizer_email && (
                  <DetailRow icon={<Mail className="h-4 w-4" />}>
                    <a
                      href={`mailto:${market.organizer_email}`}
                      onClick={() => track(market.id, "click_email")}
                      className="break-all text-[#1c1e37] underline-offset-2 hover:text-[#f8b625] hover:underline"
                    >
                      {market.organizer_email}
                    </a>
                  </DetailRow>
                )}
                {market.organizer_instagram && (
                  <DetailRow
                    icon={
                      <span className="text-base leading-none">@</span>
                    }
                  >
                    <a
                      href={instagramUrl(market.organizer_instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track(market.id, "click_instagram")}
                      className="text-[#1c1e37] underline-offset-2 hover:text-[#f8b625] hover:underline"
                    >
                      @{market.organizer_instagram.replace(/^@/, "")}
                    </a>
                  </DetailRow>
                )}
              </div>

              <a
                href={googleMapsUrl(market.address, market.municipality)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(market.id, "click_directions")}
                className="block"
              >
                <Button
                  type="button"
                  className="w-full gap-2 bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90"
                  size="lg"
                >
                  <Navigation className="h-4 w-4" />
                  Cómo llegar
                </Button>
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
