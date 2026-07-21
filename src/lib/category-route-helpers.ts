import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import { MARKET_REGIONS } from "@/types/market";
import type { CategoryPageConfig } from "@/lib/category-pages";
import type { EnrichedMarket } from "@/types/market";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const categorySearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  date: fallback(z.enum(["today", "week", "month", "all"]), "all").default("all"),
  region: fallback(
    z.enum(["all", ...MARKET_REGIONS] as [string, ...string[]]),
    "all",
  ).default("all"),
  municipality: fallback(z.string(), "all").default("all"),
  day: fallback(z.string().regex(ISO_DAY).optional(), undefined),
  market: fallback(z.string().uuid().optional(), undefined),
});

const BASE = "https://rutamercadopr.com";

export function buildCategoryHead(
  config: CategoryPageConfig,
  loaderData: EnrichedMarket[] | undefined,
) {
  const url = `${BASE}/${config.slug}`;
  const inCat = (loaderData ?? []).filter(
    (m) => m.category === config.category && m.nextDate,
  );

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.pageTitle,
    itemListElement: inCat.slice(0, 50).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: m.name,
        startDate: m.nextDate,
        url: `${url}?market=${m.id}`,
        location: {
          "@type": "Place",
          name: `${m.municipality}, ${m.region}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: m.municipality,
            addressRegion: m.region,
            addressCountry: "PR",
          },
        },
      },
    })),
  };

  const ogImage = `${BASE}${config.ogImage ?? "/og-image.png"}`;

  return {
    meta: [
      { title: config.metaTitle },
      { name: "description", content: config.metaDescription },
      { property: "og:title", content: config.metaTitle },
      { property: "og:description", content: config.metaDescription },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "RutaMercado" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.metaTitle },
      { name: "twitter:description", content: config.metaDescription },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(itemList),
      },
    ],
  };
}

