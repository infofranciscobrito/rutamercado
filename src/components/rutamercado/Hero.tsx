import { Search } from "lucide-react";
import heroBg from "@/assets/hero-bg.png.asset.json";


interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  stats: { markets: number; municipalities: number; categories: number };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl text-[#54b678] sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
        {label}
      </div>
    </div>
  );
}

export function Hero({ query, onQueryChange, stats }: Props) {
  return (
    <section
      className="relative overflow-hidden bg-[#18253f]"
      aria-labelledby="hero-title"
    >
      {/* Capa 1: imagen de fondo (más zoom en mobile para mostrar personajes) */}
      <div
        className="absolute inset-0 bg-[85%_65%] bg-no-repeat bg-[length:240%_auto] sm:bg-[80%_60%] sm:bg-[length:180%_auto] lg:bg-[right_35%_bottom_40%] lg:bg-cover"
        style={{ backgroundImage: `url('${heroBg.url}')` }}
        aria-hidden="true"
      />

      {/* Capa 2: tinte navy (multiply) — convierte la ilustración en monocroma azul */}
      <div className="absolute inset-0 bg-[#18253f]/55 mix-blend-multiply" aria-hidden="true" />
      {/* Capa 3: gradiente vertical para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#18253f]/40 via-transparent to-[#18253f]/85" aria-hidden="true" />
      {/* Capa 4: patrón de puntos dorados sutil */}
      <div className="absolute inset-0 rm-hero-pattern opacity-40" aria-hidden="true" />
      {/* Capa 5: fade final hacia el contenido */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#18253f]" aria-hidden="true" />


      <div
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
        style={{ paddingTop: "clamp(3.5rem, 3rem + 3vw, 6rem)", paddingBottom: "clamp(4rem, 3.5rem + 3vw, 6.5rem)" }}
      >
        <h1
          id="hero-title"
          className="rm-animate-fade-up-lg font-display rm-text-hero text-white drop-shadow-lg"
        >
          Descubre los Mercados Locales en Puerto Rico
        </h1>
        <p
          className="rm-animate-fade-up-lg mx-auto mt-5 max-w-xl rm-text-hero-sub text-white/85"
          style={{ animationDelay: "100ms" }}
        >
          Mercados agrícolas, bazares, ferias artesanales y más. Encuentra qué hay
          cerca de ti este fin de semana.
        </p>

        <div
          className="rm-animate-fade-up mx-auto mt-10 max-w-3xl"
          style={{ animationDelay: "200ms" }}
        >
          <label htmlFor="hero-search" className="sr-only">
            Buscar mercado
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#6B7280]"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="¿Qué mercado buscas?"
              className="h-16 w-full rounded-2xl border-2 border-transparent bg-white/95 pl-16 pr-5 text-lg text-[#18253f] shadow-[0_8px_30px_rgba(0,0,0,0.35)] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#54b678] focus:bg-white focus:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_0_4px_rgba(84,182,120,0.18)] sm:h-[68px] sm:text-xl"
            />
          </div>
        </div>

        <div
          className="rm-animate-fade-up mt-10 hidden items-center justify-center gap-10 sm:flex"
          style={{ animationDelay: "300ms" }}
        >
          <Stat value={stats.markets} label="Mercados Activos" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#54b678]" aria-hidden="true" />
          <Stat value={stats.municipalities} label="Municipios" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#54b678]" aria-hidden="true" />
          <Stat value={stats.categories} label="Categorías" />
        </div>
      </div>
    </section>
  );
}
