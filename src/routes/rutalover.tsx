import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rutalover")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/rutralover", search: location.search, statusCode: 301 });
  },
  head: () => ({ meta: [
    { title: "RutaLover · Enlace de la encuesta | RutaMercado" },
    { name: "description", content: "Accede a la encuesta de membresía RutaLover de RutaMercado." },
    { property: "og:title", content: "RutaLover · Encuesta de RutaMercado" },
    { property: "og:description", content: "Cuéntanos cómo vives los mercados locales de Puerto Rico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});