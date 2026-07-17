import { Mail, Phone, Instagram, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Emprendedor } from "@/lib/emprendedores.functions";

function safeUrl(raw: string): string {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("@")) return `https://instagram.com/${t.slice(1)}`;
  return `https://${t}`;
}

function displayHandle(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function EmprendedorCard({ item }: { item: Emprendedor }) {
  const hasContact = Boolean(item.instagram || item.email || item.telefono);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-[#54b678] bg-[#18253f] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <div className="-mx-6 -mt-6 mb-4 flex justify-center bg-black/20 px-6 pb-4 pt-6">
        {item.logo_url ? (
          <img
            src={item.logo_url}
            alt={`Logo de ${item.nombre_negocio}`}
            className="h-24 w-24 rounded-full border-2 border-[#54b678] bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#54b678] bg-[#54b678] font-display text-2xl text-white"
          >
            {initials(item.nombre_negocio)}
          </div>
        )}
      </div>

      <header>
        <h3 className="font-display text-2xl leading-tight text-white">
          {item.nombre_negocio}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678] hover:bg-[#54b678]/25"
          >
            {item.categoria_producto}
          </Badge>
        </div>
        {item.region || item.municipio ? (
          <div className="mt-2 flex items-start gap-1.5 text-sm text-[#54b678]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#54b678]" />
            <span>
              {item.region ?? ""}
              {item.region && item.municipio ? " · " : ""}
              {item.municipio ?? ""}
            </span>
          </div>
        ) : null}
      </header>

      <p className="mt-3 text-sm leading-relaxed text-white/85">
        {item.descripcion}
      </p>

      {item.mercados_interes.length > 0 ? (
        <div className="mt-4 border-t border-[#54b678]/30 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white">
            Mercados de interés
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.mercados_interes.map((m) => (
              <Badge
                key={m}
                variant="secondary"
                className="border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678] hover:bg-[#54b678]/25"
              >
                {m}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex-1 space-y-2">
        {item.persona_contacto ? (
          <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-white/85">
            <User className="h-4 w-4 text-[#54b678]" />
            <span className="truncate">{item.persona_contacto}</span>
          </div>
        ) : null}
        {hasContact ? (
          <>
            {item.instagram ? (
              <a
                href={safeUrl(item.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Instagram className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{displayHandle(item.instagram)}</span>
              </a>
            ) : null}
            {item.email ? (
              <a
                href={`mailto:${item.email}`}
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Mail className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{item.email}</span>
              </a>
            ) : null}
            {item.telefono ? (
              <a
                href={`tel:${item.telefono.replace(/\s+/g, "")}`}
                className="group flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm text-[#54b678] hover:bg-[#54b678]/10 hover:text-white [&_span]:hover:underline"
              >
                <Phone className="h-4 w-4 text-[#54b678] group-hover:text-white" />
                <span className="truncate">{item.telefono}</span>
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-sm italic text-[#54b678]/70">Contacto no disponible</p>
        )}
      </div>
    </article>
  );
}
