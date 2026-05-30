import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { toIsoDay } from "@/lib/market-filters";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  // start on Monday
  const diff = (day + 6) % 7;
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  return out;
}

interface Props {
  /** Selected day "YYYY-MM-DD" or undefined */
  selectedDay: string | undefined;
  /** Set of days "YYYY-MM-DD" that have markets */
  availableDays: Set<string>;
  onSelectDay: (day: string | undefined) => void;
}

export function WeekStrip({ selectedDay, availableDays, onSelectDay }: Props) {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i++) {
      out.push(
        new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i),
      );
    }
    return out;
  }, [weekStart]);

  const shiftWeek = (delta: number) => {
    setWeekStart(
      (w) =>
        new Date(w.getFullYear(), w.getMonth(), w.getDate() + delta * 7),
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Semana anterior"
        onClick={() => shiftWeek(-1)}
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#18253f] hover:bg-[#FEF3C7] sm:inline-flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="-mx-4 flex flex-1 gap-2 overflow-x-auto px-4 rm-no-scrollbar sm:mx-0 sm:px-0">
        {days.map((d) => {
          const iso = toIsoDay(d);
          const isSelected = selectedDay === iso;
          const isToday = d.getTime() === today.getTime();
          const hasMarkets = availableDays.has(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(isSelected ? undefined : iso)}
              aria-label={`${DAY_LABELS[d.getDay()]} ${d.getDate()}`}
              aria-pressed={isSelected}
              className={`relative flex h-14 w-14 shrink-0 snap-start flex-col items-center justify-center rounded-2xl border text-center transition-all duration-150 ${
                isSelected
                  ? "border-[#54b678] bg-[#54b678] text-[#18253f] scale-[1.04] shadow-[0_4px_14px_rgba(84,182,120,0.35)]"
                  : hasMarkets
                    ? "border-[#E5E7EB] bg-white text-[#18253f] hover:border-[#54b678]"
                    : "border-transparent bg-transparent text-[#6B7280]/50"
              } ${isToday && !isSelected ? "ring-2 ring-[#54b678]/30" : ""}`}
            >
              <span className="text-base font-bold leading-none">{d.getDate()}</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wide">
                {DAY_LABELS[d.getDay()]}
              </span>
              {hasMarkets && !isSelected && (
                <span
                  className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#54b678]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Semana siguiente"
        onClick={() => shiftWeek(1)}
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#18253f] hover:bg-[#FEF3C7] sm:inline-flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
