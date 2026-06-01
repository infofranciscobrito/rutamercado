import {
  Leaf,
  Tent,
  Hand,
  UtensilsCrossed,
  ShoppingBag,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MarketCategory } from "@/types/market";

export const CATEGORY_ICONS: Record<MarketCategory, LucideIcon> = {
  "Mercado Agrícola": Leaf,
  "Bazaar/Pop Up": Tent,
  "Feria Artesanal": Hand,
  "Food Market": UtensilsCrossed,
  "Mercado Mixto": ShoppingBag,
  "Flea Market": Package,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: MarketCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category] ?? ShoppingBag;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
