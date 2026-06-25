import { useState } from "react";
import { Mail, Phone, Instagram, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    producer.email || producer.telefono || producer.instagram || producer.website,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#18253f]/10 bg-white p-6 shadow-[0_2px_12px_rgba(24,37,63,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#54b678]/40 hover:shadow-[0_8px_28px_rgba(24,37,63,0.12)]">
      {producer.logo_url ? (
        <div className="mb-4 flex justify-center">
          <img
            src={producer.logo_url}
            alt={`Logo de ${producer.nombre}`}
            className="h-24 w-24 rounded-2xl border border-[#18253f]/10 object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <header>
        <h3 className="font-display text-2xl leading-tight text-[#18253f]">
          {producer.nombre}
        </h3>
        {producer.region ? (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-[#18253f]/70">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#54b678]" />
            <span>{producer.region}</span>
          </div>
        ) : null}
      </header>

      {producer.mercados.length > 0 ? (
        <div className="mt-4 border-t border-[#18253f]/5 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#18253f]/50">
            Mercados que organiza:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {producer.mercados.map((nombre) => (
              <Badge
                key={nombre}
                variant="secondary"
                className="bg-[#54b678]/10 text-[#18253f] hover:bg-[#54b678]/15"
              >
                {nombre}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex-1 space-y-2">
        {hasContact ? (
          <>
            {producer.website ? (
              <a
                href={safeUrl(producer.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Globe className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{displayUrl(producer.website)}</span>
              </a>
            ) : null}
            {producer.instagram
              ? (() => {
                  const ig = instagramHandle(producer.instagram!);
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
              : null}
            {producer.email ? (
              <a
                href={`mailto:${producer.email}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Mail className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{producer.email}</span>
              </a>
            ) : null}
            {producer.telefono ? (
              <a
                href={`tel:${producer.telefono.replace(/\s+/g, "")}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#18253f] hover:bg-[#54b678]/10"
              >
                <Phone className="h-4 w-4 text-[#54b678]" />
                <span className="truncate">{producer.telefono}</span>
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
        producerName={producer.nombre}
        marketNames={producer.mercados.join(", ")}
      />
    </article>
  );
}
