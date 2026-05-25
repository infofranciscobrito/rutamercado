// Motor de cálculo de fechas recurrentes para mercados.
// Pure module — no Supabase, sin React. Trabaja con fechas locales (YYYY-MM-DD).

export type RecurrenceType =
  | "unico"
  | "semanal"
  | "quincenal"
  | "mensual_por_dia";

export const RECURRENCE_TYPES: RecurrenceType[] = [
  "unico",
  "semanal",
  "quincenal",
  "mensual_por_dia",
];

export type WeekdayEs =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export const WEEKDAYS_ES: WeekdayEs[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export type WeekOfMonthEs =
  | "primero"
  | "segundo"
  | "tercero"
  | "cuarto"
  | "ultimo";

export const WEEKS_OF_MONTH_ES: WeekOfMonthEs[] = [
  "primero",
  "segundo",
  "tercero",
  "cuarto",
  "ultimo",
];

const WEEKDAY_INDEX: Record<WeekdayEs, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

const WEEKDAY_LABEL: Record<WeekdayEs, string> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábado",
  domingo: "domingo",
};

const WEEKDAY_PLURAL: Record<WeekdayEs, string> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábados",
  domingo: "domingos",
};

const WEEK_LABEL: Record<WeekOfMonthEs, string> = {
  primero: "primer",
  segundo: "segundo",
  tercero: "tercer",
  cuarto: "cuarto",
  ultimo: "último",
};

export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  week: WeekOfMonthEs,
): Date | null {
  if (week === "ultimo") {
    const last = daysInMonth(year, month);
    const lastDate = new Date(year, month, last);
    const offset = (lastDate.getDay() - weekday + 7) % 7;
    return new Date(year, month, last - offset);
  }
  const nth =
    week === "primero" ? 1 : week === "segundo" ? 2 : week === "tercero" ? 3 : 4;
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  if (day > daysInMonth(year, month)) return null;
  return new Date(year, month, day);
}

export interface RecurrenceConfig {
  recurrence_type: string;
  recurrence_day_of_week: string | null;
  recurrence_week_of_month: string | null;
  recurrence_start_date: string;
  recurrence_end_date: string | null;
  start_time: string;
  end_time: string;
}

export interface RecException {
  exception_date: string;
  reason: string | null;
}

export interface RecOverride {
  original_date: string;
  new_date: string;
  new_start_time: string | null;
  new_end_time: string | null;
  note: string | null;
}

export interface UpcomingDate {
  date: string;
  originalDate: string;
  startTime: string;
  endTime: string;
  isOverridden: boolean;
  overrideNote: string | null;
}

export interface CancelledDate {
  date: string; // fecha original cancelada
  reason: string | null;
}

export interface ScheduleResult {
  upcoming: UpcomingDate[];
  cancelled: CancelledDate[];
  movedFrom: { originalDate: string; newDate: string; note: string | null }[];
}

function rawDatesInWindow(
  cfg: RecurrenceConfig,
  from: Date,
  to: Date,
): string[] {
  const startDate = parseLocalDay(cfg.recurrence_start_date);
  const endDate = cfg.recurrence_end_date
    ? parseLocalDay(cfg.recurrence_end_date)
    : null;
  const out: string[] = [];

  const inRange = (d: Date) =>
    d >= from && d <= to && d >= startDate && (!endDate || d <= endDate);

  if (cfg.recurrence_type === "unico") {
    if (inRange(startDate)) out.push(isoDay(startDate));
    return out;
  }

  const dow = cfg.recurrence_day_of_week as WeekdayEs | null;
  if (!dow || !(dow in WEEKDAY_INDEX)) return out;
  const targetWeekday = WEEKDAY_INDEX[dow];

  if (cfg.recurrence_type === "semanal" || cfg.recurrence_type === "quincenal") {
    // Anchor = primer match en/después de start_date con el weekday correcto
    const anchor = new Date(startDate);
    const offset = (targetWeekday - anchor.getDay() + 7) % 7;
    anchor.setDate(anchor.getDate() + offset);
    const step = cfg.recurrence_type === "semanal" ? 7 : 14;
    const cur = new Date(anchor);
    while (cur <= to) {
      if (inRange(cur)) out.push(isoDay(cur));
      cur.setDate(cur.getDate() + step);
    }
    return out;
  }

  if (cfg.recurrence_type === "mensual_por_dia") {
    const week = cfg.recurrence_week_of_month as WeekOfMonthEs | null;
    if (!week) return out;
    // Iterar mes a mes desde el mes de `from` hasta el mes de `to`
    const startY = from.getFullYear();
    const startM = from.getMonth();
    const endY = to.getFullYear();
    const endM = to.getMonth();
    let y = startY;
    let m = startM;
    while (y < endY || (y === endY && m <= endM)) {
      const d = nthWeekdayOfMonth(y, m, targetWeekday, week);
      if (d && inRange(d)) out.push(isoDay(d));
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return out;
  }
  return out;
}

export function computeSchedule(
  cfg: RecurrenceConfig,
  exceptions: RecException[],
  overrides: RecOverride[],
  opts: { from?: Date; days?: number } = {},
): ScheduleResult {
  const from = opts.from ?? startOfToday();
  const days = opts.days ?? 90;
  const to = new Date(from);
  to.setDate(to.getDate() + days);

  const rawDates = rawDatesInWindow(cfg, from, to);
  const exMap = new Map(exceptions.map((e) => [e.exception_date, e]));
  const ovMap = new Map(overrides.map((o) => [o.original_date, o]));

  const upcoming: UpcomingDate[] = [];
  const cancelled: CancelledDate[] = [];
  const movedFrom: ScheduleResult["movedFrom"] = [];

  for (const d of rawDates) {
    if (exMap.has(d)) {
      cancelled.push({ date: d, reason: exMap.get(d)!.reason });
      continue;
    }
    const ov = ovMap.get(d);
    if (ov) {
      upcoming.push({
        date: ov.new_date,
        originalDate: d,
        startTime: ov.new_start_time ?? cfg.start_time,
        endTime: ov.new_end_time ?? cfg.end_time,
        isOverridden: true,
        overrideNote: ov.note,
      });
      movedFrom.push({
        originalDate: d,
        newDate: ov.new_date,
        note: ov.note,
      });
    } else {
      upcoming.push({
        date: d,
        originalDate: d,
        startTime: cfg.start_time,
        endTime: cfg.end_time,
        isOverridden: false,
        overrideNote: null,
      });
    }
  }

  upcoming.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  cancelled.sort((a, b) => (a.date < b.date ? -1 : 1));
  return { upcoming, cancelled, movedFrom };
}

export function generateRecurrenceLabel(
  type: string,
  dayOfWeek: string | null,
  weekOfMonth: string | null,
): string {
  if (type === "unico") return "";
  const dow = dayOfWeek as WeekdayEs | null;
  if (!dow || !(dow in WEEKDAY_LABEL)) return "";
  if (type === "semanal") return `Todos los ${WEEKDAY_PLURAL[dow]}`;
  if (type === "quincenal") return `Cada dos ${WEEKDAY_PLURAL[dow]}`;
  if (type === "mensual_por_dia") {
    const w = weekOfMonth as WeekOfMonthEs | null;
    if (!w) return "";
    const label = WEEK_LABEL[w];
    return `El ${label} ${WEEKDAY_LABEL[dow]} de cada mes`;
  }
  return "";
}

export const WEEKDAY_HUMAN: Record<WeekdayEs, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const WEEK_OF_MONTH_HUMAN: Record<WeekOfMonthEs, string> = {
  primero: "Primero",
  segundo: "Segundo",
  tercero: "Tercero",
  cuarto: "Cuarto",
  ultimo: "Último",
};

export const RECURRENCE_TYPE_HUMAN: Record<RecurrenceType, string> = {
  unico: "Evento Único",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual_por_dia: "Mensual por día",
};
