import { createFileRoute, redirect, stripSearchParams } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { marketsQueryOptions } from "@/lib/markets-query";
import { CATEGORY_PARAM_TO_SLUG } from "@/lib/category-pages";
import { redirectLegacyMarket } from "@/lib/category-route-helpers";
import type { MarketFilters } from "@/lib/market-filters";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import type { EnrichedMarket } from "@/types/market";
import { HomeView } from "@/components/rutamercado/HomeView";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  date: fallback(z.enum(["today", "week", "month", "all"]), "all").default("all"),
  region: fallback(
    z.enum(["all", ...MARKET_REGIONS] as [string, ...string[]]),
    "all",
  ).default("all"),
  municipality: fallback(z.string(), "all").default("all"),
  category: fallback(
    z.enum(["all", ...MARKET_CATEGORIES] as [string, ...string[]]),
    "all",
  ).default("all"),
  day: fallback(z.string().regex(ISO_DAY).optional(), undefined),
  market: fallback(z.string().uuid().optional(), undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  // Keep the URL clean: default filter values are never written to the URL.
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        date: "all",
        region: "all",
        municipality: "all",
        category: "all",
      }),
    ],
  },
  beforeLoad: async ({ search }) => {
    const cat = search.category;
    if (cat && cat !== "all") {
      const slug = CATEGORY_PARAM_TO_SLUG[cat];
      if (slug) {
        throw redirect({ to: `/${slug}` as "/", statusCode: 301 });
      }
    }
    await redirectLegacyMarket(search.market);
  },

  head: ({ loaderData }: { loaderData?: EnrichedMarket[] }) => {
    const title = "Mercados Locales en Puerto Rico | RutaMercado";
    const description =
      "Descubre todos los mercados locales, ferias artesanales, bazares y mercados agrícolas activos en Puerto Rico. Encuentra el mercado más cercano por región, fecha y categoría — actualizado semanalmente.";
    const items = (loaderData ?? [])
      .filter((m) => m.slug && m.nextDate)
      .slice(0, 50)
      .map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.name,
        url: `https://rutamercadopr.com/mercados/${m.slug}`,
      }));

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://rutamercadopr.com/" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "RutaMercado" },
        { property: "og:image", content: "https://rutamercadopr.com/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://rutamercadopr.com/og-image.png" },
      ],
      links: [{ rel: "canonical", href: "https://rutamercadopr.com/" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: "https://rutamercadopr.com/",
            mainEntity: {
              "@type": "ItemList",
              name: "Mercados locales en Puerto Rico",
              numberOfItems: items.length,
              itemListElement: items,
            },
          }),
        },
      ],
    };
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(marketsQueryOptions),
  component: IndexPage,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">Página no encontrada</div>
  ),
});

function IndexPage() {
  const search = Route.useSearch();
  return (
    <HomeView
      search={{
        q: search.q,
        date: search.date as MarketFilters["date"],
        region: search.region,
        municipality: search.municipality,
        category: search.category,
        day: search.day,
        market: search.market,
      }}
    />
  );
}
