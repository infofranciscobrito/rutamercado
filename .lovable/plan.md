# Plan — Nuevos bloques en `/emprendedores`

Objetivo: añadir 4 bloques narrativos a la página `/emprendedores` (Registra tu negocio) reutilizando exactamente los tokens de diseño ya presentes en la página (fondo `#18253f`, verde `#54b678`, tarjetas `rounded-2xl border border-[#54b678]/30 bg-white/5 p-6`, tipografía `font-display` para títulos, botón CTA `bg-[#54b678] hover:bg-[#439660] h-12 rounded-md`). No se toca la paleta, tipografía, radios ni sombras existentes.

## Cambios de contenido en el Hero existente

Archivo: `src/routes/emprendedores.tsx` (sección Hero ya existente, no se restructura).

- H1: `Directorio de Emprendedores` → `Directorio de Negocios`.
- Subtítulo y párrafo de apoyo: sustituir "emprendedores" por "negocios" y "emprendedor" por "negocio" donde aplique, manteniendo el resto del texto.
- Botón: `Regístrate como Emprendedor` → `Registra tu Negocio` (mismas clases).
- `head()` meta: actualizar `title`, `description`, `og:title`, `og:description` para reflejar "Directorio de Negocios / Registra tu negocio" sin cambiar la estructura del objeto.

Nota: no se renombra la ruta `/emprendedores` ni las tablas/funciones — solo copy visible.

## Bloques nuevos (insertados en este orden)

Ubicación: dentro de `src/routes/emprendedores.tsx`, entre la sección `¿Por qué registrarte?` y la sección de Filtros. Todos comparten el fondo `#18253f` para continuar el ritmo de la página; el bloque de prueba social usa `bg-white/5` como franja alterna (mismo tono ya usado en tarjetas), sin introducir colores nuevos.

### 1. Así funciona (3 pasos)

`<section>` con el mismo contenedor `mx-auto max-w-7xl px-4 py-12 sm:px-6` que las secciones actuales.

- Eyebrow: `Cómo funciona` — reutiliza el patrón visual de badges pequeños ya usados en la página (`text-xs font-semibold uppercase tracking-[0.2em] text-[#54b678]`, ya presente en `AboutSection`).
- H2: `Así funciona` — mismo tamaño/peso que el H2 de `¿Por qué registrarte?` (`font-display text-2xl text-white md:text-3xl`).
- Grid `md:grid-cols-3 gap-6` reutilizando exactamente el mismo componente tarjeta que ya usan los 3 beneficios (`rounded-2xl border border-[#54b678]/30 bg-white/5 p-6`).
- Cada tarjeta: número de paso como elemento tipográfico grande en `font-display text-5xl text-[#54b678]` (sin círculo, sin ícono), seguido del título del paso en `font-display text-xl text-white` y el cuerpo en `text-sm leading-relaxed text-white/80`.
- Desktop (md+): línea conectora sutil entre las 3 tarjetas — un `<div>` decorativo absoluto con `h-px bg-white/10` detrás del grid, oculto en mobile.
- Contenido:
  1. **Regístrate.** Llena tu perfil con la información de tu negocio — toma menos de 5 minutos.
  2. **Lo revisamos.** Tu perfil pasa por aprobación para mantener la calidad del directorio.
  3. **Te encuentran.** Los organizadores de mercados buscan aquí cuando arman su próximo evento — y te contactan directo.

### 2. Prueba social (franja horizontal)

`<section>` de ancho completo con `bg-white/5` (mismo tono que las tarjetas, crea ritmo sin color nuevo). Contenedor centrado `mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 text-center`.

- Una sola línea (no 3 cajas): número grande + texto de apoyo.
- Número: `font-display text-5xl md:text-6xl text-[#54b678] tabular-nums` → `+25 mercados · +20 organizadores`.
- Texto de apoyo debajo: `mt-3 text-base md:text-lg text-white/80` → `ya son parte de RutaMercado.`

### 3. Preguntas Frecuentes (acordeón)

`<section>` con el mismo contenedor que las demás. H2 con mismo estilo (`font-display text-2xl text-white md:text-3xl`) → `Preguntas frecuentes`.

- Lista de tarjetas apiladas (`space-y-3 max-w-3xl`) reutilizando `rounded-2xl border border-[#54b678]/30 bg-white/5`.
- Cada ítem usa un `<button aria-expanded>` como cabecera (patrón accesible; equivalente a `<details>` pero con control de animación). Ícono `+` a la derecha rota 45° al abrir con `transition-transform duration-200`.
- Panel expandible: anima `max-height` y `opacity` con `transition-[max-height,opacity] duration-200 ease-out`. Cerrado: `max-h-0 opacity-0`; abierto: `max-h-96 opacity-100`.
- Respeta `prefers-reduced-motion` (ya cubierto globalmente por la regla en `src/styles.css` que fuerza `transition-duration: 0.01ms` en `@media (prefers-reduced-motion: reduce)`).
- Preguntas:
  1. **¿Cuesta dinero registrarme?** — No, el registro es completamente gratis.
  2. **¿Cuánto tarda la aprobación?** — Generalmente entre 24 y 48 horas hábiles. *(pendiente de confirmar; si prefieres otro rango, lo ajusto en un edit rápido)*
  3. **¿Qué pasa después de que me aprueben?** — Tu perfil queda visible en el directorio y cualquier organizador puede contactarte directamente.

### 4. CTA final

`<section>` con padding generoso (`py-16 sm:py-20`) y contenido centrado `text-center`.

- Texto principal: `font-display text-2xl md:text-3xl text-white max-w-2xl mx-auto` → `Súmate a la lista de negocios que los organizadores de mercados de Puerto Rico ya están viendo.`
- Botón: reutiliza EXACTAMENTE las clases del botón del Hero (`inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#439660]`), con `onClick={() => setRegisterOpen(true)}` para abrir el mismo `RegisterEmprendedorDialog` ya montado.
- Etiqueta del botón: `Registra tu Negocio`.
- Margen superior amplio (`mt-8`) para dar el cierre visual.

## Componente auxiliar

Un pequeño `FAQItem` local dentro del mismo archivo (`emprendedores.tsx`), con estado `open` por ítem via `useState`. No se crea archivo nuevo para no fragmentar; el componente vive junto a la página que lo usa (patrón ya presente en el archivo).

## Accesibilidad

- Cada bloque en su `<section>` con `<h2>` propio.
- FAQ: `<button aria-expanded={open} aria-controls={panelId}>` + panel con `id={panelId}` y `role="region"`.
- Foco visible ya cubierto por la regla global `:focus-visible { outline: 2px solid #54b678; }` en `src/styles.css`.
- Contraste: todas las combinaciones usadas (`text-white`, `text-white/80`, `text-[#54b678]` sobre `#18253f` o `bg-white/5`) ya están validadas en el resto del sitio.

## Fuera de alcance

- Sin cambios en base de datos, RLS, funciones de servidor, ni en `admin.emprendedores.tsx`.
- Sin cambios de layout en el Hero, sección `¿Por qué registrarte?`, filtros o grid del directorio.
- Sin cambios en Header, Footer o rutas.
- El slug `/emprendedores` se conserva (solo copy cambia a "negocio(s)").

## Archivos tocados

- `src/routes/emprendedores.tsx` — copy del Hero + `head()` meta + 4 secciones nuevas + `FAQItem` local.
