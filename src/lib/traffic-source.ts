export type TrafficKind = "externo" | "interno" | "desarrollo";

function hostOf(value: string): string {
  const raw = value.trim();
  if (raw === "") return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname.toLowerCase();
  } catch {
    host = raw.toLowerCase().split("/")[0]!.split("?")[0]!;
  }
  return host.replace(/^www\./, "").replace(/:\d+$/, "");
}

const DEV_DOMAINS = [
  "lovable.dev",
  "lovable.app",
  "lovableproject.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
];

function isDevHost(bare: string): boolean {
  return DEV_DOMAINS.some((d) => bare === d || bare.endsWith(`.${d}`));
}

/**
 * Clasifica una visita según su referrer:
 * - interno: navegación dentro del propio dominio
 * - desarrollo: previews de Lovable y entornos locales
 * - externo: buscadores, redes, directo, etc.
 */
export function classifyReferrer(referrer: string | null): TrafficKind {
  const bare = hostOf(referrer ?? "");
  if (bare === "") return "externo";
  if (bare === "rutamercadopr.com") return "interno";
  if (isDevHost(bare)) return "desarrollo";
  return "externo";
}

/**
 * Clasifica el origen de un evento de clic. La página donde ocurre el clic
 * decide si es tráfico de desarrollo (preview / localhost); en el sitio real
 * la clasificación depende del referrer, igual que en las visitas de página.
 */
export function classifyClickSource(
  referrer: string | null,
  pageUrl: string | null,
): TrafficKind {
  const pageHost = hostOf(pageUrl ?? "");
  if (pageHost !== "" && isDevHost(pageHost)) return "desarrollo";
  return classifyReferrer(referrer);
}
