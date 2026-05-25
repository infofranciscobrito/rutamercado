import { parseLocalDay } from "@/lib/recurrence";

const DATE_FMT = new Intl.DateTimeFormat("es-PR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_FMT_SHORT = new Intl.DateTimeFormat("es-PR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function isToday(eventDate: string): boolean {
  return parseLocalDay(eventDate).getTime() === startOfToday().getTime();
}

export function isTomorrow(eventDate: string): boolean {
  const t = startOfToday();
  const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  return parseLocalDay(eventDate).getTime() === tomorrow.getTime();
}

export function formatDateEs(eventDate: string): string {
  return capitalize(DATE_FMT.format(parseLocalDay(eventDate)));
}

export function formatDateShortEs(eventDate: string): string {
  return capitalize(DATE_FMT_SHORT.format(parseLocalDay(eventDate)));
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

export function googleMapsUrl(address: string, municipality: string): string {
  const q = encodeURIComponent(`${address}, ${municipality}, Puerto Rico`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://instagram.com/${clean}`;
}
