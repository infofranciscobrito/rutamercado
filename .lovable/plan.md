## Objetivo
Añadir un filtro por **Municipio** en la barra pública, con chips horizontales en la barra principal + dropdown secundario con todos los municipios. Mantener Región/Categoría/Fecha tal como están.

## Chips
Municipios visibles como chips (mismo estilo visual que los pills de fecha, redondeados, `min-h-11`):
`Todos · San Juan · Aguadilla · Caguas · Canóvanas · Hatillo`

- Activo: `bg-[#54b678] text-[#18253f] font-semibold`
- Inactivo: `border border-[#E5E7EB] bg-white text-[#6B7280]`
- Mobile: contenedor `overflow-x-auto` con `flex-nowrap`, scroll horizontal suave, sin scrollbar visible
- Desktop: fila normal debajo de los pills de fecha

## Dropdown secundario
Un `Select` con opción "Todos los Municipios" + lista completa de municipios derivada de los mercados existentes (ordenada alfabéticamente). Se coloca en la fila derecha de dropdowns (desktop) junto a Región/Categoría, y en el `Sheet` de filtros (mobile) debajo de Región.

Si el usuario elige un municipio desde el dropdown que también existe como chip, ese chip se refleja como activo (estado compartido).

## Cambios técnicos

**`src/lib/market-filters.ts`**
- Añadir `municipality: string` (default `"all"`) a `MarketFilters` y `defaultFilters`.
- En `applyFilters`: `if (filters.municipality !== "all" && m.municipality !== filters.municipality) return false;`
- Incluir en `hasActiveFilters`.

**`src/routes/index.tsx`**
- Añadir `municipality` a `validateSearch` (fallback `"all"`).
- Pasarlo al estado de filtros y al reset (`clear`, chip individual).
- Incluir en `describeFilters` (línea ~49): `if (f.municipality !== "all") parts.push(\`municipio: ${f.municipality}\`);`
- El filtrado del mapa ya usa el mismo `filteredMarkets`, así que se aplica automáticamente.

**`src/components/rutamercado/FilterBar.tsx`**
- Nuevo componente `MunicipalityChips` (chips + scroll horizontal mobile).
- Nuevo `MunicipalitySelect` alimentado por `props.municipalities: string[]` (lista completa).
- Añadir prop `municipalities` a `Props`.
- Renderizar chips en una segunda fila debajo de los `DatePills` (dentro del mismo contenedor sticky).
- Añadir `MunicipalitySelect` en la fila de dropdowns (desktop) y en el `Sheet` (mobile).

**`src/routes/index.tsx`** (donde se renderiza `FilterBar`)
- Calcular `municipalities` únicos ordenados desde `markets` (memo) y pasar como prop.

**`src/components/rutamercado/ActiveFilterChips.tsx`**
- Mostrar chip removible cuando `filters.municipality !== "all"`.

## Fuera de alcance
- No se toca el estilo del badge, MarketCard, mapa, tipografía ni el schema de la BD.
- No se persiste orden manual de municipios: los 5 mostrados como chips son fijos según spec (`San Juan, Aguadilla, Caguas, Canóvanas, Hatillo`), no calculados dinámicamente por conteo.

## Diagrama
```text
[Hoy][Semana][Mes][Todos]
[Todos][San Juan][Aguadilla][Caguas][Canóvanas][Hatillo]  ← scroll-x en mobile
                                    [Región ▾][Municipio ▾][Categoría ▾][Limpiar]
```
