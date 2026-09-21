-- Restrict avatar mutations to the authenticated user's own folder.
-- Public reads remain enabled because profile images use public URLs.

DROP POLICY IF EXISTS "Usuários autenticados podem enviar avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem enviar avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar seu avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Usuários autenticados podem remover seu avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem remover seu avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
