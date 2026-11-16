/** Supuestos compartidos por el formulario público y sus métricas. */
export const SPEND: Record<string, number> = { menos_15: 10, "15_30": 22, "31_50": 40, "51_80": 65, mas_80: 100 };
export const VISITS: Record<string, number> = { fines_semana: 4, "2_3_mes": 2.5, "1_mes": 1, "2_3_meses": 0.4, casi_nunca: 0.2 };
export const PRECIO_ANUAL = 24;
export const PRECIO_MENSUAL = 2.99;
export const AHORRO_PCT = 0.1;
export const INTENCIONES_POSITIVAS = ["seguro", "probable_si"];
export const SURVEY_PATH = "/rutralover";
export const SURVEY_URL = `https://rutamercadopr.com${SURVEY_PATH}`;

export function estimatedAnnualSavings(gasto: unknown, frecuencia: unknown): number | null {
  const s = typeof gasto === "string" ? SPEND[gasto] : undefined;
  const v = typeof frecuencia === "string" ? VISITS[frecuencia] : undefined;
  return s !== undefined && v !== undefined ? s * v * 12 * AHORRO_PCT : null;
}

export function surveyRedirectTarget(rawUrl: string): string | null {
  const url = new URL(rawUrl);
  const path = url.pathname.replace(/\/+$/, "").toLowerCase();
  return path === "/encuesta" || path === "/rutalover" ? `${SURVEY_PATH}${url.search}` : null;
}