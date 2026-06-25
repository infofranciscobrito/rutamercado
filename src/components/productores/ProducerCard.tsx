import { useState } from "react";
import { Mail, Phone, Instagram, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Producer } from "@/lib/producers.functions";
import { UpdateProducerDialog } from "./UpdateProducerDialog";

function instagramHandle(raw: string): { handle: string; href: string } {
  const trimmed = raw.trim().replace(/^@/, "");
  const handle = trimmed.startsWith("http")
    ? trimmed.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "")
    : trimmed;
  return {
    handle: `@${handle}`,
    href: `https://instagram.com/${handle.replace(/^@/, "")}`,
  };
}

function safeUrl(raw: string): string {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function displayUrl(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function ProducerCard({ producer }: { producer: Producer }) {
  const [open, setOpen] = useState(false);
  const hasContact = Boolean(
    producer.organizer_email ||
      producer.organizer_phone ||
      producer.organizer_instagram ||
      producer.organizer_contact_url,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#18253f]/10 bg-white p-6 shadow-[0_2px_12px_rgba(24,37,63,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#54b678]/40 hover:shadow-[0_8px_28px_rgba(24,37,63,0.12)]">
      <header>
        <h3 className="font-display text-2xl leading-tight text-[#18253f]">
          {producer.organizer_name}
        </h3>
        <div className="mt-3 space-y-1.5">
          {producer.markets.slice(0, 4).map((m) => (
            <div key={m.id} className="flex items-start gap-2 text-sm text-[#18253f]/75">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#54b678]" />
              <span>
                <span className="font-medium text-[#18253f]">{m.name}</span>
                {m.municipality ? (
                  <span className="text-[#18253f]/60"> · {m.municipality}</span>
                ) : null}
                {m.region ? (
                  <span className="text-[#18253f]/50"> · {m.region}</span>
                ) : null}
              </span>
            </div>
          ))}
          {producer.markets.length > 4 ? (
            <div className="pl-5 text-xs text-[#18253f]/50">
              +{producer.markets.length - 4} mercado(s) más
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-5 flex-1 space-y-2">
        {hasContact ? (
          <>
            {producer.organizer_contact_url ? (
              <a
                href={safeUrl(producer.organizer_contact_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Globe className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{displayUrl(producer.organizer_contact_url)}</span>
              </a>
            ) : null}
            {producer.organizer_instagram ? (
              (() => {
                const ig = instagramHandle(producer.organizer_instagram!);
                return (
                  <a
                    href={ig.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
                  >
                    <Instagram className="h-4 w-4 text-[#54b678]" />
                    <span className="truncate">{ig.handle}</span>
                  </a>
                );
              })()
            ) : null}
            {producer.organizer_email ? (
              <a
                href={`mailto:${producer.organizer_email}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Mail className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{producer.organizer_email}</span>
              </a>
            ) : null}
            {producer.organizer_phone ? (
              <a
                href={`tel:${producer.organizer_phone.replace(/\s+/g, "")}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Phone className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{producer.organizer_phone}</span>
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-sm italic text-[#18253f]/50">Contacto no disponible</p>
        )}
      </div>

      <div className="mt-5 border-t border-[#18253f]/5 pt-4">
        <Button
          variant="outline"
          className="w-full border-[#18253f]/20 text-[#18253f] hover:border-[#54b678] hover:bg-[#54b678]/5 hover:text-[#18253f]"
          onClick={() => setOpen(true)}
        >
          Actualizar información
        </Button>
      </div>

      <UpdateProducerDialog
        open={open}
        onOpenChange={setOpen}
        producerName={producer.organizer_name}
        marketNames={producer.markets.map((m) => m.name).join(", ")}
      />
    </article>
  );
}
