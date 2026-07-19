import { Mail, Phone, Instagram, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Emprendedor } from "@/lib/emprendedores.functions";
import { initials, safeUrl, displayHandle, formatPhone } from "./utils";

interface Props {
  item: Emprendedor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmprendedorProfileDialog({ item, open, onOpenChange }: Props) {
  if (!item) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="hidden" />
      </Dialog>
    );
  }

  const location = [item.region, item.municipio].filter(Boolean).join(" · ");
  const hasContact = Boolean(item.instagram || item.email || item.telefono);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[88vh] overflow-y-auto rounded-2xl border border-[#54b678]/40 bg-[#18253f] p-6 text-white sm:max-w-[480px] max-[639px]:top-auto max-[639px]:bottom-0 max-[639px]:left-0 max-[639px]:right-0 max-[639px]:w-full max-[639px]:max-w-full max-[639px]:translate-x-0 max-[639px]:translate-y-0 max-[639px]:rounded-b-none max-[639px]:rounded-t-2xl max-[639px]:data-[state=open]:slide-in-from-bottom-4 max-[639px]:data-[state=closed]:slide-out-to-bottom-4"
      >
        <div className="flex items-start gap-4">
          {item.logo_url ? (
            <img
              src={item.logo_url}
              alt={`Logo de ${item.nombre_negocio}`}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-[#54b678] bg-white object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#54b678] bg-[#54b678] font-display text-xl text-white"
            >
              {initials(item.nombre_negocio)}
            </div>
          )}
          <div className="min-w-0 flex-1 pr-6">
            <DialogTitle className="font-display text-2xl leading-tight text-white">
              {item.nombre_negocio}
            </DialogTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678] hover:bg-[#54b678]/25"
              >
                {item.categoria_producto}
              </Badge>
              {location ? (
                <span className="inline-flex items-center gap-1 text-sm text-[#54b678]">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
          {item.descripcion}
        </p>

        {item.mercados_interes.length > 0 ? (
          <div className="mt-5">
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

        <div className="mt-5 space-y-1 border-t border-[#54b678]/30 pt-4">
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
                  <span className="truncate">{formatPhone(item.telefono)}</span>
                </a>
              ) : null}
            </>
          ) : (
            <p className="px-2 py-2 text-sm italic text-[#54b678]/70">
              Contacto no disponible
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
