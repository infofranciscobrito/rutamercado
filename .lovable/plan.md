## Objetivo

Rediseñar el footer actual de RutaMercado a **4 columnas en desktop** (apiladas en mobile), manteniendo el fondo navy `#18253f`, texto blanco y links en verde `#54b678`.

## Estructura del nuevo footer

```text
[RutaMercado]          [Explorar]              [Para Organizadores]    [Legal]
Logo pequeño           Mercados Agrícolas      Registrar mi mercado    Sobre Nosotros
"Descubre los          Bazares                 Guía para organizadores Políticas de Privacidad
 mercados locales      Ferias Artesanales      Preguntas frecuentes    Términos de Uso
 de Puerto Rico"       Mercados Mixtos         Contacto
[IG] [FB]              Todos los municipios

─────────────────────────────────────────────────────────────────────────────
© 2025 RutaMercado — Hecho con ❤️ en Puerto Rico
```

## Cambios técnicos

### 1. Rediseño de `Footer.tsx`

**Archivo:** `src/components/rutamercado/Footer.tsx`

- Layout: `grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4` dentro de `max-w-7xl`.
- **Columna 1 — RutaMercado:**
  - Logo pequeño (`h-14`).
  - Eslogan "Descubre los mercados locales de Puerto Rico".
  - Iconos Instagram y Facebook (links externos).
- **Columna 2 — Explorar:**
  - Links a `/mercado-agricola`, `/bazar-pop-up`, `/feria-artesanal`, `/mercado-mixto`, `#municipios`.
- **Columna 3 — Para Organizadores:**
  - Links a `/enviar` (Registrar mi mercado), `#guia-para-organizadores`, `#preguntas-frecuentes`, `#contacto`.
- **Columna 4 — Legal / Sobre:**
  - `#sobre-nosotros`, `/politica-de-privacidad` (Políticas de Privacidad y Términos de Uso).
- **Línea final:** separador + copyright centrado con "© 2025 RutaMercado — Hecho con ❤️ en Puerto Rico".
- Colores: fondo `#18253f`, texto blanco `/70` para body, links `#54b678` con hover en blanco. Títulos de columna en blanco `font-display`.
- Mantiene el divisor verde superior existente.

### 2. Anclaje para `#municipios`

**Archivo:** `src/routes/index.tsx` (o el componente de filtros que se renderiza allí)

- Añadir `id="municipios"` al contenedor de los chips/dropdown de municipio para que el link del footer haga scroll suave.

### 3. Ajustes de estilo

- Usar tokens existentes: `bg-navy`, `text-gold`, `text-white`.
- Tipografía `font-sans` para el cuerpo, `font-display` para títulos de columna.

## Notas sobre anchors sin sección destino

Los links `#guia-para-organizadores`, `#preguntas-frecuentes` y `#contacto` se implementarán como hash links tal como decidiste; cuando existan esas secciones, funcionarán sin cambios adicionales.

## Archivos a modificar

- **Editar:** `src/components/rutamercado/Footer.tsx`
- **Editar:** `src/routes/index.tsx` (añadir `id="municipios"` a la sección de filtros)

## Fuera de alcance

- No se crea newsletter ni backend asociado.
- No se crean páginas nuevas para Guía, FAQ ni Contacto (se usan anchors).
- No se modifica el header ni el resto del layout.