import type { Database } from "@/integrations/supabase/types";

export type MarketCategory =
  | "Mercado Agrícola"
  | "Bazar / Pop-up"
  | "Feria Artesanal"
  | "Food Market"
  | "Mercado Mixto"
  | "Flea Market";

export type MarketRegion = "Metro" | "Norte" | "Sur" | "Este" | "Oeste" | "Centro";

export type MarketFrequency = "Único" | "Semanal" | "Quincenal" | "Mensual";

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

export const MARKET_FREQUENCIES: MarketFrequency[] = [
  "Único",
  "Semanal",
  "Quincenal",
  "Mensual",
];
