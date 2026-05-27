import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { queryOptions } from "@tanstack/react-query";
import { listMarkets } from "@/lib/markets.functions";
import { CATEGORY_BY_SLUG } from "@/lib/category-pages";
import {
  buildCategoryHead,
  categorySearchSchema,
} from "@/lib/category-route-helpers";
import { CategoryPage } from "@/components/rutamercado/CategoryPage";
import type { MarketFilters } from "@/lib/market-filters";

const config = CATEGORY_BY_SLUG.get("bazar-pop-up")!;

const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => listMarkets(),
});

export const Route = createFileRoute("/bazar-pop-up")({
  validateSearch: zodValidator(categorySearchSchema),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(marketsQueryOptions),
  head: ({ loaderData }) => buildCategoryHead(config, loaderData),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <CategoryPage
      config={config}
      routeFrom="/bazar-pop-up"
      search={{
        q: search.q,
        date: search.date,
        region: search.region as MarketFilters["region"],
        day: search.day,
        market: search.market,
      }}
    />
  );
}
