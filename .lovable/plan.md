# Fase 4 de 4 — Revisión de Mesas Aliadas · Interés

Solo revisión. El único cambio de código es añadir una línea al mapa del sitio.

## 1. Mapa del sitio
- Añadir `/mesas-aliadas/interes` en `src/routes/sitemap[.]xml.ts`, justo debajo de `/rutalover`, con `changefreq: "monthly"` y `priority: "0.6"`.
- Comprobar que `/sitemap.xml` la muestra.

## 2. Carga y vista previa al compartir
- Abrir la página en 375 px y 1280 px; captura de pantalla, sin scroll de lado y sin errores en consola.
- Leer las etiquetas de la página servida: título, descripción, og:title, og:description, og:image y twitter:image, y confirmar que la imagen responde.

## 3. Cuatro recorridos con ?prueba=1 (375 px)
1. "Sí, cuenten conmigo" + correo + casilla → con contacto.
2. "Me interesa, quiero más información" + nombre del negocio + "Ahora no, terminar" → anónima.
3. "Por ahora no" → anónima, sin pantalla de contacto.
4. `?origen=instagram&prueba=1` → anónimo, verificar origen guardado.
- Anotar la lista de pantallas que vio cada uno.

## 4. Datos y panel
- Consultar la tabla: 4 filas, cada una con is_test = true; la del recorrido 2 sin nombre de negocio ni contacto; la del 4 con origen "instagram".
- Entrar como administrador a /admin/mesas-aliadas: sin pruebas no aparecen; con "Mostrar pruebas" encendido sí.
- Usar "Borrar pruebas" y confirmar en la tabla que quedan 0 filas de prueba.

## 5. Que lo demás siga igual
- /rutalover abre y avanza la portada.
- /admin/encuesta y /admin/dashboard cargan sin errores.

No se toca nada más.
