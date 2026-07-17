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
import { Reveal } from "@/components/rutamercado/Reveal";
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

      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[#18253f] text-white"
        style={{
          paddingTop: "clamp(3.5rem, 4vw + 2rem, 6rem)",
          paddingBottom: "clamp(3.5rem, 4vw + 2rem, 6rem)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#54b678]"
            style={{ fontFamily: BODY }}
          >
            Para emprendedores
          </p>
          <h1
            className="mt-4 text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
            style={{ fontFamily: DISPLAY, fontWeight: 600 }}
          >
            Muéstrale tu marca a los organizadores de mercados.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Regístrate una vez y queda visible para todos los organizadores de mercados,
            bazares y popups de Puerto Rico que buscan vendedores para sus próximos eventos.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex h-14 w-full max-w-sm items-center justify-center rounded-xl bg-[#54b678] px-8 text-base font-bold text-[#18253f] shadow-[0_8px_24px_rgba(84,182,120,0.35)] transition-all hover:bg-[#3f9560] hover:scale-[1.02] sm:w-auto"
            >
              Registra tu negocio
            </button>
          </div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="bg-[#f7f7f5]" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
        <Reveal>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 text-center sm:px-6 md:grid-cols-3 md:divide-x md:divide-[#18253f]/10">
            {[
              { num: "10+ categorías", label: "Comida, arte, moda, wellness y más" },
              { num: "Organizadores activos", label: "Buscan vendedores cada semana" },
              { num: "Gratis", label: "Sin costo para registrarte" },
            ].map((m) => (
              <div key={m.num} className="px-4">
                <div
                  className="text-3xl text-[#54b678] sm:text-4xl"
                  style={{ fontFamily: DISPLAY, fontWeight: 700 }}
                >
                  {m.num}
                </div>
                <p className="mt-2 text-sm font-medium text-[#18253f] sm:text-base">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* POR QUÉ */}
      <section className="bg-white" style={{ paddingTop: "4.5rem", paddingBottom: "4.5rem" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2
              className="text-center text-3xl text-[#18253f] sm:text-4xl"
              style={{ fontFamily: DISPLAY, fontWeight: 600 }}
            >
              ¿Por qué registrarte en RutaMercado?
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                Icon: Store,
                title: "Visibilidad ante quien decide",
                desc: "Los organizadores de mercados y bazares buscan aquí primero cuando arman su próximo evento.",
              },
              {
                Icon: Users,
                title: "Contacto directo",
                desc: "Tu Instagram, correo o teléfono queda a la mano para que te inviten sin intermediarios.",
              },
              {
                Icon: Gift,
                title: "Completamente gratis",
                desc: "Un solo registro, cero costo. Nosotros revisamos y publicamos tu perfil.",
              },
            ].map(({ Icon, title, desc }) => (
              <Reveal key={title}>
                <div className="h-full rounded-2xl border border-[#18253f]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#54b678]/15 text-[#54b678]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3
                    className="mt-5 text-xl text-[#18253f]"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#2d2d2d]/80">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
            >
              Registra tu negocio
            </button>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section
        className="bg-[#18253f] text-white"
        style={{ paddingTop: "4.5rem", paddingBottom: "4.5rem" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2
              className="text-center text-3xl sm:text-4xl"
              style={{ fontFamily: DISPLAY, fontWeight: 600 }}
            >
              Así de fácil es aparecer en el directorio
            </h2>
          </Reveal>

          <div className="relative mt-12">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-6 hidden h-px bg-[#54b678]/30 md:block"
              style={{ marginLeft: "16.66%", marginRight: "16.66%" }}
            />

            <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {[
                {
                  n: 1,
                  title: "Llena el formulario",
                  desc: "Cuéntanos sobre tu negocio: qué vendes, cómo contactarte y en qué mercados te gustaría estar.",
                },
                {
                  n: 2,
                  title: "Revisamos y publicamos",
                  desc: "El equipo de RutaMercado revisa tu información y publica tu perfil en el directorio.",
                },
                {
                  n: 3,
                  title: "Los organizadores te encuentran",
                  desc: "Tu perfil queda visible para todos los organizadores de mercados en Puerto Rico.",
                },
              ].map((s, i, arr) => (
                <li key={s.n} className="relative flex flex-col items-center text-center">
                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#54b678] text-xl font-bold text-[#18253f] shadow-[0_0_0_6px_#18253f]"
                    style={{ fontFamily: DISPLAY }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="mt-5 text-xl text-white"
                    style={{ fontFamily: DISPLAY, fontWeight: 600 }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">{s.desc}</p>
                  {i < arr.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="mt-6 h-8 w-px bg-[#54b678]/30 md:hidden"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* DIRECTORIO */}
      <section className="border-b border-[#18253f]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="text-3xl text-[#18253f] sm:text-4xl"
                style={{ fontFamily: DISPLAY, fontWeight: 600 }}
              >
                Directorio de Emprendedores
              </h2>
              <p className="mt-2 text-[#2d2d2d]/70">
                {total} emprendedor{total === 1 ? "" : "es"} en el directorio.
              </p>
            </div>
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
