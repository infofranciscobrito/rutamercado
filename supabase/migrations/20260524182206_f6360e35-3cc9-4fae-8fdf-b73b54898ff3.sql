
insert into storage.buckets (id, name, public)
values ('market-images', 'market-images', true)
on conflict (id) do nothing;

create policy "Public can view market images"
on storage.objects for select
using (bucket_id = 'market-images');

create policy "Authenticated can upload market images"
on storage.objects for insert to authenticated
with check (bucket_id = 'market-images');

create policy "Authenticated can update market images"
on storage.objects for update to authenticated
using (bucket_id = 'market-images');

create policy "Authenticated can delete market images"
on storage.objects for delete to authenticated
using (bucket_id = 'market-images');
