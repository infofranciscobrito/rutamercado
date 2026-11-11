# Página nueva: Registra tu negocio

Solo se crea la página nueva. No se tocan /negocios ni el menú de arriba.

## 1. Formulario reutilizable
- Nuevo `src/components/emprendedores/RegisterEmprendedorForm.tsx` con todo el formulario actual (campos, validaciones, logo, envío con `submitEmprendedor`).
- Al enviar bien, el mensaje de éxito reemplaza al formulario en la misma página.
- `RegisterEmprendedorDialog.tsx` pasa a usar este formulario por dentro; sigue funcionando igual en /negocios.

## 2. Ruta `/registra-tu-negocio` (Header + Footer, navy #18253f, verde #54b678, títulos font-display)
a. Hero: título, subtítulo, botón verde "Registra tu negocio" (scroll suave a `#formulario`), y "Ya hay X negocios en el directorio" (X de `listEmprendedores`). En móvil el botón se ve sin hacer scroll.
b. "Cómo funciona": 3 pasos con íconos.
c. "¿Por qué registrarte?": las 3 tarjetas de /negocios con el mismo texto y estilo. Como no se debe tocar /negocios en este paso, se copian aquí y se quedan también allá; se quitarán de /negocios en el próximo paso.
d. Vista previa: hasta 8 logos de negocios aprobados con logo, "Ellos ya están en el directorio" y enlace "Ver el directorio completo →" a /negocios.
e. Formulario: sección `id="formulario"`, fondo claro, título "Regístrate como emprendedor".
f. Preguntas frecuentes (Accordion) con las 4 preguntas y respuestas exactas.
g. Cierre: botón "Registra tu negocio" otra vez.

## 3. SEO
- Title, description, og:title/description, og:type, twitter:card, canonical `https://rutamercadopr.com/registra-tu-negocio`, og:image y twitter:image `https://rutamercadopr.com/og-negocios.png` (ya existe).
- Añadir la ruta al sitemap.

## 4. Verificación
- Revisar en 390 px y escritorio: botón del hero visible sin scroll, sin errores.
- Comprobar que el modal en /negocios sigue abriendo y mostrando el formulario.
- No se enviará un registro real de prueba salvo que lo pidas.
