import type { Database } from "@/integrations/supabase/types";
import type { UpcomingDate, CancelledDate } from "@/lib/recurrence";

export type MarketCategory =
  | "Mercado Agrícola"
  | "Bazar / Pop-up"
  | "Feria Artesanal"
  | "Food Market"
  | "Mercado Mixto"
  | "Flea Market";

export type MarketRegion = "Metro" | "Norte" | "Sur" | "Este" | "Oeste" | "Centro";

export type ClickType =
  | "view_detail"
  | "click_phone"
  | "click_email"
  | "click_instagram"
  | "click_directions";

export type Market = Database["public"]["Tables"]["markets"]["Row"];
export type MarketInsert = Database["public"]["Tables"]["markets"]["Insert"];
export type MarketUpdate = Database["public"]["Tables"]["markets"]["Update"];

export type MarketClick = Database["public"]["Tables"]["market_clicks"]["Row"];
export type PageView = Database["public"]["Tables"]["page_views"]["Row"];

/** Mercado público enriquecido con sus próximas fechas calculadas. */
export interface EnrichedMarket extends Market {
  upcoming: UpcomingDate[];
  cancelled: CancelledDate[];
  nextDate: string | null;
  nextStartTime: string;
  nextEndTime: string;
  nextIsOverridden: boolean;
  nextOverrideNote: string | null;
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  "Mercado Agrícola",
  "Bazar / Pop-up",
  "Feria Artesanal",
  "Food Market",
  "Mercado Mixto",
  "Flea Market",
];

export const MARKET_REGIONS: MarketRegion[] = [
  "Metro",
  "Norte",
  "Sur",
  "Este",
  "Oeste",
  "Centro",
];

/** Legacy frequency labels — kept for backwards-compat references; not used in new UI. */
export const MARKET_FREQUENCIES: string[] = [
  "Único",
  "Semanal",
  "Quincenal",
  "Mensual",
];
