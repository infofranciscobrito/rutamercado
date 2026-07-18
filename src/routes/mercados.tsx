import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapPin, CalendarDays, Gift } from "lucide-react";
import { SubmitMarketForm } from "@/components/rutamercado/SubmitMarketForm";

export const Route = createFileRoute("/mercados")({
  head: () => ({
    meta: [
      { title: "Registra tu mercado — RutaMercado" },
      {
        name: "description",
        content:
          "Publica gratis tu mercado, feria o bazar en RutaMercado y llega a miles de puertorriqueños que buscan dónde ir cada fin de semana.",
      },
      { property: "og:title", content: "Registra tu mercado — RutaMercado" },
      {
        property: "og:description",
        content:
          "Publica gratis tu mercado en el directorio que la comunidad de Puerto Rico usa cada semana.",
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
  component: SubmitPage,
});

const DISPLAY = '"Cormorant Garamond", Georgia, serif';
const BODY = '"Karla", system-ui, sans-serif';

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[400ms] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function scrollToForm() {
  document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SubmitPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: BODY, color: "#2d2d2d" }}>
      {/* 1. HEADER */}
      <Header />


      {/* 2. HERO */}
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
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#54b678]"
            style={{ fontFamily: BODY }}
          >
            Para organizadores
          </p>
          <h1
            className="mt-4 text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
            style={{ fontFamily: DISPLAY, fontWeight: 600 }}
          >
            Registra tu mercado. Llega a miles de puertorriqueños.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            RutaMercado es el directorio donde la comunidad busca mercados, ferias y bazares
            en toda la isla. Publica tu evento gratis y aumenta tu audiencia.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex h-14 w-full max-w-sm items-center justify-center rounded-xl bg-[#54b678] px-8 text-base font-bold text-[#18253f] shadow-[0_8px_24px_rgba(84,182,120,0.35)] transition-all hover:bg-[#3f9560] hover:scale-[1.02] sm:w-auto"
            >
              Registrar mi mercado ahora
            </button>
          </div>
        </div>
      </section>

      {/* 3. MÉTRICAS */}
      <section className="bg-[#f7f7f5]" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
        <Reveal>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 text-center sm:px-6 md:grid-cols-3 md:divide-x md:divide-[#18253f]/10">
            {[
              { num: "10+ municipios", label: "Mercados en toda la isla" },
              { num: "Directorio activo", label: "Actualizado cada semana" },
              { num: "Gratis", label: "Sin costo para publicar" },
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

      {/* 4. POR QUÉ */}
      <section className="bg-white" style={{ paddingTop: "4.5rem", paddingBottom: "4.5rem" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2
              className="text-center text-3xl text-[#18253f] sm:text-4xl"
              style={{ fontFamily: DISPLAY, fontWeight: 600 }}
            >
              ¿Por qué registrar tu mercado en RutaMercado?
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                Icon: MapPin,
                title: "Visibilidad donde la gente busca",
                desc: "Los compradores que andan buscando su próximo mercadito van a encontrar el tuyo directamente en el directorio.",
              },
              {
                Icon: CalendarDays,
                title: "Tu mercado siempre al día",
                desc: "Aparece en los filtros de fecha para que nadie se pierda cuándo y dónde es tu próximo evento.",
              },
              {
                Icon: Gift,
                title: "Completamente gratis",
                desc: "Registrar tu mercado no tiene ningún costo. Solo llena el formulario y nosotros publicamos tu evento.",
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

      {/* 5. CÓMO FUNCIONA */}
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
              Así de fácil es publicar tu mercado
            </h2>
          </Reveal>

          <div className="relative mt-12">
            {/* Desktop connector line */}
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
                  desc: "Cuéntanos los detalles de tu mercado: nombre, fecha, lugar y cómo contactarte.",
                },
                {
                  n: 2,
                  title: "Revisamos y publicamos",
                  desc: "El equipo de RutaMercado revisa la información y la sube al directorio.",
                },
                {
                  n: 3,
                  title: "Tu mercado aparece en el directorio",
                  desc: "Miles de personas en Puerto Rico podrán encontrar tu mercado directamente desde rutamercadopr.com",
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

                  {/* Mobile connector below step (except last) */}
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

      {/* 6. FORMULARIO */}
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
              Registra tu mercado
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#2d2d2d]/75">
              Completa los campos y tu mercado estará en el directorio en menos de 24 horas.
            </p>
          </Reveal>
        </div>
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <SubmitMarketForm />
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#18253f] text-white" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <img src="/logo-rutamercado-horizontal.png" alt="RutaMercado" className="h-24 w-auto md:h-28" />
          <p className="text-sm text-white/60">© 2025 RutaMercado. Todos los derechos reservados.</p>
          <Link to="/" className="text-sm font-semibold text-[#54b678] hover:underline">
            Ver directorio completo
          </Link>
        </div>
      </footer>
    </div>
  );
}
