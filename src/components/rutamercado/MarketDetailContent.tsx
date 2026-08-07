import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Repeat,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EnrichedMarket } from "@/types/market";
import { formatDateEs, formatTimeRange, googleMapsUrl } from "@/lib/format";
import { trackMarketClick } from "@/lib/analytics.functions";
import {
  getMarketIntentionCount,
  recordAttendanceIntention,
} from "@/lib/attendance.functions";
import {
  getOrCreateVisitorId,
  hasVoted,
  markVoted,
} from "@/lib/visitor-id";

export function track(marketId: string, clickType: string) {
  void trackMarketClick({ data: { marketId, clickType } }).catch(() => {});
}

function MiniFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#FFF8EC] p-3.5">
      <div className="text-[#54b678]">{icon}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-[#6B7280]">
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold text-[#18253f]">
        {value}
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
      {children}
    </h3>
  );
}

/**
 * Cuerpo compartido de la ficha de un mercado.
 * Se usa tanto en el diálogo como en la página individual /mercados/[slug].
 */
export function MarketDetailContent({
  market,
  headingLevel = "h2",
}: {
  market: EnrichedMarket;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div className="space-y-6 p-6">
      <div>
        <Heading className="font-display text-2xl leading-tight text-[#18253f]">
          {market.name}
        </Heading>
        <div className="mt-3 h-[3px] w-12 bg-[#54b678]" aria-hidden="true" />
        {market.description && (
          <p className="mt-4 text-base leading-relaxed text-[#4B5563]">
            {market.description}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <SectionTitle>Detalles del Evento</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <MiniFact
            icon={<CalendarDays className="h-5 w-5" />}
            label="Próxima fecha"
            value={
              market.nextDate
                ? formatDateEs(market.nextDate)
                : formatDateEs(market.recurrence_start_date)
            }
          />
          <MiniFact
            icon={<Clock className="h-5 w-5" />}
            label="Horario"
            value={formatTimeRange(market.nextStartTime, market.nextEndTime)}
          />
          {market.recurrence_label && (
            <MiniFact
              icon={<Repeat className="h-5 w-5" />}
              label="Frecuencia"
              value={market.recurrence_label}
            />
          )}
          <MiniFact
            icon={<MapPin className="h-5 w-5" />}
            label="Ubicación"
            value={`${market.municipality}, ${market.region}`}
          />
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-[#F9FAFB] px-4 py-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
          <span className="text-sm text-[#18253f]">{market.address}</span>
        </div>
      </div>

      {(market.organizer_name ||
        market.organizer_phone ||
        market.organizer_email ||
        market.organizer_instagram ||
        market.organizer_contact_url) && (
        <div className="space-y-3">
          <SectionTitle>Organizador</SectionTitle>
          <div className="rounded-xl bg-[#FAFAF8] p-4">
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
        </div>
      )}

      <ServicesSection market={market} />

      <AttendanceSection marketId={market.id} />

      <a
        href={googleMapsUrl(market.address, market.municipality)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(market.id, "click_directions")}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#18253f] text-base font-semibold text-white transition-colors hover:bg-[#2d3058]"
      >
        <Navigation className="h-5 w-5" />
        Cómo llegar
      </a>
    </div>
  );
}

function ServicesSection({ market }: { market: EnrichedMarket }) {
  const items = (
    [
      { emoji: "🐕", label: "Mascotas", value: market.pets ?? null },
      { emoji: "🅿️", label: "Estacionamiento", value: market.parking ?? null },
      { emoji: "♿", label: "Accesibilidad", value: market.accessibility ?? null },
      { emoji: "👶", label: "Familiar", value: market.family_friendly ?? null },
    ] as { emoji: string; label: string; value: string | null }[]
  ).filter((i) => i.value && i.value.trim().length > 0) as {
    emoji: string;
    label: string;
    value: string;
  }[];

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionTitle>Servicios e instalaciones</SectionTitle>
      <ul className="divide-y divide-[#E5E7EB] rounded-xl bg-[#FAFAF8]">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-3 px-4 py-3">
            <span className="text-lg leading-none" aria-hidden="true">
              {it.emoji}
            </span>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                {it.label}
              </div>
              <div className="mt-0.5 text-sm text-[#18253f]">{it.value}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttendanceSection({ marketId }: { marketId: string }) {
  const [voted, setVoted] = useState(false);
  const [counts, setCounts] = useState<{
    total: number;
    willAttend: number;
    interested: number;
  }>({ total: 0, willAttend: 0, interested: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const already = hasVoted(marketId);
    setVoted(already);
    let cancelled = false;
    void getMarketIntentionCount({ data: { marketId } })
      .then((c) => {
        if (!cancelled) setCounts(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  const handleVote = async (intentionType: "will_attend" | "interested") => {
    if (submitting || voted) return;
    setSubmitting(true);
    const visitorId = getOrCreateVisitorId() || crypto.randomUUID();
    try {
      const res = await recordAttendanceIntention({
        data: { marketId, intentionType, visitorId },
      });
      if (!res.ok) throw new Error(res.error);
      void trackMarketClick({
        data: { marketId, clickType: "click_attendance" },
      }).catch(() => {});
      markVoted(marketId);
      setVoted(true);
      setCounts((c) => ({
        total: c.total + 1,
        willAttend: c.willAttend + (intentionType === "will_attend" ? 1 : 0),
        interested: c.interested + (intentionType === "interested" ? 1 : 0),
      }));
      void getMarketIntentionCount({ data: { marketId } })
        .then(setCounts)
        .catch(() => {});
    } catch {
      toast.error("No se pudo registrar tu respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-5 border-t border-[#E5E7EB] pt-5">
      {!voted ? (
        <div className="space-y-3 text-center animate-in fade-in duration-200">
          <div>
            <h3 className="text-[15px] font-semibold text-[#18253f]">
              ¿Piensas ir a este mercado?
            </h3>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Tu respuesta nos ayuda a conocer el interés de la comunidad
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleVote("will_attend")}
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#54b678] px-6 text-sm font-semibold text-[#18253f] transition-all hover:bg-[#54b678]/85 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              <CalendarCheck className="h-4 w-4" />
              ¡Voy a ir!
            </button>
            <button
              type="button"
              onClick={() => handleVote("interested")}
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-[#54b678] bg-transparent px-6 text-sm font-medium text-[#2f7a4c] transition-colors hover:bg-[#FEF3C7] disabled:opacity-60"
            >
              <Star className="h-4 w-4" />
              Me interesa
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center animate-in fade-in duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#54b678]/15 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-7 w-7 text-[#54b678]" />
          </div>
          <p className="text-[15px] font-semibold text-[#54b678]">
            ¡Gracias por tu respuesta!
          </p>
          <p className="text-[13px] text-[#6B7280]">
            {counts.total === 1
              ? "1 persona planea asistir a este mercado"
              : `${counts.total} personas planean asistir a este mercado`}
          </p>
        </div>
      )}
    </div>
  );
}
