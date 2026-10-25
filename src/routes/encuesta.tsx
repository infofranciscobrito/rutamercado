import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { EncuestaApp } from "@/components/encuesta/EncuestaApp";

const URL = "https://rutamercadopr.com/encuesta";
const IMAGE = "https://rutamercadopr.com/encuesta/mrmercado-saludo.png";
const TITLE = "Cuéntanos tu ruta | RutaMercado";
const DESCRIPTION =
  "Date una vuelta con MrMercado y cuéntanos cómo vives los mercados locales de Puerto Rico. Son 2 minutos.";

export const Route = createFileRoute("/encuesta")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGE },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
      { name: "theme-color", content: "#162540" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap",
      },
    ],
  }),
  component: EncuestaPage,
});

function EncuestaPage() {
  return (
    <ClientOnly fallback={<div style={{ minHeight: "100svh", background: "#162540" }} />}>
      <EncuestaApp />
    </ClientOnly>
  );
}
