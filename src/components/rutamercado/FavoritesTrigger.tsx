import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

interface Props {
  onOpen: () => void;
  className?: string;
}

export function FavoritesTrigger({ onOpen, className }: Props) {
  const { count } = useFavorites();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Favoritos (${count})`}
      className={`inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-white transition-colors hover:bg-white/10 ${className ?? ""}`}
    >
      <Heart
        className="h-5 w-5"
        color="#EF4444"
        fill={count > 0 ? "#EF4444" : "none"}
        strokeWidth={2}
      />
      {count > 0 && (
        <span className="text-sm font-semibold tabular-nums">{count}</span>
      )}
    </button>
  );
}
