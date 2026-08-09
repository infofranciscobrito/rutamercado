import {
  Accessibility,
  Car,
  CreditCard,
  Dog,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EnrichedMarket } from "@/types/market";

/** Un valor es "limitado/negativo" si empieza con No o menciona limitación. */
function isMuted(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v.startsWith("no") ||
    v.includes("limitad") ||
    v.includes("parcial") ||
    v.includes("de pago") ||
    v.includes("solo en")
  );
}

/** Servicios e instalaciones del mercado, en el estilo de la tarjeta boleto. */
export function MarketAmenityChips({ market }: { market: EnrichedMarket }) {
  const rows = (
    [
      { icon: Dog, label: "Mascotas", value: market.pets },
      { icon: Car, label: "Estacionamiento", value: market.parking },
      { icon: Users, label: "Familiar", value: market.family_friendly },
      { icon: UtensilsCrossed, label: "Área de comida", value: market.food_area },
      { icon: Accessibility, label: "Accesibilidad", value: market.accessibility },
    ] as { icon: LucideIcon; label: string; value: string | null }[]
  ).filter((r): r is { icon: LucideIcon; label: string; value: string } =>
    Boolean(r.value && r.value.trim()),
  );

  const payments = (market.payment_methods ?? []).filter(
    (p) => p && p.trim().length > 0,
  );

  if (rows.length === 0 && payments.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
        Servicios e instalaciones
      </div>

      {rows.length > 0 && (
        <ul className="space-y-2.5 text-sm">
          {rows.map(({ icon: Icon, label, value }) => {
            const muted = isMuted(value);
            return (
              <li key={label} className="flex items-start gap-2.5">
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    muted ? "text-[#9CA3AF]" : "text-[#54b678]"
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="text-[#6B7280]">{label}: </span>
                  <span className={muted ? "text-[#6B7280]" : "text-[#18253f]"}>
                    {value}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {payments.length > 0 && (
        <div className="flex items-start gap-2.5 text-sm">
          <CreditCard
            className="mt-0.5 h-4 w-4 shrink-0 text-[#54b678]"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="text-[#6B7280]">Métodos de pago</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {payments.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-[#FFF8EC] px-2 py-1 text-xs font-medium text-[#18253f]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
