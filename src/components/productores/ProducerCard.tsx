import { useState } from "react";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Producer } from "@/lib/producers.functions";
import { UpdateProducerDialog } from "./UpdateProducerDialog";

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
    producer.email || producer.telefono || producer.website,
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-[#54b678] bg-[#18253f] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <div className="-mx-6 -mt-6 mb-4 flex justify-center bg-black/20 px-6 pb-4 pt-6">
        {producer.logo_url ? (
          <img
            src={producer.logo_url}
            alt={`Logo de ${producer.nombre}`}
            className="h-24 w-24 rounded-full border-2 border-[#54b678] bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#54b678] bg-[#54b678] font-display text-2xl text-white"
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
          <p className="mt-1 text-sm text-[#54b678]">
            Contacto: <span className="text-[#54b678]">{producer.contacto}</span>
          </p>
        ) : null}
        {producer.region || producer.pueblo ? (
          <div className="mt-2 flex items-start gap-1.5 text-sm text-[#54b678]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#54b678]" />
            <span>
              {producer.region ?? ""}
              {producer.region && producer.pueblo ? " · " : ""}
              {producer.pueblo ?? ""}
            </span>
          </div>
        ) : null}
      </header>

      {producer.mercados.length > 0 ? (
        <div className="mt-4 border-t border-[#54b678]/30 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white">
            Mercados
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {producer.mercados.map((nombre) => (
              <Badge
                key={nombre}
                variant="secondary"
                className="border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678] hover:bg-[#54b678]/25"
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
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Instagram className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{displayUrl(producer.website)}</span>
              </a>
            ) : null}
            {producer.email ? (
              <a
                href={`mailto:${producer.email}`}
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Mail className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{producer.email}</span>
              </a>
            ) : null}
            {producer.telefono ? (
              <a
                href={`tel:${producer.telefono.replace(/\s+/g, "")}`}
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Phone className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{producer.telefono}</span>
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-sm italic text-[#54b678]/70">Contacto no disponible</p>
        )}
      </div>

      <div className="mt-5 border-t border-[#54b678]/30 pt-4">
        <Button
          variant="outline"
          className="w-full border-[#54b678] bg-transparent text-[#54b678] transition-colors duration-200 ease-out hover:bg-[#54b678] hover:text-white"
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
