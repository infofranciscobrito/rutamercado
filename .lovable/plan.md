## Cambios en el Header

**Archivo:** `src/components/rutamercado/Header.tsx`

### 1. Renombrar "Emprendedores" → "Registra tu negocio"
- Cambiar el texto del link en desktop nav y en el menú mobile (sheet).
- La ruta sigue siendo `/emprendedores` (no se toca routing ni la página).

### 2. Estilo de botones verdes en desktop nav
Convertir a botones (fondo `#54b678`, texto blanco, hover `#439660`):
- **Productores** → botón verde
- **Registra tu negocio** → botón verde
- **Enviar mi Mercado** → botón verde sólido (hoy es outline verde; pasa a sólido para unificar)

**Sobre Nosotros** se queda como link de texto (sin cambios).

Clase compartida propuesta:
```
inline-flex h-10 items-center justify-center rounded-md
bg-[#54b678] px-4 text-sm font-semibold text-white
transition-colors hover:bg-[#439660]
```

### 3. Menú mobile (sheet)
- Sobre Nosotros: queda como item de texto.
- Productores, Registra tu negocio, Enviar mi Mercado: mismo tratamiento de botón verde con texto blanco, apilados verticalmente con separación uniforme.

### Fuera de alcance
- No se toca el Footer.
- No se cambia el nombre de la ruta `/emprendedores` ni el contenido de esa página.
- No se toca la sidebar del admin.
