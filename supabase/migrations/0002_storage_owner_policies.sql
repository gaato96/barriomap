-- ============================================================================
-- BarrioMap — Refina las políticas de Storage: cada dueño solo puede
-- subir/editar/borrar fotos DENTRO de la carpeta de SU PROPIO negocio
-- (product-photos/<business_id>/archivo.jpg). Antes cualquier usuario
-- autenticado podía escribir en cualquier carpeta del bucket.
-- Correr en: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================================

drop policy if exists "product photos write" on storage.objects;
create policy "product photos write" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-photos'
    and (
      is_superadmin()
      or exists (
        select 1 from businesses b
        where b.owner_id = auth.uid()
          and b.id::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "product photos update" on storage.objects;
create policy "product photos update" on storage.objects for update to authenticated
  using (
    bucket_id = 'product-photos'
    and (
      is_superadmin()
      or exists (
        select 1 from businesses b
        where b.owner_id = auth.uid()
          and b.id::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "product photos delete" on storage.objects;
create policy "product photos delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-photos'
    and (
      is_superadmin()
      or exists (
        select 1 from businesses b
        where b.owner_id = auth.uid()
          and b.id::text = (storage.foldername(name))[1]
      )
    )
  );
