# Directorio de Negocios: tarjeta compacta + modal "Ver perfil"

Alcance: solo el grid de tarjetas en `/negocios`. No se tocan hero, secciones, filtros, formulario de registro, footer ni ninguna otra página.

## Tokens de diseño existentes (reutilizar tal cual)

Extraídos del componente actual `EmprendedorCard.tsx` y del resto del sitio:

- Fondo tarjeta: `#18253f`
- Borde/acento verde: `#54b678` (variantes `/15`, `/25`, `/30`, `/40`, `/70`)
- Texto: `text-white`, `text-white/85`, `text-white/60`
- Tipografía display: clase `font-display` (ya definida)
- Radios: `rounded-2xl` (tarjeta), `rounded-md` (items internos), badge shadcn (pill)
- Sombras: `shadow-[0_2px_12px_rgba(0,0,0,0.3)]` reposo, `shadow-[0_8px_30px_rgba(0,0,0,0.5)]` hover
- Badge categoría: variante `secondary` con clases `border border-[#54b678]/40 bg-[#54b678]/15 text-[#54b678]`
- Iconos contacto: `lucide-react` (Mail, Phone, Instagram, MapPin, User) en `#54b678`
- Modal base: shadcn `Dialog` (mismo ya usado en `MarketDetailDialog` y `RegisterEmprendedorDialog`)

No se introducen colores, fuentes, radios ni sombras nuevos.

## 1. Nueva tarjeta compacta

Archivo: `src/components/emprendedores/EmprendedorCard.tsx` (reescribir contenido, mismo export/prop `item`).

Estructura, de arriba hacia abajo, dentro de `<article>` con `rounded-2xl border-2 border-[#54b678] bg-[#18253f] p-4` y `flex flex-col h-full min-w-0`:

1. Fila superior `flex items-start gap-3 min-w-0`:
   - Avatar 52px circular (`h-13 w-13` = `h-[52px] w-[52px]`), mismo borde verde, `shrink-0`. Si hay `logo_url` → `<img>`; si no → iniciales (helper `initials` actual).
   - Bloque de texto `min-w-0 flex-1`:
     - Nombre: `font-display text-lg leading-tight text-white line-clamp-2`.
     - Ubicación (si `region` o `municipio`): `mt-1 flex items-center gap-1.5 text-xs text-[#54b678]` con `MapPin h-3.5 w-3.5` + `<span className="truncate">Region · Municipio</span>`.
2. Badge de categoría: `mt-3`, mismo estilo actual (secondary + clases verdes), `max-w-full truncate`.
3. Descripción: `mt-2 text-sm leading-relaxed text-white/85 line-clamp-2 min-h-[2.6rem]` (reserva altura de 2 líneas).
4. Pie: `mt-auto pt-3 border-t border-[#54b678]/30 flex items-center justify-between gap-2`
   - Izquierda: `text-xs text-white/60 truncate hidden min-[480px]:block` con `Mercados: {mercados_interes.join(", ") || "Todos"}`.
   - Derecha: botón "Ver perfil" pill outline: `inline-flex h-9 items-center justify-center rounded-full border border-[#54b678] px-4 text-xs font-semibold text-[#54b678] hover:bg-[#54b678]/10 transition-colors`.
   - En `<480px`: la etiqueta izquierda se oculta y el botón toma `w-full` via `max-[479px]:w-full` (contenedor pasa a `flex-col` con `max-[479px]:flex-col max-[479px]:items-stretch`).

Interacción:
- `<article>` recibe `role="button"`, `tabIndex={0}`, `cursor-pointer`, `onClick` y `onKeyDown` (Enter/Space) → abre modal.
- Hover: `transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-[#54b678] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]` (solo transform, border-color, box-shadow).
- El botón "Ver perfil" también dispara el modal; `stopPropagation` no es necesario (mismo destino), pero se marca `type="button"`.

Altura uniforme por fila: `h-full` + `flex flex-col` + `mt-auto` en pie (el grid padre ya alinea con `grid`).

## 2. Grid responsive

Archivo: `src/routes/negocios.tsx` — cambiar clases del grid interno de cada bucket regional.

De: `grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`
A: `grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-[18px] lg:grid-cols-4` con `[&>*]:min-w-0`.

Sin más cambios en `negocios.tsx` (hero, filtros, agrupación por región, contadores, empty state se mantienen idénticos).

## 3. Modal "Ver perfil"

Archivo nuevo: `src/components/emprendedores/EmprendedorProfileDialog.tsx`.

- Basado en shadcn `Dialog` (ya usado en el proyecto). Props: `item: Emprendedor | null`, `open`, `onOpenChange`.
- `DialogContent` con clases: `bg-[#18253f] border border-[#54b678]/40 text-white rounded-2xl sm:max-w-[480px] p-6`.
- Comportamiento mobile bottom-sheet: en `max-[639px]` override con `max-[639px]:rounded-t-2xl max-[639px]:rounded-b-none max-[639px]:fixed max-[639px]:bottom-0 max-[639px]:left-0 max-[639px]:right-0 max-[639px]:top-auto max-[639px]:translate-x-0 max-[639px]:translate-y-0 max-[639px]:max-h-[88vh] max-[639px]:w-full max-[639px]:data-[state=open]:slide-in-from-bottom` y contenido con `overflow-y-auto max-h-[calc(88vh-2rem)]`. Desktop centrado por defecto de shadcn.
- Animación entrada: usar las animaciones por defecto de shadcn (fade + zoom + slide) que ya cumplen 200–240ms ease-out; respetan `prefers-reduced-motion` vía Tailwind.
- Cierre: botón ✕ (shadcn ya lo incluye en esquina), clic overlay, Escape (shadcn nativo). Bloqueo de scroll del body: nativo de Radix Dialog. Foco atrapado y devuelto: nativo de Radix.
- Accesibilidad: `DialogTitle` = nombre del negocio (id gestionado por Radix → aria-labelledby automático). `role="dialog"` y `aria-modal` nativos.

Contenido:
1. Encabezado `flex items-start gap-4`:
   - Avatar 64px (`h-16 w-16`) con mismo estilo (borde verde, bg blanco o iniciales).
   - Bloque: `DialogTitle` con `font-display text-2xl text-white` = nombre; debajo `flex flex-wrap items-center gap-2 mt-1`: badge de categoría + `<span className="inline-flex items-center gap-1 text-sm text-[#54b678]"><MapPin h-4 w-4/> Region · Municipio</span>`.
2. Descripción completa: `mt-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap`.
3. Mercados de interés (si hay): `mt-5`
   - `p-xs uppercase tracking-wider text-white font-semibold`: "MERCADOS DE INTERÉS"
   - `mt-2 flex flex-wrap gap-1.5` con los mismos badges verdes.
4. Separador: `mt-5 border-t border-[#54b678]/30 pt-4 space-y-1`.
5. Lista de contacto (cada fila `min-h-11 flex items-center gap-2 rounded-md px-2 py-2`):
   - `persona_contacto`: `User` icon + texto plano `text-white/85`.
   - `instagram` (si hay): enlace `https://instagram.com/{handle limpio}` `target="_blank" rel="noopener noreferrer"`, muestra `@{handle}`; hover `bg-[#54b678]/10`.
   - `email`: `mailto:`; hover igual.
   - `telefono`: `tel:` (sin espacios); mostrar formateado `(xxx) xxx-xxxx` cuando sean 10 dígitos, si no dejar el original. Helper local `formatPhone(raw)`.
   - Sin contacto → `Contacto no disponible` (mismo texto italic actual).

Todos los helpers `safeUrl`, `displayHandle`, `initials` se mueven/duplican en el nuevo archivo (o se extraen a un utilitario compartido `src/components/emprendedores/utils.ts`). Preferencia: extraer a `utils.ts` para no duplicar.

## 4. Cableado en `negocios.tsx`

- Estado nuevo: `const [selected, setSelected] = useState<Emprendedor | null>(null);`
- `<EmprendedorCard item={e} onOpen={() => setSelected(e)} />` (nueva prop opcional; si se omite, no hace nada — solo el grid del directorio la pasa).
- Al final del componente, junto al `RegisterEmprendedorDialog`: `<EmprendedorProfileDialog item={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />`.

## 5. Qué NO se toca

- Hero, sección "¿Por qué registrarte?", filtros (búsqueda, categoría, región), agrupación por región, contadores, empty state, `RegisterEmprendedorDialog`, header, footer.
- Ningún otro archivo que use `EmprendedorCard` (revisar; hoy solo `negocios.tsx` lo importa — si aparece otro uso, la prop `onOpen` es opcional para no romperlos).
- Ningún token global, `styles.css`, ni configuración de fuentes.

## Detalles técnicos

- Sin librerías nuevas. shadcn `Dialog` + Tailwind + `lucide-react` ya presentes.
- `line-clamp-2` requiere plugin: Tailwind v4 lo trae de fábrica (verificado por uso previo en `MarketCard`). No se toca `styles.css`.
- Verificación tras build: `/negocios` en móvil 2 col, tablet 3 col, desktop 4 col; tarjeta ~200px; clic en tarjeta o botón abre modal; Escape/overlay/✕ cierran; scroll del body bloqueado mientras abierto; `prefers-reduced-motion` respetado.

## Archivos afectados

- Modificar: `src/components/emprendedores/EmprendedorCard.tsx`
- Modificar: `src/routes/negocios.tsx` (grid classes + estado modal + render del dialog)
- Crear: `src/components/emprendedores/EmprendedorProfileDialog.tsx`
- Crear (opcional, recomendado): `src/components/emprendedores/utils.ts` con `safeUrl`, `displayHandle`, `initials`, `formatPhone`.
