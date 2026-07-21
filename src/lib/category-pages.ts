import type { MarketCategory } from "@/types/market";

export interface CategoryPageConfig {
  slug: string;
  category: MarketCategory;
  pageTitle: string;
  subtitle: string;
  ctaLabel: string;
  metaTitle: string;
  metaDescription: string;
  pageViewKey: string;
  emptyText: string;
}

export const CATEGORY_PAGES: CategoryPageConfig[] = [
  {
    slug: "mercados-agricolas",
    category: "Mercado Agrícola",
    pageTitle: "Mercados Agrícolas en Puerto Rico",
    subtitle:
      "Productos frescos, orgánicos y del campo directo a tu mesa",
    ctaLabel: "Ver todos los Mercados Agrícolas",
    metaTitle: "Mercados Agrícolas en Puerto Rico | RutaMercado",
    metaDescription:
      "Encuentra los mercados agrícolas activos en Puerto Rico: frutas, vegetales y productos frescos del campo. Descubre cuál tienes cerca este fin de semana.",
    pageViewKey: "category_mercado_agricola",
    emptyText: "No hay Mercados Agrícolas programados por ahora",
  },
  {
    slug: "bazares",
    category: "Bazaar/Pop Up",
    pageTitle: "Bazares en Puerto Rico",
    subtitle:
      "Bazares y Pop Ups con artículos únicos, ropa, accesorios y más",
    ctaLabel: "Ver todos los Bazares",
    metaTitle: "Bazares en Puerto Rico | RutaMercado",
    metaDescription:
      "Explora los bazares locales de Puerto Rico: artículos únicos, segunda mano y hallazgos. Encuentra el bazar más cercano a ti.",
    pageViewKey: "category_bazar_popup",
    emptyText: "No hay Bazares programados por ahora",
  },
  {
    slug: "ferias-artesanales",
    category: "Feria Artesanal",
    pageTitle: "Ferias Artesanales en Puerto Rico",
    subtitle:
      "Artesanías locales hechas a mano por artesanos de Puerto Rico",
    ctaLabel: "Ver todas las Ferias Artesanales",
    metaTitle: "Ferias Artesanales en Puerto Rico | RutaMercado",
    metaDescription:
      "Descubre las ferias artesanales de Puerto Rico: arte, hecho a mano y talento local. Encuentra la próxima feria cerca de ti.",
    pageViewKey: "category_feria_artesanal",
    emptyText: "No hay Ferias Artesanales programadas por ahora",
  },
  {
    slug: "food-market",
    category: "Food Market",
    pageTitle: "Food Markets en Puerto Rico",
    subtitle:
      "Lo mejor de la gastronomía local y street food boricua",
    ctaLabel: "Ver todos los Food Markets",
    metaTitle: "Food Markets en Puerto Rico | RutaMercado",
    metaDescription:
      "Los mejores food markets y festivales gastronómicos en Puerto Rico. Street food, comida local y experiencias culinarias.",
    pageViewKey: "category_food_market",
    emptyText: "No hay Food Markets programados por ahora",
  },
  {
    slug: "mercados-mixtos",
    category: "Mercado Mixto",
    pageTitle: "Mercados Mixtos en Puerto Rico",
    subtitle:
      "Un poco de todo — productos, comida, artesanías y más en un solo lugar",
    ctaLabel: "Ver todos los Mercados Mixtos",
    metaTitle: "Mercados Mixtos en Puerto Rico | RutaMercado",
    metaDescription:
      "Mercados con de todo —agrícola, artesanal y más— en un solo lugar. Encuentra los mercados mixtos activos en Puerto Rico.",
    pageViewKey: "category_mercado_mixto",
    emptyText: "No hay Mercados Mixtos programados por ahora",
  },
  {
    slug: "flea-market",
    category: "Flea Market",
    pageTitle: "Flea Markets en Puerto Rico",
    subtitle:
      "Tesoros escondidos, antigüedades y artículos de segunda mano",
    ctaLabel: "Ver todos los Flea Markets",
    metaTitle: "Flea Markets en Puerto Rico | RutaMercado",
    metaDescription:
      "Flea markets y mercados de pulgas en Puerto Rico. Antigüedades, tesoros escondidos y artículos de segunda mano.",
    pageViewKey: "category_flea_market",
    emptyText: "No hay Flea Markets programados por ahora",
  },
];

export const CATEGORY_BY_SLUG = new Map(
  CATEGORY_PAGES.map((c) => [c.slug, c]),
);

export const PAGE_BY_CATEGORY = new Map(
  CATEGORY_PAGES.map((c) => [c.category, c]),
);

/** Map old slugs → new slugs for 301 redirects */
export const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  "mercado-agricola": "mercados-agricolas",
  "bazar-pop-up": "bazares",
  "feria-artesanal": "ferias-artesanales",
  "mercado-mixto": "mercados-mixtos",
};

/** Map raw `?category=...` values → new slug */
export const CATEGORY_PARAM_TO_SLUG: Record<string, string> = {
  "Mercado Agrícola": "mercados-agricolas",
  "Mercado Agricola": "mercados-agricolas",
  "Bazaar/Pop Up": "bazares",
  "Bazar/Pop Up": "bazares",
  "Feria Artesanal": "ferias-artesanales",
  "Food Market": "food-market",
  "Mercado Mixto": "mercados-mixtos",
  "Flea Market": "flea-market",
};
