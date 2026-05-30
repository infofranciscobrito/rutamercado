import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <>
      <div className="bg-[#18253f]" style={{ paddingTop: "30px", paddingBottom: "30px" }}>
        <div className="mx-auto h-[2px] w-20 bg-[#54b678]" aria-hidden="true" />
      </div>
      <footer
        className="bg-[#18253f] text-white"
        style={{
          paddingTop: "clamp(2.5rem, 2rem + 2vw, 4rem)",
          paddingBottom: "clamp(2.5rem, 2rem + 2vw, 4rem)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6">
          <img
            src="/logo-rutamercado-horizontal.png"
            alt="RutaMercado"
            className="h-24 w-auto md:h-28"
          />
          <p className="mt-5 text-sm text-white/50">
            © 2025 RutaMercado — Descubre los mercados locales de Puerto Rico
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
            <a href="#sobre-nosotros" className="text-white/60 transition-colors hover:text-[#54b678]">
              Sobre Nosotros
            </a>
            <span className="text-[#54b678]/30" aria-hidden="true">·</span>
            <a href="#sobre-nosotros" className="text-white/60 transition-colors hover:text-[#54b678]">
              Contacto
            </a>
            <span className="text-[#54b678]/30" aria-hidden="true">·</span>
            <Link
              to="/politica-de-privacidad"
              className="text-white/60 transition-colors hover:text-[#54b678]"
            >
              Políticas de Privacidad y Términos de Uso

            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
