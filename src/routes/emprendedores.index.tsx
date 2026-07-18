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
import { Reveal } from "@/components/rutamercado/Reveal";
import { MARKET_REGIONS } from "@/types/market";
import { Store, Users, Sparkles, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#18253f]" style={{ fontFamily: BODY, color: "#fafaf8" }}>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#18253f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#54b678]">
              Directorio B2B
            </p>
            <h1
              className="mx-auto max-w-3xl text-4xl leading-tight sm:text-5xl md:text-6xl"
              style={{ fontFamily: DISPLAY, fontWeight: 600 }}
            >
              Tu negocio, visible ante los organizadores de mercados de Puerto Rico
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
              Regístrate gratis en el directorio de emprendedores. Los organizadores de mercados, bazares y popups usan esta herramienta para descubrir e invitar negocios como el tuyo.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setRegisterOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-8 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
              >
                Registra tu negocio
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* METRICS */}
      <section className="border-b border-white/10 bg-[#18253f]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          {[
            { n: `${total}+`, l: "Emprendedores" },
            { n: `${EMPRENDEDOR_CATEGORIES.length}+`, l: "Categorías" },
            { n: "100%", l: "Gratis" },
            { n: "24/7", l: "Visibilidad" },
          ].map((m) => (
            <Reveal key={m.l}>
              <div className="text-center">
                <div
                  className="text-4xl text-white sm:text-5xl"
                  style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                >
                  {m.n}
                </div>
                <div className="mt-1 text-sm text-white/70">{m.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-[#141628]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#54b678]">
                Beneficios
              </p>
              <h2
                className="text-3xl text-white sm:text-4xl"
                style={{ fontFamily: DISPLAY, fontWeight: 600 }}
              >
                ¿Por qué registrar tu negocio?
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Visibilidad",
                text: "Tu negocio aparece en un directorio público que consultan organizadores de todo Puerto Rico.",
              },
              {
                icon: Users,
                title: "Contacto directo",
                text: "Los organizadores te contactan para invitarte a sus próximos mercados y eventos.",
              },
              {
                icon: Store,
                title: "Gratis y sin compromiso",
                text: "Sin costo, sin comisiones. Regístrate una sola vez y mantén tu perfil activo.",
              },
            ].map((b) => (
              <Reveal key={b.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#18253f] p-8">
                  <b.icon className="h-8 w-8 text-[#54b678]" />
                  <h3
                    className="mt-5 text-xl text-white"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">
                    {b.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-[#18253f]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#54b678]">
                Proceso
              </p>
              <h2
                className="text-3xl text-white sm:text-4xl"
                style={{ fontFamily: DISPLAY, fontWeight: 600 }}
              >
                Cómo funciona
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Regístrate", d: "Completa el formulario con la información de tu negocio, categoría y productos." },
              { n: "02", t: "Aprobación", d: "Revisamos tu perfil y lo publicamos en el directorio en menos de 48 horas." },
              { n: "03", t: "Recibe invitaciones", d: "Los organizadores te contactan directamente para sus próximos mercados." },
            ].map((s) => (
              <Reveal key={s.n}>
                <div className="relative">
                  <div
                    className="text-5xl text-[#54b678]"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="mt-3 text-xl text-white"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {s.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-8 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registra tu negocio
            </button>
          </div>
        </div>
      </section>

      {/* DIRECTORIO */}
      <section className="border-b border-t border-white/10 bg-[#18253f]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="text-3xl text-white sm:text-4xl"
                style={{ fontFamily: DISPLAY, fontWeight: 600 }}
              >
                Directorio de Emprendedores
              </h1>
              <p className="mt-2 text-white/70">
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
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por negocio, producto, mercado o municipio..."
                className="h-12 w-full border-white/20 bg-[#141628] pl-10 text-base text-white placeholder:text-white/50"
                aria-label="Buscar emprendedores"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 w-full border-white/20 bg-[#141628] text-white sm:w-56">
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
              <SelectTrigger className="h-12 w-full border-white/20 bg-[#141628] text-white sm:w-44">
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
          <div className="rounded-2xl border border-dashed border-white/20 bg-[#141628] py-16 text-center">
            <p className="text-white/70">
              No encontramos emprendedores con esos criterios.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((bucket) => (
              <section key={bucket.region}>
                <div className="mb-2 flex items-baseline gap-3">
                  <h2
                    className="text-2xl text-white md:text-3xl"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {bucket.region}
                  </h2>
                  <span className="text-sm text-white/60">
                    {bucket.items.length} emprendedor{bucket.items.length === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="mb-6 h-px bg-white/10" />
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
