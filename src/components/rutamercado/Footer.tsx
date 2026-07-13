import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";

const linkClass =
  "text-white/70 transition-colors hover:text-[#54b678]";
const columnTitleClass =
  "font-display text-lg text-white";

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
          paddingBottom: "clamp(2rem, 1.5rem + 1.5vw, 3rem)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1 — Brand */}
            <div className="flex flex-col items-start">
              <img
                src="/logo-rutamercado-horizontal.png"
                alt="RutaMercado"
                className="h-14 w-auto"
              />
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Descubre los mercados locales de Puerto Rico.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <a
                  href="https://www.instagram.com/rutamercadopr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-[#54b678] transition-opacity hover:opacity-80"
                >
                  <Instagram size={22} />
                </a>
                <a
                  href="https://www.facebook.com/rutamercadopr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-[#54b678] transition-opacity hover:opacity-80"
                >
                  <Facebook size={22} />
                </a>
              </div>
            </div>

            {/* Col 2 — Explorar */}
            <div>
              <h3 className={columnTitleClass}>Explorar</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/mercado-agricola" className={linkClass}>
                    Mercados Agrícolas
                  </Link>
                </li>
                <li>
                  <Link to="/bazar-pop-up" className={linkClass}>
                    Bazares
                  </Link>
                </li>
                <li>
                  <Link to="/feria-artesanal" className={linkClass}>
                    Ferias Artesanales
                  </Link>
                </li>
                <li>
                  <Link to="/mercado-mixto" className={linkClass}>
                    Mercados Mixtos
                  </Link>
                </li>
                <li>
                  <a href="/#municipios" className={linkClass}>
                    Todos los municipios
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 — Para Organizadores */}
            <div>
              <h3 className={columnTitleClass}>Para Organizadores</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/enviar" className={linkClass}>
                    Registrar mi mercado
                  </Link>
                </li>
                <li>
                  <a href="/#contacto" className={linkClass}>
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4 — Legal / Sobre */}
            <div>
              <h3 className={columnTitleClass}>Legal</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="/#sobre-nosotros" className={linkClass}>
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <Link to="/politica-de-privacidad" className={linkClass}>
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidad" className={linkClass}>
                    Términos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-white/50">
              © 2025 RutaMercado — Hecho con <span aria-label="amor">❤️</span> en Puerto Rico
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
