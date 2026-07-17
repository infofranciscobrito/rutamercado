import { createFileRoute } from "@tanstack/react-router";
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
import { RegisterEmprendedorDialog } from "@/components/emprendedores/RegisterEmprendedorDialog";
import { MARKET_REGIONS } from "@/types/market";

const emprendedoresQueryOptions = queryOptions({
  queryKey: ["emprendedores"],
  queryFn: () => listEmprendedores(),
});

const REGION_ORDER: string[] = [...MARKET_REGIONS, "Otros"];

const DISPLAY = '"Cormorant Garamond", Georgia, serif';
const BODY = '"Karla", system-ui, sans-serif';

export const Route = createFileRoute("/emprendedores/")({
  head: () => ({
    meta: [
      {
        title:
          "Directorio de Emprendedores — Negocios que venden en mercados y bazares de Puerto Rico | RutaMercado",
      },
      {
        name: "description",
        content:
          "Encuentra emprendedores y negocios que venden en mercados, bazares y popups de Puerto Rico. Regístrate gratis para que los organizadores te inviten a sus próximos eventos.",
      },
      {
        property: "og:title",
        content: "Directorio de Emprendedores — RutaMercado",
      },
      {
        property: "og:description",
        content:
          "Tu negocio, visible ante los organizadores de mercados de Puerto Rico.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(emprendedoresQueryOptions),
  component: EmprendedoresPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-destructive">
      Error: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">No encontrado</div>,
});

function EmprendedoresPage() {
  const { data } = useSuspenseQuery(emprendedoresQueryOptions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [registerOpen, setRegisterOpen] = useState(false);

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
    <div className="min-h-screen bg-white" style={{ fontFamily: BODY, color: "#2d2d2d" }}>
      <Header />

      {/* DIRECTORIO */}
      <section className="border-b border-[#18253f]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="text-3xl text-[#18253f] sm:text-4xl"
                style={{ fontFamily: DISPLAY, fontWeight: 600 }}
              >
                Directorio de Emprendedores
              </h1>
              <p className="mt-2 text-[#2d2d2d]/70">
                {total} emprendedor{total === 1 ? "" : "es"} en el directorio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
            >
              Registra tu negocio
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#18253f]/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por negocio, producto, mercado o municipio..."
                className="h-12 w-full border-[#18253f]/20 bg-white pl-10 text-base text-[#18253f] placeholder:text-[#18253f]/50"
                aria-label="Buscar emprendedores"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 w-full border-[#18253f]/20 bg-white text-[#18253f] sm:w-56">
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
              <SelectTrigger className="h-12 w-full border-[#18253f]/20 bg-white text-[#18253f] sm:w-44">
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
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#18253f]/20 bg-[#f7f7f5] py-16 text-center">
            <p className="text-[#2d2d2d]/70">
              No encontramos emprendedores con esos criterios.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((bucket) => (
              <section key={bucket.region}>
                <div className="mb-2 flex items-baseline gap-3">
                  <h2
                    className="text-2xl text-[#18253f] md:text-3xl"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {bucket.region}
                  </h2>
                  <span className="text-sm text-[#2d2d2d]/60">
                    {bucket.items.length} emprendedor{bucket.items.length === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="mb-6 h-px bg-[#18253f]/10" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bucket.items.map((e) => (
                    <EmprendedorCard key={e.id} item={e} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <RegisterEmprendedorDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
      />
      <Footer />
    </div>
  );
}
