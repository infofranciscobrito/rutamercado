export function AboutSection() {
  return (
    <section
      id="sobre-nosotros"
      className="bg-[#1c1e37] px-4 py-16 text-white sm:px-6 sm:py-20"
      aria-labelledby="sobre-nosotros-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="sobre-nosotros-title"
          className="font-display text-3xl text-white sm:text-4xl"
        >
          Sobre RutaMercado
        </h2>
        <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">
          RutaMercado es tu guía para descubrir los mejores mercados locales en
          Puerto Rico. Conectamos a la comunidad con los mercaditos, ferias
          artesanales, bazares y mercados agrícolas que hacen única nuestra
          isla.
        </p>
        <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
          ¿Organizas un mercado local? Envíanos la información de tu evento y
          lo publicamos gratis en nuestro directorio.
        </p>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-[#f8b625] px-6 py-3 text-base font-semibold text-[#1c1e37] transition-colors hover:bg-[#f8b625]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b625] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1e37]"
        >
          Enviar mi Mercado
        </a>
      </div>
    </section>
  );
}
