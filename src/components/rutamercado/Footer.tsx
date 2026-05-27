export function Footer() {
  return (
    <>
      <div className="bg-[#1c1e37]" style={{ paddingTop: "30px", paddingBottom: "30px" }}>
        <div className="mx-auto h-[2px] w-20 bg-[#f8b625]" aria-hidden="true" />
      </div>
      <footer
        className="bg-[#1c1e37] text-white"
        style={{
          paddingTop: "clamp(2.5rem, 2rem + 2vw, 4rem)",
          paddingBottom: "clamp(2.5rem, 2rem + 2vw, 4rem)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6">
          <img
            src="/logo-rutamercado-horizontal.png"
            alt="RutaMercado"
            className="h-8 w-auto opacity-80"
          />
          <p className="mt-5 text-sm text-white/50">
            © 2025 RutaMercado — Descubre los mercados locales de Puerto Rico
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <a href="#sobre-nosotros" className="text-white/60 transition-colors hover:text-[#f8b625]">
              Sobre Nosotros
            </a>
            <span className="text-[#f8b625]/30" aria-hidden="true">·</span>
            <a href="#sobre-nosotros" className="text-white/60 transition-colors hover:text-[#f8b625]">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
