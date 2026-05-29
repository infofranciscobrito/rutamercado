
## Objetivo

Convertir `/enviar` (que hoy es solo hero + formulario) en una landing completa de conversión para organizadores que llegan desde anuncios pagados, **sin tocar la lógica del `SubmitMarketForm` existente**.

## Cambios

### 1. `src/routes/enviar.tsx` — reescritura de la página

Mantener la URL `/enviar` y el componente `SubmitMarketForm` tal cual. Reemplazar todo el resto del JSX para construir 7 secciones en este orden:

**1. Header dedicado (inline, no usa `Header.tsx`)**
- Fondo `#1c1e37`, altura 64px, sticky.
- Izquierda: `<Link to="/">` con `logo-rutamercado-horizontal.png`.
- Derecha: un solo botón "Ver Directorio" → `<Link to="/">`, estilo outline amarillo (`border-[#f8b625] text-[#f8b625] hover:bg-[#f8b625] hover:text-[#1c1e37]`).
- Sin menú móvil ni Sheet.

**2. Hero**
- Fondo `#1c1e37` con overlay de grain sutil (radial-gradient de puntos vía CSS `background-image` inline, opacity baja, ~0.06).
- H1 (Cormorant Garamond): "Registra tu mercado. Llega a miles de puertorriqueños."
- Subheadline (Karla): copy del brief.
- CTA grande `#f8b625` / texto `#1c1e37`: "Registrar mi mercado ahora" → `onClick` hace `document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- Padding generoso (clamp).

**3. Métricas / prueba social**
- Fondo `#f7f7f5`.
- Grid 3 columnas (`grid-cols-1 md:grid-cols-3`), divider sutil entre columnas en desktop.
- Cada métrica: número grande `#f8b625` (Cormorant Garamond, ~3rem) + label `#1c1e37` (Karla).
- Contenido: "10+ municipios / Mercados en toda la isla", "Directorio activo / Actualizado cada semana", "Gratis / Sin costo para publicar".

**4. Por qué registrar tu mercado**
- Fondo blanco.
- H2 centrado (Cormorant Garamond): "¿Por qué registrar tu mercado en RutaMercado?".
- Grid `grid-cols-1 md:grid-cols-3 gap-6` con 3 cards (`rounded-2xl border border-[#1c1e37]/10 p-6 bg-white shadow-sm`).
- Iconos lucide-react (no emojis): `MapPin`, `CalendarDays`, `Gift` — en círculo `bg-[#f8b625]/15 text-[#f8b625]`.
- Título card en `#1c1e37`, descripción en `#2d2d2d`.

**5. Cómo funciona (3 pasos)**
- Fondo `#1c1e37`, texto blanco.
- H2 centrado: "Así de fácil es publicar tu mercado".
- 3 pasos en `grid-cols-1 md:grid-cols-3` con línea conectora:
  - Desktop: línea horizontal de fondo (`absolute top-6 left-0 right-0 h-px bg-[#f8b625]/30`) detrás de los círculos numerados.
  - Mobile: cuando es columna única, una línea vertical entre pasos (`md:hidden` border-left en wrapper, o pseudo-elemento). Mantener simple: en mobile, gap vertical + línea entre cada par con `before:` o un `<div>` separador.
- Cada paso: círculo `bg-[#f8b625] text-[#1c1e37]` con número, título blanco, descripción `text-white/75`.

**6. Formulario**
- Fondo `#f7f7f5`.
- Ancla `id="formulario"` en el wrapper de sección (`scroll-mt-20` para compensar header sticky).
- H2 (Cormorant Garamond) "Registra tu mercado" + subtítulo Karla "Completa los campos y tu mercado estará en el directorio en menos de 24 horas."
- Render `<SubmitMarketForm />` sin cambios (su botón submit ya es `#f8b625` / `#1c1e37`).

**7. Footer dedicado (inline, no usa `Footer.tsx`)**
- Fondo `#1c1e37`, texto blanco, centrado.
- Logo + "© 2025 RutaMercado. Todos los derechos reservados."
- Link "Ver directorio completo" → `<Link to="/">` color `#f8b625`.

### 2. Tipografías (Cormorant Garamond + Karla)

Importar desde Google Fonts. Opciones:
- **Vía `index.html`**: añadir `<link rel="preconnect">` + `<link href="...Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap">`.
- **Vía `src/styles.css`**: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap');` en la parte superior.

Preferiré editar `index.html` para no afectar el orden de `@import` de Tailwind v4 en `styles.css`. Usar las fuentes solo en `/enviar` mediante clases utilitarias inline (`style={{ fontFamily: '"Cormorant Garamond", serif' }}` para H1/H2 y `'"Karla", sans-serif'` para body de la página) — sin tocar el theme global para no contaminar el resto del portal.

### 3. Animaciones de scroll (fade-up)

Crear un pequeño helper local en el mismo archivo (o `src/components/rutamercado/RevealOnScroll.tsx` si conviene reutilizar):
- `useEffect` con `IntersectionObserver` que añade clase `is-visible` al entrar en viewport.
- CSS: estado inicial `opacity-0 translate-y-5`, final `opacity-100 translate-y-0`, `transition-[opacity,transform] duration-[400ms] ease-out`.
- Envolver cada sección (métricas, beneficios, pasos, formulario) en `<Reveal>`. Hero sin animación (above the fold).

Prefiero un componente único `Reveal` en el mismo archivo `enviar.tsx` para no inflar el árbol de componentes.

### 4. Responsive

- Mobile-first; todas las grids parten de `grid-cols-1` y suben a `md:grid-cols-3`.
- Cards de beneficios: columna única en mobile.
- Pasos: columna única en mobile con línea conectora vertical entre cada paso (separador `<div className="mx-auto h-8 w-px bg-[#f8b625]/30 md:hidden" />`).
- CTA hero a ancho completo en mobile (`w-full sm:w-auto`).

### 5. Lo que NO se toca

- `src/components/rutamercado/SubmitMarketForm.tsx` — sin cambios.
- `src/components/rutamercado/Header.tsx` y `Footer.tsx` — sin cambios (esta página usa header/footer dedicados, inline).
- Resto del portal, admin, modal, categorías — sin cambios.
- Metadata SEO de `/enviar` (`head()`) — mantener la actual; opcionalmente refinar el `description` para reflejar el nuevo contenido.

## Notas técnicas

- El scroll suave usa `scrollIntoView({ behavior: 'smooth' })`; añadir `scroll-mt-20` en la sección del formulario para que el header sticky no tape el título.
- El grain del hero se hace con `background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 3px 3px;` sobre el `#1c1e37` — cero assets nuevos.
- Iconos lucide ya disponibles en el proyecto; sin nuevas dependencias.
- Cormorant Garamond + Karla se cargan vía `<link>` en `index.html`; no requieren config de Tailwind porque se aplican vía `style={{ fontFamily }}` puntual en `/enviar`.
