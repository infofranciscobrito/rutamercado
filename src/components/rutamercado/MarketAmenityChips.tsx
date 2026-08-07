import type { EnrichedMarket } from "@/types/market";

/** Servicios e instalaciones como chips/tarjetas pequeñas. */
export function MarketAmenityChips({ market }: { market: EnrichedMarket }) {
  const items = (
    [
      { emoji: "🐾", label: "Mascotas", value: market.pets ?? null },
      { emoji: "🅿️", label: "Estacionamiento", value: market.parking ?? null },
      { emoji: "♿", label: "Accesibilidad", value: market.accessibility ?? null },
      { emoji: "👶", label: "Familiar", value: market.family_friendly ?? null },
    ] as { emoji: string; label: string; value: string | null }[]
  ).filter((i) => i.value && i.value.trim().length > 0) as {
    emoji: string;
    label: string;
    value: string;
  }[];

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-start gap-3 rounded-xl bg-[#FFF8EC] p-3.5 transition-shadow hover:rm-shadow-warm"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {it.emoji}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              {it.label}
            </div>
            <div className="mt-0.5 text-sm text-[#18253f]">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
