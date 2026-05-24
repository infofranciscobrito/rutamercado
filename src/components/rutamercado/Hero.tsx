import { Search } from "lucide-react";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  stats: { markets: number; municipalities: number; categories: number };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl text-[#f8b625] sm:text-4xl">
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
      className="relative overflow-hidden rm-gradient-hero"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 rm-hero-pattern opacity-100" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1c1e37]/40" aria-hidden="true" />

      <div
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
        style={{ paddingTop: "clamp(3rem, 2.5rem + 3vw, 5rem)", paddingBottom: "clamp(3rem, 2.5rem + 3vw, 5rem)" }}
      >
        <h1
          id="hero-title"
          className="rm-animate-fade-up-lg font-display rm-text-hero text-white"
        >
          Descubre los mercados locales de Puerto Rico
        </h1>
        <p
          className="rm-animate-fade-up-lg mx-auto mt-5 max-w-xl rm-text-hero-sub text-white/75"
          style={{ animationDelay: "100ms" }}
        >
          Mercados agrícolas, bazares, ferias artesanales y más. Encuentra qué hay
          cerca de ti este fin de semana.
        </p>

        <div
          className="rm-animate-fade-up mx-auto mt-8 max-w-xl"
          style={{ animationDelay: "200ms" }}
        >
          <label htmlFor="hero-search" className="sr-only">
            Buscar mercado
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="¿Qué mercado buscas?"
              className="h-14 w-full rounded-xl border-2 border-transparent bg-white pl-14 pr-4 text-base text-[#1c1e37] shadow-[0_8px_30px_rgba(0,0,0,0.25)] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#f8b625] focus:shadow-[0_8px_30px_rgba(0,0,0,0.25),0_0_0_4px_rgba(248,182,37,0.18)]"
            />
          </div>
        </div>

        <div
          className="rm-animate-fade-up mt-10 hidden items-center justify-center gap-10 sm:flex"
          style={{ animationDelay: "300ms" }}
        >
          <Stat value={stats.markets} label="Mercados Activos" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#f8b625]" aria-hidden="true" />
          <Stat value={stats.municipalities} label="Municipios" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#f8b625]" aria-hidden="true" />
          <Stat value={stats.categories} label="Categorías" />
        </div>
      </div>
    </section>
  );
}
