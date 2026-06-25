## Objetivo
Cambiar el esquema de colores de las tarjetas en `/productores` de verde sólido a fondo navy con acentos verdes, siguiendo la especificación exacta del usuario.

## Archivo a modificar
- `src/components/productores/ProducerCard.tsx`

## Cambios detallados

### Tarjeta contenedor
- **Fondo**: `bg-[#18253f]` (navy del sitio, variable `--color-navy`)
- **Borde**: `border-2 border-[#54b678]` (verde primario)
- **Border-radius**: mantener `rounded-2xl`
- **Sombra base**: `shadow-[0_2px_12px_rgba(0,0,0,0.3)]`
- **Sombra hover**: `shadow-[0_8px_30px_rgba(0,0,0,0.5)]` con `hover:-translate-y-1`

### Texto
- **Principal** (nombre del productor, label "MERCADOS"): blanco puro (`text-white`)
- **Secundario** (región, nombres de mercados, datos de contacto): verde primario (`text-[#54b678]`)

### Contacto links e íconos
- **Estado base**: íconos y texto en verde primario (`text-[#54b678]`)
- **Hover**: texto e íconos en blanco (`hover:text-white`); fondo de hover usar verde con baja opacidad (`hover:bg-[#54b678]/10`)

### Avatar / placeholder circular
- **Fondo del placeholder**: verde primario (`bg-[#54b678]`)
- **Iniciales**: blanco (`text-white`)
- **Borde del círculo**: `border-2 border-[#54b678]`
- **Imagen con logo**: mismo borde verde

### Separadores horizontales
- Reemplazar `border-white/20` por `border-[#54b678]/30`

### Tags de mercados (Badge)
- **Fondo**: verde primario al 15% (`bg-[#54b678]/15`)
- **Texto**: verde primario (`text-[#54b678]`)
- **Borde**: `border border-[#54b678]/40`

### Botón "Actualizar información"
- **Borde**: verde primario (`border-[#54b678]`)
- **Texto**: verde primario (`text-[#54b678]`)
- **Fondo**: transparente
- **Hover**: fondo verde primario (`hover:bg-[#54b678]`), texto blanco (`hover:text-white`)

## Restricciones respetadas
- No se modifica `src/routes/productores.tsx` ni el fondo de la página.
- Sin cambios a Supabase ni estructura de datos.
- Sin afectar otras páginas del sitio.
- No se usa la palabra "mercaditos".