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
    slug: "mercado-agricola",
    category: "Mercado Agrícola",
    pageTitle: "Mercados Agrícolas en Puerto Rico",
    subtitle:
      "Productos frescos, orgánicos y del campo directo a tu mesa",
    ctaLabel: "Ver todos los Mercados Agrícolas",
    metaTitle: "Mercados Agrícolas en Puerto Rico | RutaMercado",
    metaDescription:
      "Encuentra los mejores mercados agrícolas en Puerto Rico. Productos frescos, orgánicos y locales cerca de ti. Directorio actualizado semanalmente.",
    pageViewKey: "category_mercado_agricola",
    emptyText: "No hay Mercados Agrícolas programados por ahora",
  },
  {
    slug: "bazar-pop-up",
    category: "Bazaar/Pop Up",
    pageTitle: "Bazaar / Pop Up en Puerto Rico",
    subtitle:
      "Bazaar / Pop Up con artículos únicos, ropa, accesorios y más",
    ctaLabel: "Ver todos los Bazaar / Pop Up",
    metaTitle: "Bazaar / Pop Up en Puerto Rico | RutaMercado",
    metaDescription:
      "Descubre los Bazaar / Pop Up en Puerto Rico. Ropa, accesorios, artículos únicos y más. Encuentra el próximo bazaar cerca de ti.",
    pageViewKey: "category_bazar_popup",
    emptyText: "No hay Bazaar / Pop Up programados por ahora",
  },
  {
    slug: "feria-artesanal",
    category: "Feria Artesanal",
    pageTitle: "Ferias Artesanales en Puerto Rico",
    subtitle:
      "Artesanías locales hechas a mano por artesanos de Puerto Rico",
    ctaLabel: "Ver todas las Ferias Artesanales",
    metaTitle: "Ferias Artesanales en Puerto Rico | RutaMercado",
    metaDescription:
      "Ferias artesanales con productos hechos a mano por artesanos locales de Puerto Rico. Artesanías, joyería, arte y más.",
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
    slug: "mercado-mixto",
    category: "Mercado Mixto",
    pageTitle: "Mercados Mixtos en Puerto Rico",
    subtitle:
      "Un poco de todo — productos, comida, artesanías y más en un solo lugar",
    ctaLabel: "Ver todos los Mercados Mixtos",
    metaTitle: "Mercados Mixtos en Puerto Rico | RutaMercado",
    metaDescription:
      "Mercados mixtos con variedad de productos, comida, artesanías y más en Puerto Rico. Todo en un solo lugar.",
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
