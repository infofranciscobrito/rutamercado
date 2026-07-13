import { Link } from "@tanstack/react-router";
import { CategoryIcon } from "@/components/rutamercado/icons/CategoryIcons";
import type { MarketCategory } from "@/types/market";

const CATEGORY_ITEMS: { category: MarketCategory; label: string }[] = [
  { category: "Mercado Agrícola", label: "Mercados Agrícolas" },
  { category: "Bazaar/Pop Up", label: "Bazares" },
  { category: "Feria Artesanal", label: "Ferias Artesanales" },
  { category: "Mercado Mixto", label: "Mercados Mixtos" },
];

export function AboutSection() {
  return (
    <section
      id="sobre-nosotros"
      className="relative overflow-hidden bg-[#18253f] text-white"
      style={{
        paddingTop: "clamp(4rem, 3rem + 4vw, 7rem)",
        paddingBottom: "clamp(4rem, 3rem + 4vw, 7rem)",
      }}
      aria-labelledby="sobre-nosotros-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54b678]">
            Conoce RutaMercado
          </p>
          <h2
            id="sobre-nosotros-title"
            className="mt-4 font-display rm-text-section text-white"
          >
            Tu guía para descubrir los mejores mercados locales de Puerto Rico
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Bloque 1 — Misión */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="font-display text-2xl text-white">Misión</h3>
            <p className="mt-4 leading-[1.8] text-white/80">
              Conectamos a los puertorriqueños con los mercados locales de su
              comunidad. Creemos en la economía circular, el producto local y el
              talento boricua.
            </p>
          </div>

          {/* Bloque 2 — ¿Qué encontrarás? */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="font-display text-2xl text-white">
              ¿Qué encontrarás?
            </h3>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {CATEGORY_ITEMS.map(({ category, label }) => (
                <li
                  key={category}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#54b678]/15 text-[#54b678]">
                    <CategoryIcon category={category} className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-white/90">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque 3 — Para organizadores */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="font-display text-2xl text-white">
              Para organizadores
            </h3>
            <p className="mt-4 leading-[1.8] text-white/80">
              ¿Tienes un mercado? Regístralo gratis y llega a miles de
              personas.
            </p>
            <Link
              to="/enviar"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#54b678] px-7 text-base font-semibold text-[#18253f] transition-all hover:scale-[1.02] hover:bg-[#3f9560] hover:shadow-[0_4px_15px_rgba(84,182,120,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54b678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18253f]"
            >
              Registrar mi Mercado
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
