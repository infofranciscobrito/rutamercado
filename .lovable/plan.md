## Objetivo
Añadir 5 campos internos al formulario "Regístrate como Emprendedor" (ubicado en `/emprendedores`), entre "Mercados donde ha participado..." y "Logo o foto representativa". Estos datos son solo para uso administrativo — no aparecerán en la ficha pública del negocio.

## Cambios

### 1. Base de datos (migración)
Añadir 5 columnas nuevas a la tabla `emprendedores` (todas nullable):
- `tiempo_operando` (text)
- `registro_comerciante` (text)
- `fuente_ingreso` (text)
- `canales_venta` (text[])
- `tamano_equipo` (text)

### 2. Server function pública (`src/lib/emprendedores.functions.ts`)
- Extender `RegisterSchema` con los 5 campos opcionales (enums validados server-side).
- Guardarlos en el `insert` de `submitEmprendedor`.
- **NO** exponerlos en `listEmprendedores` (la query pública sigue seleccionando exactamente los mismos campos que hoy → la ficha pública queda intacta).
- Incluirlos en el email interno de Resend para el equipo.

### 3. Formulario público (`src/components/emprendedores/RegisterEmprendedorDialog.tsx`)
Insertar los 5 campos entre "Mercados..." y "Logo o foto representativa", usando exactamente los mismos componentes ya presentes (`Label` + `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`, mismos `className="mt-1"`, mismo espaciado `space-y-4`):

1. `¿Cuánto tiempo lleva operando tu negocio?` → Select (Menos de 1 año / 1-3 años / 3-5 años / Más de 5 años), placeholder "Selecciona una opción"
2. `¿Tu negocio está registrado oficialmente (Registro de Comerciante)?` → Select (Sí / No / En proceso)
3. `¿Los mercados son tu fuente de ingreso principal o complementaria?` → Select (Principal / Complementaria / Ocasional)
4. `¿Vendes también por otros canales además de mercados?` → chips seleccionables múltiples (Tienda física / Tienda en línea / Redes sociales / Solo vendo en mercados), reutilizando el mismo estilo de "pill" con borde y radio ya usado en filtros — sin introducir componentes nuevos
5. `¿Cuántas personas trabajan en el negocio, incluyéndote a ti?` → Select (Solo yo / 2-5 personas / 6 o más)

Ninguno lleva asterisco. Sin validación obligatoria.

### 4. Admin (`src/routes/_admin/admin.emprendedores.tsx` + `src/lib/admin-emprendedores.functions.ts`)
- `AdminEmprendedor` type: incluir los 5 campos.
- `adminListEmprendedores`: seleccionar las 5 columnas nuevas.
- `adminUpsertEmprendedor`: aceptar y guardar los 5 campos (misma UI de Select/chips que en el público).
- Mostrar los datos en la tabla / drawer de revisión como "Información interna" para que el admin pueda ver y editar.

## Fuera de alcance (explícitamente NO se toca)
- `EmprendedorCard.tsx` (ficha pública) → sin cambios.
- Layout, colores, tipografías, radios, sombras, botones → sin cambios.
- `listEmprendedores` sigue devolviendo exactamente los mismos campos que hoy.

## Notas técnicas
- La migración corre antes que el código; la regeneración de types deja disponibles las columnas para las funciones admin/públicas.
- Los chips múltiples se implementan con botones toggle en línea con el estilo existente (border + radio + padding coherentes con el resto del formulario), sin librerías nuevas.
