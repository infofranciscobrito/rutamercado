## Problema

Al subir una foto en el formulario público `/enviar`, Supabase Storage devuelve:

> `permission denied for function has_role`

### Causa

El bucket `market-images` tiene 4 políticas RLS. Tres de ellas (admin insert/update/delete) llaman a `has_role(auth.uid(), 'admin')` **sin esquema**. En la última migración, `has_role` se movió de `public` a `private`, y el rol `anon` no tiene permiso `EXECUTE` sobre `private.has_role`.

Cuando un usuario anónimo intenta `INSERT` en `storage.objects`, Postgres evalúa todas las políticas `INSERT` aplicables (no solo la primera que pase). Al intentar resolver/ejecutar `has_role` para la política de admin, falla con "permission denied" antes de llegar a la política "Anyone can upload submission images" que sí permitiría la subida.

## Solución

Migración que recrea las 3 políticas de admin del bucket `market-images` para que usen `private.has_role(...)` explícitamente (igual que las políticas de las tablas `markets`, `market_exceptions`, etc.):

```sql
DROP POLICY "Admins can upload market-images" ON storage.objects;
DROP POLICY "Admins can update market-images" ON storage.objects;
DROP POLICY "Admins can delete market-images" ON storage.objects;

CREATE POLICY "Admins can upload market-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'market-images' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update market-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'market-images' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'market-images' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete market-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'market-images' AND private.has_role(auth.uid(), 'admin'));
```

También verifico que falte una policy de SELECT pública para que las imágenes se vean (el bucket es público a nivel de bucket, así que con eso basta para servir vía CDN — no se necesita policy de SELECT).

Resultado: usuarios anónimos podrán subir fotos a `submissions/...` desde `/enviar`, y los admins podrán seguir gestionando todas las imágenes.

No se tocan archivos de código.