import { Heart } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";

interface Props {
  marketId: string;
}

export function FavoriteButton({ marketId }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const [pulse, setPulse] = useState(false);
  const active = isFavorite(marketId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(marketId);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 300);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54b678] focus-visible:ring-offset-2"
    >
      <Heart
        className={`h-[18px] w-[18px] transition-transform duration-300 ${
          pulse ? "scale-125" : "scale-100"
        }`}
        color="#EF4444"
        fill={active ? "#EF4444" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
