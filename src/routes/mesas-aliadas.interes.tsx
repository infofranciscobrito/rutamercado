import { createFileRoute } from "@tanstack/react-router";
import { MesasAliadasInteresApp } from "@/components/mesas-aliadas-interes/MesasAliadasInteresApp";

const URL = "https://rutamercadopr.com/mesas-aliadas/interes";
const IMAGE = "https://rutamercadopr.com/og-mesas-aliadas.png";
const TITLE = "Mesas Aliadas: que sigan apoyando lo tuyo | RutaMercado";
const DESCRIPTION =
  "Detrás de tu mesa hay esfuerzo y corazón. Ayúdanos a explorar una iniciativa para que tus clientes vuelvan. Tu opinión cuenta, sin compromiso.";

export const Route = createFileRoute("/mesas-aliadas/interes")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "MrMercado invita: ¿Te interesa ser Mesa Aliada?" },
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
  component: MesasAliadasInteresPage,
});

function MesasAliadasInteresPage() {
  return <MesasAliadasInteresApp />;
}
