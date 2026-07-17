## Objetivo

Aplicar el estilo/estructura visual de `/enviar` (hero azul + verde, tipografía Cormorant Garamond + Karla, secciones con Reveal, métricas, "por qué", "cómo funciona", CTA hacia formulario) al módulo de emprendedores. Mantener el directorio funcional en `/emprendedores` y agregar una landing dedicada de conversión en `/emprendedores/registro`.

## Cambios

### 1. Nueva ruta `/emprendedores/registro` (landing de conversión)
Archivo nuevo: `src/routes/emprendedores.registro.tsx`

Espejo estructural de `/enviar`, adaptado a emprendedores:
- **Header** sticky con logo y botón "Ver directorio" → `/emprendedores`.
- **Hero** azul `#18253f` con eyebrow "Para emprendedores", H1 tipo *"Muéstrale tu marca a los organizadores de mercados"*, subcopy, CTA verde "Registrar mi emprendimiento" que scrollea a `#formulario`.
- **Métricas** (3 tarjetas): categorías cubiertas, organizadores activos, gratis.
- **¿Por qué registrarte?** (3 beneficios con íconos lucide): visibilidad ante organizadores, contacto directo, gratis.
- **Cómo funciona** (3 pasos): completa el formulario → revisamos → apareces en el directorio.
- **Formulario** (`#formulario`): renderiza el contenido del `RegisterEmprendedorDialog` como formulario inline (no modal). Requiere extraer el cuerpo del dialog a un componente reutilizable `RegisterEmprendedorForm` para poder usarlo tanto en el dialog existente como inline en la landing (sin duplicar lógica de submit/upload).
- **Footer** compacto igual al de `/enviar`.

### 2. Refactor mínimo del formulario de emprendedores
- Extraer el `<form>` de `src/components/emprendedores/RegisterEmprendedorDialog.tsx` a `src/components/emprendedores/RegisterEmprendedorForm.tsx` (mismos props/estado, sin `Dialog*`). El dialog pasa a envolver `<RegisterEmprendedorForm />`. Sin cambios de negocio ni de validación.

### 3. Landing embebida en `/emprendedores` (directorio actual)
Encima del grid de emprendedores, añadir un bloque hero/beneficios compacto reutilizando el lenguaje visual de `/enviar`:
- Hero corto azul con H1, subcopy y CTA verde "Registrar mi emprendimiento" → link a `/emprendedores/registro`.
- Fila de 3 beneficios resumidos.
- El grid del directorio, filtros y card `EmprendedorCard` se mantienen intactos abajo.

No se toca lógica de datos, RLS, ni el panel admin.

### 4. SEO
- `/emprendedores/registro`: `head()` propio con title/description/OG específicos de la landing de registro.
- `/emprendedores`: actualizar `head()` para reflejar que es directorio + registro.

## Detalles técnicos

- Fuentes: cargar Cormorant Garamond + Karla vía `links` en el `head()` de la nueva ruta (mismo bloque que `/enviar`).
- Colores: `#18253f` (fondo/primario oscuro), `#54b678` (acento verde), `#f7f7f5` (secciones claras).
- Reusar el componente `Reveal` — extraer a `src/components/rutamercado/Reveal.tsx` para que `/enviar` y `/emprendedores/registro` compartan la misma implementación (sin duplicar código).
- Ruta hija `emprendedores.registro.tsx`: TanStack file-based routing con `createFileRoute("/emprendedores/registro")`. No se necesita layout, `/emprendedores` sigue siendo hoja independiente (no se convierte en layout).
