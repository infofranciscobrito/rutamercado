import { queryOptions } from "@tanstack/react-query";
import { listMarkets } from "@/lib/markets.functions";

export const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => listMarkets(),
});
