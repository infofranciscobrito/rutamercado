import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground/40" strokeWidth={1.5} />
      <h2 className="mt-4 font-display text-2xl text-[#1c1e37]">
        {hasFilters
          ? "No encontramos mercados"
          : "Aún no hay mercados publicados"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Prueba ajustando los filtros para ver más resultados."
          : "Vuelve pronto para descubrir nuevos mercados locales."}
      </p>
      {hasFilters && (
        <Button
          onClick={onClear}
          className="mt-6 bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
