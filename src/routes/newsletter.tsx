import { createFileRoute } from "@tanstack/react-router";
import { marketsQueryOptions } from "@/lib/markets-query";
import { HomeView } from "@/components/rutamercado/HomeView";

const URL = "https://rutamercadopr.com/newsletter";
const IMAGE = "https://rutamercadopr.com/og-newsletter.png";
const TITLE = "Suscríbete al Newsletter | RutaMercado";
const DESCRIPTION =
  "Recibe los mercados de Puerto Rico directo en tu correo cada semana. Sin spam, cancelas cuando quieras.";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGE },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "RutaMercado" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(marketsQueryOptions),
  component: NewsletterPage,
});

function NewsletterPage() {
  return (
    <HomeView
      trackAs="/newsletter"
      scrollTo="newsletter"
      search={{
        q: "",
        date: "all",
        region: "all",
        municipality: "all",
        category: "all",
      }}
    />
  );
}
