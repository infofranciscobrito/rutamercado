import { Button } from "@/components/ui/button";

function SleepyPin() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 12c-19.33 0-35 15.67-35 35 0 25 35 61 35 61s35-36 35-61c0-19.33-15.67-35-35-35z"
        fill="#54b678"
      />
      <circle cx="60" cy="47" r="18" fill="#FFF8EC" />
      <path
        d="M51 46c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"
        fill="#1c1e37"
      />
      <path
        d="M69 46c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"
        fill="#1c1e37"
      />
      <path
        d="M52 54c2 2 5 3 8 3s6-1 8-3"
        stroke="#1c1e37"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="60" cy="108" r="4" fill="#1c1e37" opacity="0.15" />
    </svg>
  );
}

interface Props {
  hasFilters: boolean;
  onClear: () => void;
  isTodayFilter?: boolean;
  onSwitchToWeek?: () => void;
  filterSummary?: string;
}

export function EmptyState({
  hasFilters,
  onClear,
  isTodayFilter,
  onSwitchToWeek,
  filterSummary,
}: Props) {
  if (isTodayFilter) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center rm-shadow-warm">
        <SleepyPin />
        <h2 className="mt-6 font-display text-2xl text-[#1c1e37]">
          No hay mercados programados para hoy
        </h2>
        <p className="mt-2 max-w-sm text-base text-[#6B7280]">
          ¡Revisa qué hay esta semana!
        </p>
        <Button
          onClick={onSwitchToWeek}
          className="mt-6 h-12 bg-[#54b678] px-6 text-base font-semibold text-[#1c1e37] hover:bg-[#3f9560]"
        >
          Ver esta semana
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center rm-shadow-warm">
      <SleepyPin />
      <h2 className="mt-6 font-display text-2xl text-[#1c1e37]">
        {hasFilters
          ? "No encontramos mercados con esos filtros"
          : "Aún no hay mercados publicados"}
      </h2>
      <p className="mt-2 max-w-md text-base text-[#6B7280]">
        {hasFilters ? (
          filterSummary ? (
            <>
              No hay resultados para <span className="font-medium text-[#1c1e37]">{filterSummary}</span>. Intenta cambiar los filtros o buscar por otro término.
            </>
          ) : (
            "Intenta cambiar los filtros o buscar por otro término."
          )
        ) : (
          "Vuelve pronto para descubrir nuevos mercados locales."
        )}
      </p>
      {hasFilters && (
        <Button
          onClick={onClear}
          variant="outline"
          className="mt-6 h-12 border-[#54b678] px-6 text-base font-semibold text-[#2f7a4c] hover:bg-[#FEF3C7] hover:text-[#2f7a4c]"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
