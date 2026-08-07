import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { EnrichedMarket } from "@/types/market";
import { MarketImage } from "./MarketImage";
import { MarketDetailContent, track } from "./MarketDetailContent";
import { incrementMarketView } from "@/lib/analytics.functions";

interface Props {
  market: EnrichedMarket | null;
  open: boolean;
  onClose: () => void;
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
              className="relative w-full shrink-0 overflow-hidden rounded-t-none min-h-[280px] sm:rounded-t-[20px]"
              style={{
                background: "linear-gradient(135deg, #18253f 0%, #2d3058 100%)",
              }}
            >
              <MarketImage src={market.image_url} alt={market.name} fit="contain" />
              <span className="absolute left-4 top-4 rounded-md bg-[#54b678] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#18253f] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                {market.category}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#18253f] shadow-md transition-transform hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <MarketDetailContent market={market} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
