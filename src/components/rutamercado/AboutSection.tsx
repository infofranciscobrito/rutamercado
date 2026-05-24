import { MapPin } from "lucide-react";

export function AboutSection() {
  return (
    <section
      id="sobre-nosotros"
      className="relative overflow-hidden bg-[#1c1e37] text-white"
      style={{
        paddingTop: "clamp(4rem, 3rem + 4vw, 7rem)",
        paddingBottom: "clamp(4rem, 3rem + 4vw, 7rem)",
      }}
      aria-labelledby="sobre-nosotros-title"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f8b625]">
            Conoce RutaMercado
          </p>
          <h2
            id="sobre-nosotros-title"
            className="mt-4 font-display rm-text-section text-white"
          >
            Tu guía para descubrir los mejores mercados locales de Puerto Rico
          </h2>
          <p className="mt-6 text-base leading-[1.8] text-white/75">
            Conectamos a la comunidad con los mercaditos, ferias artesanales,
            bazares y mercados agrícolas que hacen única nuestra isla.
          </p>
          <p className="mt-4 text-base leading-[1.8] text-white/75">
            ¿Organizas un mercado local? Envíanos la información de tu evento
            y lo publicamos gratis en nuestro directorio.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#f8b625] px-7 text-base font-semibold text-[#1c1e37] transition-all hover:scale-[1.02] hover:bg-[#f59e0b] hover:shadow-[0_4px_15px_rgba(248,182,37,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b625] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1e37]"
          >
            Enviar mi Mercado
          </a>
        </div>

        <div className="relative hidden h-72 lg:block" aria-hidden="true">
          <div className="absolute left-12 top-4 h-32 w-32 rounded-full bg-[#f8b625]/10 blur-2xl" />
          <div className="absolute right-8 bottom-4 h-40 w-40 rounded-full bg-[#f8b625]/15 blur-3xl" />
          <div className="absolute left-1/4 top-8 inline-flex h-20 w-20 items-center justify-center rounded-full border border-[#f8b625]/30">
            <MapPin className="h-8 w-8 text-[#f8b625]/60" strokeWidth={1.5} />
          </div>
          <div className="absolute right-12 top-24 inline-flex h-28 w-28 items-center justify-center rounded-full border border-[#f8b625]/40">
            <MapPin className="h-12 w-12 text-[#f8b625]/80" strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-6 left-24 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#f8b625]/20">
            <MapPin className="h-6 w-6 text-[#f8b625]/40" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
