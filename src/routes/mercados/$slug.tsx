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
  const { market, related } = Route.useLoaderData();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void incrementMarketView({ data: { marketId: market.id } }).catch(() => {});
    track(market.id, "view_detail");
  }, [market.id]);

  const cat = PAGE_BY_CATEGORY.get(market.category);
  const hasOrganizer =
    market.organizer_name ||
    market.organizer_phone ||
    market.organizer_email ||
    market.organizer_instagram ||
    market.organizer_contact_url;

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
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

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {/* HERO — flyer + boleto */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div
                className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl rm-shadow-warm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 motion-safe:fill-mode-backwards"
                style={{
                  background:
                    "linear-gradient(135deg, #18253f 0%, #2d3058 100%)",
                }}
              >
                <MarketImage
                  src={market.image_url}
                  alt={market.name}
                  fit="contain"
                />
              </div>
              <h1 className="mt-6 font-display text-3xl leading-tight text-[#18253f] sm:text-4xl">
                {market.name}
              </h1>
              <div className="mt-3 h-[3px] w-12 bg-[#54b678]" aria-hidden="true" />
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:duration-[450ms] motion-safe:delay-100 motion-safe:fill-mode-backwards">
                <MarketTicketCard market={market} />
              </div>
            </div>
          </div>

          {/* DIVISOR PERFORADO */}
          <TicketPerforation className="my-10" />

          <div className="grid gap-10 lg:grid-cols-5">
            <div className="space-y-10 lg:col-span-3">
              {market.description && (
                <section className="space-y-3">
                  <SectionTitle>Sobre el mercado</SectionTitle>
                  <p className="max-w-[65ch] whitespace-pre-line text-base leading-relaxed text-[#4B5563]">
                    {market.description}
                  </p>
                </section>
              )}

              {hasOrganizer && (
                <section className="space-y-3">
                  <SectionTitle>Organizador</SectionTitle>
                  <div className="rounded-xl bg-white p-4 rm-shadow-warm">
                    {market.organizer_name && (
                      <p className="text-base font-semibold text-[#18253f]">
                        {market.organizer_name}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {market.organizer_phone && (
                        <a
                          href={`tel:${market.organizer_phone}`}
                          onClick={() => track(market.id, "click_phone")}
                          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#54b678] px-3 text-sm font-semibold text-[#18253f] transition-colors hover:bg-[#3f9560]"
                        >
                          <Phone className="h-4 w-4" /> Llamar
                        </a>
                      )}
                      {market.organizer_email && (
                        <a
                          href={`mailto:${market.organizer_email}`}
                          onClick={() => track(market.id, "click_email")}
                          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#18253f] transition-colors hover:border-[#54b678]"
                        >
                          <Mail className="h-4 w-4" /> Email
                        </a>
                      )}
                      {market.organizer_instagram && (
                        <span className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#18253f]">
                          Redes: {market.organizer_instagram}
                        </span>
                      )}
                      {market.organizer_contact_url && (
                        <a
                          href={market.organizer_contact_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track(market.id, "click_contact")}
                          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#18253f] transition-colors hover:border-[#54b678]"
                        >
                          Contactar al productor
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {(market.pets ||
                market.parking ||
                market.accessibility ||
                market.family_friendly) && (
                <section className="space-y-3">
                  <SectionTitle>Servicios e instalaciones</SectionTitle>
                  <MarketAmenityChips market={market} />
                </section>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white px-5 py-2 rm-shadow-warm">
                <AttendanceSection marketId={market.id} />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <RelatedMarkets markets={related} />
          </div>

          <div className="mt-12">
            <NewsletterSignup variant="compact" marketSlug={market.slug ?? undefined} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
