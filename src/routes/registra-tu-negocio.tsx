import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ClipboardEdit,
  SearchCheck,
  Mail,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { listEmprendedores } from "@/lib/emprendedores.functions";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";
import { RegisterEmprendedorForm } from "@/components/emprendedores/RegisterEmprendedorForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const emprendedoresQueryOptions = queryOptions({
  queryKey: ["emprendedores"],
  queryFn: () => listEmprendedores(),
});

const URL = "https://rutamercadopr.com/registra-tu-negocio";
const TITLE =
  "Registra tu negocio gratis — Vende en mercados y bazares de Puerto Rico | RutaMercado";
const DESC =
  "Regístrate gratis y hazte visible ante los organizadores de mercados, bazares y pop-ups de Puerto Rico. Un solo registro, invitaciones directas.";
const IMG = "https://rutamercadopr.com/og-negocios.png";

export const Route = createFileRoute("/registra-tu-negocio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: IMG },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(emprendedoresQueryOptions),
  component: RegistraTuNegocioPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-destructive">
      Error: {(error as Error).message}
    </div>
  ),
});

function scrollToForm() {
  document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CtaButton() {
  return (
    <button
      type="button"
      onClick={scrollToForm}
      className="inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]"
    >
      Registra tu negocio
    </button>
  );
}

const STEPS = [
  { icon: ClipboardEdit, title: "Te registras en 5 minutos" },
  { icon: SearchCheck, title: "Revisamos tu perfil (24 horas o menos)" },
  { icon: Mail, title: "Los organizadores te encuentran y te invitan" },
];

const FAQ = [
  { q: "¿Cuesta algo?", a: "No, registrarte es gratis." },
  { q: "¿Cuánto tarda la aprobación?", a: "Revisamos cada perfil en 24 horas o menos." },
  {
    q: "¿Qué información se publica?",
    a: "Nombre, logo, descripción, categoría, municipio, mercados y tus datos de contacto (Instagram, email, teléfono). Las preguntas sobre tu negocio (tiempo operando, registro, ingresos, canales, equipo) son internas y no se publican.",
  },
  { q: "¿Cómo cambio mi información?", a: "Escríbenos por la sección de Contacto." },
];

function RegistraTuNegocioPage() {
  const { data } = useSuspenseQuery(emprendedoresQueryOptions);
  const total = data.length;
  const logos = data.filter((e) => e.logo_url).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#18253f]">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/15">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 md:py-20">
          <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            Vende en más mercados de Puerto Rico
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-xl">
            Un solo registro, gratis. Los organizadores de mercados, bazares y
            pop-ups te encuentran y te invitan.
          </p>
          <div className="mt-6">
            <CtaButton />
          </div>
          <p className="mt-4 text-sm text-[#54b678]">
            Ya hay {total} negocio{total === 1 ? "" : "s"} en el directorio
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-2xl text-white md:text-3xl">Cómo funciona</h2>
          <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-start gap-4 rounded-2xl bg-white/5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#54b678]/15">
                  <s.icon className="h-6 w-6 text-[#54b678]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#54b678]">Paso {i + 1}</p>
                  <p className="mt-1 font-display text-lg text-white">{s.title}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ¿Por qué registrarte? */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-2xl text-white md:text-3xl">¿Por qué registrarte?</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <Users className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">Más invitaciones</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Los organizadores buscan aquí primero cuando arman su próximo
                mercado o bazar.
              </p>
            </div>
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <Sparkles className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">Cero costo, un solo registro</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Creas tu perfil una vez y queda visible para todos los
                organizadores en la plataforma.
              </p>
            </div>
            <div className="rounded-2xl border border-[#54b678]/30 bg-white/5 p-6">
              <ShieldCheck className="h-8 w-8 text-[#54b678]" />
              <h3 className="mt-3 font-display text-xl text-white">Presencia seria</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Tu perfil pasa por aprobación, igual que los mercados y
                productores, así que estar listado transmite confianza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vista previa del directorio */}
      {logos.length > 0 ? (
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6">
            <h2 className="font-display text-2xl text-white md:text-3xl">
              Ellos ya están en el directorio
            </h2>
            <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-4 md:grid-cols-8">
              {logos.map((e) => (
                <div
                  key={e.id}
                  className="aspect-square overflow-hidden rounded-xl bg-white"
                  title={e.nombre_negocio}
                >
                  <img
                    src={e.logo_url!}
                    alt={e.nombre_negocio}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <Link
              to="/negocios"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#54b678] hover:underline"
            >
              Ver el directorio completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* Formulario */}
      <section id="formulario" className="scroll-mt-20 bg-[#FFF8EC]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-2xl text-[#18253f] md:text-3xl">
            Regístrate como emprendedor
          </h2>
          <p className="mt-2 text-sm text-[#18253f]/70">
            Completa los datos de tu negocio. Revisaremos tu información y
            publicaremos tu perfil en el directorio.
          </p>
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <RegisterEmprendedorForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-2xl text-white md:text-3xl">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-white/15">
                <AccordionTrigger className="text-left text-white">{f.q}</AccordionTrigger>
                <AccordionContent className="text-white/80">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Cierre */}
      <section>
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl text-white md:text-3xl">
            Tu próximo mercado te está buscando
          </h2>
          <div className="mt-6">
            <CtaButton />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
