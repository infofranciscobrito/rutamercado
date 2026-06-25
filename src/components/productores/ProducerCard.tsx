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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProducerCard({ producer }: { producer: Producer }) {
  const [open, setOpen] = useState(false);
  const hasContact = Boolean(
    producer.email || producer.telefono || producer.instagram || producer.website,
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#54b678] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="-mx-6 -mt-6 mb-4 flex justify-center bg-black/15 px-6 pb-4 pt-6">
        {producer.logo_url ? (
          <img
            src={producer.logo_url}
            alt={`Logo de ${producer.nombre}`}
            className="h-24 w-24 rounded-full border-2 border-white bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white bg-white font-display text-2xl text-[#54b678]"
          >
            {initials(producer.nombre)}
          </div>
        )}
      </div>

      <header>
        <h3 className="font-display text-2xl leading-tight text-white">
          {producer.nombre}
        </h3>
        {producer.contacto ? (
          <p className="mt-1 text-sm text-white/85">
            Contacto: <span className="text-white">{producer.contacto}</span>
          </p>
        ) : null}
        {producer.region ? (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white" />
            <span>{producer.region}</span>
          </div>
        ) : null}
      </header>

      {producer.mercados.length > 0 ? (
        <div className="mt-4 border-t border-white/20 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/85">
            Mercados
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {producer.mercados.map((nombre) => (
              <Badge
                key={nombre}
                variant="secondary"
                className="bg-white/15 text-white hover:bg-white/25"
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
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10 [&_span]:hover:underline"
              >
                <Globe className="h-4 w-4 text-white" />
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
                      className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10 [&_span]:hover:underline"
                    >
                      <Instagram className="h-4 w-4 text-white" />
                      <span className="truncate">{ig.handle}</span>
                    </a>
                  );
                })()
              : null}
            {producer.email ? (
              <a
                href={`mailto:${producer.email}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10 [&_span]:hover:underline"
              >
                <Mail className="h-4 w-4 text-white" />
                <span className="truncate">{producer.email}</span>
              </a>
            ) : null}
            {producer.telefono ? (
              <a
                href={`tel:${producer.telefono.replace(/\s+/g, "")}`}
                className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10 [&_span]:hover:underline"
              >
                <Phone className="h-4 w-4 text-white" />
                <span className="truncate">{producer.telefono}</span>
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-sm italic text-white/70">Contacto no disponible</p>
        )}
      </div>

      <div className="mt-5 border-t border-white/20 pt-4">
        <Button
          variant="outline"
          className="w-full border-white bg-transparent text-white transition-colors duration-200 ease-out hover:bg-white hover:text-[#54b678]"
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
