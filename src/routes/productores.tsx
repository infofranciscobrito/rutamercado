import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listProducers, type Producer } from "@/lib/producers.functions";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";
import { Input } from "@/components/ui/input";
import { ProducerCard } from "@/components/productores/ProducerCard";
import { MARKET_REGIONS } from "@/types/market";

const producersQueryOptions = queryOptions({
  queryKey: ["producers"],
  queryFn: () => listProducers(),
});

const REGION_ORDER: string[] = [...MARKET_REGIONS, "Otros"];

export const Route = createFileRoute("/productores")({
  head: () => ({
    meta: [
      {
        title: "Productores de Mercados Locales en Puerto Rico — RutaMercado",
      },
      {
        name: "description",
        content:
          "Directorio de productores y organizadores de mercados locales, ferias y bazares en Puerto Rico. Encuentra su contacto fácilmente.",
      },
      {
        property: "og:title",
        content: "Productores de Mercados Locales en Puerto Rico — RutaMercado",
      },
      {
        property: "og:description",
        content:
          "Directorio de productores y organizadores de mercados locales, ferias y bazares en Puerto Rico.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(producersQueryOptions),
  component: ProducersPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-destructive">
      Error: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">No encontrado</div>,
});

function ProducersPage() {
  const { data } = useSuspenseQuery(producersQueryOptions);
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((p) => {
          if (p.nombre.toLowerCase().includes(q)) return true;
          if ((p.region ?? "").toLowerCase().includes(q)) return true;
          return p.mercados.some((m) => m.toLowerCase().includes(q));
        })
      : data;

    const buckets = new Map<string, Producer[]>();
    for (const p of filtered) {
      const key: string = p.region && REGION_ORDER.includes(p.region) ? p.region : "Otros";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(p);
    }
    return REGION_ORDER
      .map((region) => ({ region, items: buckets.get(region) ?? [] }))
      .filter((b) => b.items.length > 0);
  }, [data, query]);

  const total = data.length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      <section className="border-b border-[#18253f]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <h1 className="font-display text-4xl text-[#18253f] md:text-5xl">
            Productores de mercados locales en Puerto Rico
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[#18253f]/70 md:text-lg">
            Conoce a las personas y organizaciones detrás de cada mercado, feria y
            bazar publicado en RutaMercado. {total} productor{total === 1 ? "" : "es"} en el directorio.
          </p>

          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#18253f]/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por productor, mercado o región..."
                className="h-12 pl-10 text-base"
                aria-label="Buscar productores"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#18253f]/15 bg-white py-16 text-center">
            <p className="text-[#18253f]/60">
              No encontramos productores con esos criterios.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((bucket) => (
              <section key={bucket.region}>
                <div className="mb-6 flex items-baseline gap-3">
                  <h2 className="font-display text-2xl text-[#18253f] md:text-3xl">
                    {bucket.region}
                  </h2>
                  <span className="text-sm text-[#18253f]/50">
                    {bucket.items.length} productor{bucket.items.length === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bucket.items.map((p) => (
                    <ProducerCard key={p.id} producer={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
