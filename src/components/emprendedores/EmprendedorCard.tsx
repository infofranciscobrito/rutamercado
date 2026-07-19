import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Emprendedor } from "@/lib/emprendedores.functions";
import { initials } from "./utils";

interface Props {
  item: Emprendedor;
  onOpen: () => void;
}

export function EmprendedorCard({ item, onOpen }: Props) {
  const location = [item.region, item.municipio].filter(Boolean).join(" · ");
  const mercados =
    item.mercados_interes.length > 0
      ? item.mercados_interes.join(", ")
      : "Todos";

  const handleKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKey}
      aria-label={`Ver perfil de ${item.nombre_negocio}`}
      className="flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border-2 border-[#54b678]/70 bg-[#18253f] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-[#54b678] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54b678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18253f]"
    >
      <div className="flex min-w-0 items-start gap-3">
        {item.logo_url ? (
          <img
            src={item.logo_url}
            alt={`Logo de ${item.nombre_negocio}`}
            className="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-[#54b678] bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-[#54b678] bg-[#54b678] font-display text-base text-white"
          >
            {initials(item.nombre_negocio)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-white line-clamp-2">
            {item.nombre_negocio}
          </h3>
          {location ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#54b678]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex min-w-0">
        <Badge
          variant="secondary"
          className="max-w-full truncate border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678] hover:bg-[#54b678]/25"
        >
          <span className="truncate">{item.categoria_producto}</span>
        </Badge>
      </div>

      <p className="mt-2 min-h-[2.6rem] text-sm leading-relaxed text-white/85 line-clamp-2">
        {item.descripcion}
      </p>

      <div className="mt-auto flex flex-col items-stretch gap-2 border-t border-[#54b678]/30 pt-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
        <span className="hidden truncate text-xs text-white/60 min-[480px]:block">
          Mercados: {mercados}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex h-9 w-full items-center justify-center rounded-full border border-[#54b678] px-4 text-xs font-semibold text-[#54b678] transition-colors hover:bg-[#54b678]/10 min-[480px]:w-auto"
        >
          Ver perfil
        </button>
      </div>
    </article>
  );
}
