/** Generación de archivos .ics (calendario) en el cliente. */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** "2026-08-14" + "09:00:00" -> "20260814T090000" (hora local flotante) */
function toIcsLocal(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh = 0, mm = 0, ss = 0] = time.split(":").map(Number);
  return `${y}${pad(m ?? 1)}${pad(d ?? 1)}T${pad(hh)}${pad(mm)}${pad(ss)}`;
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  url?: string;
}

export function buildIcs(ev: IcsEvent): string {
  const now = new Date();
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RutaMercado//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${ev.uid}@rutamercadopr.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsLocal(ev.date, ev.startTime)}`,
    `DTEND:${toIcsLocal(ev.date, ev.endTime)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    ev.description ? `DESCRIPTION:${escapeText(ev.description)}` : null,
    ev.location ? `LOCATION:${escapeText(ev.location)}` : null,
    ev.url ? `URL:${ev.url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.join("\r\n");
}

export function downloadIcs(filename: string, ev: IcsEvent): void {
  const blob = new Blob([buildIcs(ev)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
