import type { MarketFrequency } from "@/types/market";

const DATE_FMT = new Intl.DateTimeFormat("es-PR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function isToday(eventDate: string): boolean {
  return parseLocalDate(eventDate).getTime() === startOfToday().getTime();
}

export function isTomorrow(eventDate: string): boolean {
  const t = startOfToday();
  const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  return parseLocalDate(eventDate).getTime() === tomorrow.getTime();
}

export function formatDateEs(eventDate: string): string {
  return capitalize(DATE_FMT.format(parseLocalDate(eventDate)));
}

function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

function formatTime12(t: string): string {
  const { h, m } = parseTime(t);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

const WEEKDAY_PLURAL: Record<number, string> = {
  0: "domingos",
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábados",
};

export function frequencyLabel(
  frequency: MarketFrequency | string | null,
  eventDate: string,
): string | null {
  if (!frequency || frequency === "Único") return null;
  const weekday = parseLocalDate(eventDate).getDay();
  const dayPlural = WEEKDAY_PLURAL[weekday] ?? "";
  switch (frequency) {
    case "Semanal":
      return `Todos los ${dayPlural}`;
    case "Quincenal":
      return `Cada dos ${dayPlural}`;
    case "Mensual":
      return `Mensual`;
    default:
      return String(frequency);
  }
}

export function googleMapsUrl(address: string, municipality: string): string {
  const q = encodeURIComponent(`${address}, ${municipality}, Puerto Rico`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://instagram.com/${clean}`;
}
