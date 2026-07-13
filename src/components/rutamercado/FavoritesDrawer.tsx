import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { marketsQueryOptions } from "@/lib/markets-query";
import { useFavorites } from "@/hooks/use-favorites";
import { MarketImage } from "./MarketImage";
import { formatDateEs } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesDrawer({ open, onOpenChange }: Props) {
  const { favorites, remove, count } = useFavorites();
  const { data: markets } = useQuery(marketsQueryOptions);
  const navigate = useNavigate();

  const items = favorites
    .map((id) => markets?.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const openMarket = (id: string) => {
    onOpenChange(false);
    void navigate({
      to: "/",
      search: (prev: Record<string, unknown>) => ({ ...prev, market: id }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full bg-white p-0 sm:w-[400px] sm:max-w-[400px]"
        aria-label="Favoritos"
      >
        <SheetHeader className="border-b border-[#F0EFEA] px-5 py-4">
          <SheetTitle className="font-display text-xl text-[#18253f]">
            Tus mercados guardados
            {count > 0 && (
              <span className="ml-2 text-sm font-normal text-[#6B7280]">
                ({count})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-[calc(100dvh-73px)] flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl" aria-hidden="true">❤️</span>
            <p className="text-sm text-[#6B7280]">
              Aún no has guardado ningún mercado. Explora y guarda tus favoritos ❤️
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#54b678] px-5 text-sm font-semibold text-[#18253f] transition-colors hover:brightness-95"
            >
              Explorar mercados
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0EFEA] overflow-y-auto">
            {items.map((m) => (
              <li key={m.id}>
                <div className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#FAFAF8]">
                  <button
                    type="button"
                    onClick={() => openMarket(m.id)}
                    className="flex flex-1 items-center gap-3 text-left focus:outline-none"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FFF8EC]">
                      <MarketImage
                        src={m.image_url}
                        alt={m.name}
                        objectPosition={`${m.focal_x ?? 50}% ${m.focal_y ?? 50}%`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#18253f]">
                        {m.name}
                      </p>
                      <p className="truncate text-xs text-[#6B7280]">
                        {m.nextDate ? formatDateEs(m.nextDate) : "Fecha pendiente"}
                      </p>
                      <p className="truncate text-xs text-[#6B7280]">
                        {m.municipality}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    aria-label={`Quitar ${m.name} de favoritos`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F0EFEA] hover:text-[#EF4444]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
