import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  listEmprendedores,
  EMPRENDEDOR_CATEGORIES,
  type Emprendedor,
} from "@/lib/emprendedores.functions";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmprendedorCard } from "@/components/emprendedores/EmprendedorCard";
import { EmprendedorProfileDialog } from "@/components/emprendedores/EmprendedorProfileDialog";
import { MARKET_REGIONS } from "@/types/market";

const emprendedoresQueryOptions = queryOptions({
  queryKey: ["emprendedores"],
  queryFn: () => listEmprendedores(),
});

const REGION_ORDER: string[] = [...MARKET_REGIONS, "Otros"];

export const Route = createFileRoute("/negocios")({
  head: () => ({
    meta: [
      {
        title: "Directorio de Negocios y Emprendedores para Mercados en Puerto Rico | RutaMercado",
      },
      {
        name: "description",
        content:
          "Encuentra emprendedores locales para tu mercado, bazar o pop-up en Puerto Rico. Busca por categoría y región, y contáctalos directamente.",
      },
      { property: "og:title", content: "Directorio de Negocios y Emprendedores para Mercados | RutaMercado" },
      {
        property: "og:description",
        content:
          "Encuentra emprendedores locales para tu próximo mercado, bazar o pop-up en Puerto Rico y contáctalos directamente.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "RutaMercado" },
      { property: "og:url", content: "https://rutamercadopr.com/negocios" },
      { property: "og:image", content: "https://rutamercadopr.com/og-negocios.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Directorio de Negocios y Emprendedores para Mercados | RutaMercado" },
      {
        name: "twitter:description",
        content:
          "Encuentra emprendedores locales para tu próximo mercado, bazar o pop-up en Puerto Rico y contáctalos directamente.",
      },
      { name: "twitter:image", content: "https://rutamercadopr.com/og-negocios.png" },
    ],
    links: [{ rel: "canonical", href: "https://rutamercadopr.com/negocios" }],
  }),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(emprendedoresQueryOptions),
  component: EmprendedoresPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-destructive">
      Error: {(error as Error).message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">No encontrado</div>,
});

function EmprendedoresPage() {
  const { data } = useSuspenseQuery(emprendedoresQueryOptions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [selected, setSelected] = useState<Emprendedor | null>(null);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.filter((e) => {
      if (category !== "all" && e.categoria_producto !== category) return false;
      if (region !== "all") {
        const r = e.region ?? "Otros";
        if (region === "Otros") {
          if (MARKET_REGIONS.includes(r as (typeof MARKET_REGIONS)[number]))
            return false;
        } else if (r !== region) {
          return false;
        }
      }
      if (!q) return true;
      return (
        e.nombre_negocio.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q) ||
        (e.municipio ?? "").toLowerCase().includes(q) ||
        (e.region ?? "").toLowerCase().includes(q) ||
        e.mercados_interes.some((m) => m.toLowerCase().includes(q))
      );
    });

    const buckets = new Map<string, Emprendedor[]>();
    for (const e of filtered) {
      const key: string =
        e.region && REGION_ORDER.includes(e.region) ? e.region : "Otros";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(e);
    }
    return REGION_ORDER.map((r) => ({ region: r, items: buckets.get(r) ?? [] }))
      .filter((b) => b.items.length > 0);
  }, [data, query, category, region]);

  const total = data.length;

  return (
    <div className="min-h-screen bg-[#18253f]">
      <Header />

      {/* Hero */}
      <section className="bg-[#18253f]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <h1 className="font-display text-3xl text-white md:text-4xl">
            Directorio de Negocios
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-[#54b678]">
            Encuentra emprendedores para tu próximo mercado, bazar o pop-up.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
            Busca por nombre, producto, categoría o región y contacta directamente a cada negocio.
          </p>
        </div>
      </section>

      <div className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-sm sm:px-6">
          <Link to="/registra-tu-negocio" className="text-white/70 transition-colors hover:text-[#54b678]">
            ¿Tienes un negocio? <span className="font-semibold text-[#54b678]">Regístrate gratis →</span>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <section className="sticky top-16 z-30 border-b border-white/10 bg-[#18253f] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por negocio, producto, mercado o municipio..."
                className="h-12 w-full border-white/20 bg-white/10 pl-10 text-base text-white placeholder:text-white/50"
                aria-label="Buscar emprendedores"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 w-full border-white/20 bg-white/10 text-white sm:w-56">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {EMPRENDEDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-12 w-full border-white/20 bg-white/10 text-white sm:w-44">
                <SelectValue placeholder="Región" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las regiones</SelectItem>
                {MARKET_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-2 text-sm text-white/60">
            {total} emprendedor{total === 1 ? "" : "es"} en el directorio.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
            <p className="text-white/70">
              No encontramos emprendedores con esos criterios.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((bucket) => (
              <section key={bucket.region}>
                <div className="mb-2 flex items-baseline gap-3">
                  <h2 className="font-display text-2xl text-white md:text-3xl">
                    {bucket.region}
                  </h2>
                  <span className="text-sm text-white/60">
                    {bucket.items.length} emprendedor{bucket.items.length === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="mb-6 h-px bg-white/20" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-[18px] lg:grid-cols-4 [&>*]:min-w-0">
                  {bucket.items.map((e) => (
                    <EmprendedorCard
                      key={e.id}
                      item={e}
                      onOpen={() => setSelected(e)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-[#54b678]/30 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <p className="font-display text-xl text-white md:text-2xl">
            ¿Tienes un negocio? Regístrate gratis
          </p>
          <Link
            to="/registra-tu-negocio"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#439660]"
          >
            Regístrate gratis →
          </Link>
        </div>
      </main>

      <EmprendedorProfileDialog
        item={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <Footer />
    </div>
  );
}

