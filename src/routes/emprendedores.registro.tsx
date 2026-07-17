import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, Users, Gift } from "lucide-react";
import { Reveal } from "@/components/rutamercado/Reveal";
import { RegisterEmprendedorForm } from "@/components/emprendedores/RegisterEmprendedorForm";

export const Route = createFileRoute("/emprendedores/registro")({
  head: () => ({
    meta: [
      { title: "Regístrate como Emprendedor — RutaMercado" },
      {
        name: "description",
        content:
          "Publica gratis tu emprendimiento en RutaMercado y deja que los organizadores de mercados, bazares y popups de Puerto Rico te encuentren e inviten a sus próximos eventos.",
      },
      { property: "og:title", content: "Regístrate como Emprendedor — RutaMercado" },
      {
        property: "og:description",
        content:
          "Un solo registro. Cero costo. Aparece en el directorio que los organizadores de mercados de Puerto Rico usan cada semana.",
      },
      { property: "og:url", content: "https://rutamercadopr.com/emprendedores/registro" },
    ],
    links: [
      { rel: "canonical", href: "https://rutamercadopr.com/emprendedores/registro" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RegistroEmprendedorPage,
});

const DISPLAY = '"Cormorant Garamond", Georgia, serif';
const BODY = '"Karla", system-ui, sans-serif';

function scrollToForm() {
  document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function RegistroEmprendedorPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: BODY, color: "#2d2d2d" }}>
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 bg-[#18253f] text-white shadow-[0_2px_20px_rgba(24,37,63,0.25)]"
        style={{ height: 64 }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="RutaMercado — Inicio" className="flex items-center">
            <img src="/logo-rutamercado-horizontal.png" alt="RutaMercado" className="h-16 w-auto" />
          </Link>
          <Link
            to="/emprendedores"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#54b678] px-4 text-sm font-semibold text-[#54b678] transition-colors hover:bg-[#54b678] hover:text-[#18253f]"
          >
            Ver Directorio
          </Link>
        </div>
      </header>

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
              onClick={scrollToForm}
              className="inline-flex h-14 w-full max-w-sm items-center justify-center rounded-xl bg-[#54b678] px-8 text-base font-bold text-[#18253f] shadow-[0_8px_24px_rgba(84,182,120,0.35)] transition-all hover:bg-[#3f9560] hover:scale-[1.02] sm:w-auto"
            >
              Registrar mi emprendimiento
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

      {/* FORMULARIO */}
      <section
        id="formulario"
        className="scroll-mt-20 bg-[#f7f7f5]"
        style={{ paddingTop: "4.5rem", paddingBottom: "4.5rem" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2
              className="text-3xl text-[#18253f] sm:text-4xl"
              style={{ fontFamily: DISPLAY, fontWeight: 600 }}
            >
              Regístrate como Emprendedor
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#2d2d2d]/75">
              Completa los campos y tu perfil estará en el directorio en menos de 24 horas.
            </p>
          </Reveal>
        </div>
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <RegisterEmprendedorForm variant="inline" />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="bg-[#18253f] text-white"
        style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <img
            src="/logo-rutamercado-horizontal.png"
            alt="RutaMercado"
            className="h-24 w-auto md:h-28"
          />
          <p className="text-sm text-white/60">© 2025 RutaMercado. Todos los derechos reservados.</p>
          <Link to="/emprendedores" className="text-sm font-semibold text-[#54b678] hover:underline">
            Ver directorio completo
          </Link>
        </div>
      </footer>
    </div>
  );
}
