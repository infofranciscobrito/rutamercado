import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";
import { SubmitMarketForm } from "@/components/rutamercado/SubmitMarketForm";

export const Route = createFileRoute("/enviar")({
  head: () => ({
    meta: [
      { title: "Enviar mi Mercado — RutaMercado" },
      {
        name: "description",
        content:
          "¿Organizas un mercado, feria o bazar en Puerto Rico? Envíanos la info y lo publicamos gratis en el directorio de RutaMercado.",
      },
      { property: "og:title", content: "Enviar mi Mercado — RutaMercado" },
      {
        property: "og:description",
        content:
          "Comparte tu mercadito local con miles de personas que buscan dónde ir el fin de semana.",
      },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#fff8ec]">
      <Header />
      <section
        className="relative overflow-hidden bg-[#1c1e37] text-white"
        style={{ paddingTop: "clamp(3rem, 2rem + 3vw, 5rem)", paddingBottom: "3rem" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f8b625]">
            Para organizadores
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl">
            Publica tu mercado, gratis
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Cuéntanos los detalles de tu evento y lo añadimos al directorio
            después de una revisión rápida.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <SubmitMarketForm />
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#1c1e37]/70 underline-offset-4 hover:underline">
            ← Volver al directorio
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
