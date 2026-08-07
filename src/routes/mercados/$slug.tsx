import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ChevronRight, Mail, Phone } from "lucide-react";
import {
  getMarketBySlug,
  getRelatedMarkets,
} from "@/lib/market-detail.functions";
import { incrementMarketView } from "@/lib/analytics.functions";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";
import { MarketImage } from "@/components/rutamercado/MarketImage";
import {
  AttendanceSection,
  SectionTitle,
  track,
} from "@/components/rutamercado/MarketDetailContent";
import { MarketTicketCard } from "@/components/rutamercado/MarketTicketCard";
import { TicketPerforation } from "@/components/rutamercado/TicketPerforation";
import { MarketAmenityChips } from "@/components/rutamercado/MarketAmenityChips";
import { RelatedMarkets } from "@/components/rutamercado/RelatedMarkets";
import { PAGE_BY_CATEGORY } from "@/lib/category-pages";

const BASE = "https://rutamercadopr.com";

export const Route = createFileRoute("/mercados/$slug")({
  loader: async ({ params }) => {
    const market = await getMarketBySlug({ data: { slug: params.slug } });
    if (!market) throw notFound();
    const related = await getRelatedMarkets({
      data: {
        id: market.id,
        category: market.category,
        region: market.region,
      },
    }).catch(() => []);
    return { market, related };
  },
  head: ({ params, loaderData }) => {
    const url = `${BASE}/mercados/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Mercado no disponible | RutaMercado" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const m = loaderData.market;
    const title = `${m.name} — ${m.municipality}, PR | RutaMercado`;
    const description =
      (m.description?.trim().slice(0, 155) ||
        `${m.category} en ${m.municipality}, ${m.region}. Fechas, horario y cómo llegar.`) ?? "";
    const image = m.image_url ?? `${BASE}/og-image.png`;


    const event = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: m.name,
      description: m.description ?? description,
      url,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(m.nextDate
        ? {
            startDate: `${m.nextDate}T${m.nextStartTime}`,
            endDate: `${m.nextDate}T${m.nextEndTime}`,
          }
        : {}),
      image: [image],
      location: {
        "@type": "Place",
        name: m.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: m.address,
          addressLocality: m.municipality,
          addressRegion: m.region,
          addressCountry: "PR",
        },
      },
      ...(m.organizer_name
        ? {
            organizer: {
              "@type": "Organization",
              name: m.organizer_name,
              ...(m.organizer_contact_url ? { url: m.organizer_contact_url } : {}),
            },
          }
        : {}),
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "RutaMercado" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(event) },
      ],
    };
  },
  component: MarketPage,
  notFoundComponent: MarketNotFound,
  errorComponent: MarketNotFound,
});

function MarketNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <Header />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-[#18253f]">
          Este mercado ya no está disponible
        </h1>
        <p className="mt-3 text-[#6B7280]">
          Descubre otros mercados locales en nuestro directorio.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#54b678] px-6 text-base font-semibold text-[#18253f] hover:bg-[#3f9560]"
        >
          Volver al directorio
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function MarketPage() {
  const market = Route.useLoaderData();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void incrementMarketView({ data: { marketId: market.id } }).catch(() => {});
    track(market.id, "view_detail");
  }, [market.id]);

  const cat = PAGE_BY_CATEGORY.get(market.category);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
          <nav
            aria-label="breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-[#6B7280]"
          >
            <Link to="/" className="hover:text-[#18253f]">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
            {cat ? (
              <>
                <Link to={`/${cat.slug}` as "/"} className="hover:text-[#18253f]">
                  {cat.pageTitle}
                </Link>
                <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              </>
            ) : null}
            <span className="text-[#18253f]">{market.name}</span>
          </nav>
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          <article className="overflow-hidden rounded-2xl bg-white rm-shadow-warm">
            <div
              className="relative min-h-[280px] w-full overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #18253f 0%, #2d3058 100%)",
              }}
            >
              <MarketImage src={market.image_url} alt={market.name} fit="contain" />
              <span className="absolute left-4 top-4 rounded-md bg-[#54b678] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#18253f] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                {market.category}
              </span>
            </div>
            <MarketDetailContent market={market} headingLevel="h1" />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
