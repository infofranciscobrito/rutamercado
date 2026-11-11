import type { MarketRegion } from "@/types/market";

export const MUNICIPIOS_POR_REGION: Record<MarketRegion, readonly string[]> = {
  Metro: ["San Juan", "Guaynabo", "Bayamón", "Carolina", "Cataño", "Trujillo Alto", "Toa Baja", "Toa Alta"],
  Norte: ["Dorado", "Vega Alta", "Vega Baja", "Manatí", "Barceloneta", "Arecibo", "Hatillo", "Camuy", "Quebradillas", "Florida", "Ciales", "Morovis", "Corozal", "Naranjito"],
  Oeste: ["Isabela", "Aguadilla", "Aguada", "Moca", "San Sebastián", "Rincón", "Añasco", "Mayagüez", "Hormigueros", "Cabo Rojo", "San Germán", "Lajas", "Las Marías", "Maricao", "Sabana Grande"],
  Sur: ["Guánica", "Yauco", "Guayanilla", "Peñuelas", "Ponce", "Juana Díaz", "Santa Isabel", "Coamo", "Salinas", "Guayama", "Arroyo", "Patillas"],
  Este: ["Loíza", "Canóvanas", "Río Grande", "Luquillo", "Fajardo", "Ceiba", "Naguabo", "Humacao", "Yabucoa", "Maunabo", "Las Piedras", "Juncos", "Gurabo", "San Lorenzo", "Vieques", "Culebra"],
  Centro: ["Caguas", "Aguas Buenas", "Cidra", "Cayey", "Aibonito", "Barranquitas", "Comerío", "Orocovis", "Utuado", "Jayuya", "Adjuntas", "Lares", "Villalba"],
};

export const MUNICIPIOS: readonly string[] = Object.values(MUNICIPIOS_POR_REGION)
  .flat()
  .sort((a, b) => a.localeCompare(b, "es"));

export function regionDeMunicipio(municipio: string | null | undefined): MarketRegion | null {
  if (!municipio) return null;
  for (const [region, list] of Object.entries(MUNICIPIOS_POR_REGION)) {
    if (list.includes(municipio)) return region as MarketRegion;
  }
  return null;
}
