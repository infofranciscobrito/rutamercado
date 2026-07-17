import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Users, Sparkles, ShieldCheck } from "lucide-react";
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

export const Route = createFileRoute("/emprendedores")({
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
    <div className="min-h-screen bg-[#18253f]">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/15 bg-[#18253f]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <h1 className="font-display text-4xl text-white md:text-5xl">
            Directorio de Emprendedores
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[#54b678] md:text-xl">
            Tu negocio, visible ante los organizadores de mercados de Puerto Rico.
          </p>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Regístrate una vez y queda disponible para que los organizadores de
            mercados, bazares y popups te encuentren, conozcan tu negocio y te
            inviten a participar en sus próximos eventos.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
            >
              Regístrate como Emprendedor
            </button>
          </div>
        </div>
      </section>

      {/* ¿Por qué registrarte? */}
      <section className="border-b border-white/10 bg-[#18253f]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-2xl text-white md:text-3xl">
            ¿Por qué registrarte?
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <Users className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">
                Más invitaciones
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Los organizadores buscan aquí primero cuando arman su próximo
                mercado o bazar.
              </p>
            </div>
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <Sparkles className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">
                Cero costo, un solo registro
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Creas tu perfil una vez y queda visible para todos los
                organizadores en la plataforma.
              </p>
            </div>
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <ShieldCheck className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">
                Presencia seria
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Tu perfil pasa por aprobación, igual que los mercados y
                productores, así que estar listado transmite confianza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="border-b border-white/10 bg-[#18253f]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
          <p className="mt-3 text-sm text-white/60">
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
