# Nuevo fondo del Hero con la ilustración del mercado

## 1. Copiar la imagen al proyecto

Copiar `user-uploads://Gemini_Generated_Image_cfigykcfigykcfig.png` a `public/hero-bg.jpg` (reemplazando el actual). Antes de copiar, optimizar:

- Redimensionar a **1920 px de ancho** (alto proporcional, la imagen es panorámica ~3.4:1, perfecto para hero).
- Convertir a JPG calidad 88 para mantener nitidez sin peso excesivo (~250–350 KB esperado).
- Mantener el detalle central (puestos, personas, banderines) bien resuelto.

## 2. Ajustar el filtro azul en `Hero.tsx`

Para que la imagen se difumine en el navy de marca (`#1c1e37`) pero siga generando atención visual:

```text
Capa 1: imagen de fondo (background-size: cover, position: center)
Capa 2: overlay navy con mezcla → bg-[#1c1e37]/70 + mix-blend-multiply
Capa 3: gradiente vertical suave navy arriba/abajo (para legibilidad del texto)
Capa 4: patrón de puntos dorados (rm-hero-pattern) opacity-40
Capa 5: degradado final hacia el contenido (#1c1e37]/90 en la parte inferior)
```

Resultado: la ilustración se ve teñida de azul marino (como una foto monocroma azul), los colores cálidos quedan apagados pero la composición y los personajes siguen siendo reconocibles. El título, subtítulo y buscador mantienen contraste total gracias al gradiente y al `drop-shadow`.

## 3. Detalles técnicos del overlay

- Cambiar el overlay actual (`bg-[#1c1e37]/55`) por dos capas combinadas:
  - `bg-[#1c1e37]/65` con `mix-blend-multiply` → tiñe la imagen de azul sin oscurecer demasiado.
  - Encima, `bg-gradient-to-b from-[#1c1e37]/40 via-transparent to-[#1c1e37]/85` → asegura legibilidad arriba del título y fade hacia el contenido.
- Subir la opacidad del patrón de puntos a `opacity-40` (más sutil para no competir con la ilustración).
- Mantener `drop-shadow-lg` en el `<h1>` y `text-white/90` en el párrafo.

## 4. Archivos a tocar

- **Reemplazar** `public/hero-bg.jpg` con la nueva imagen optimizada.
- **Editar** `src/components/rutamercado/Hero.tsx` — ajustar capas de overlay (sin cambiar estructura ni copy).

Nada más se toca; el resto del home queda igual.
