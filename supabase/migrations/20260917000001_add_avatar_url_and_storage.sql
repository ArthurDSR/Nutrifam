-- ==============================================================================
-- NutriFam Migration: Adicionar avatar_url e Configurar Supabase Storage
-- Data: 2026-09-17
-- ==============================================================================

-- 1. Adicionar coluna avatar_url na tabela public.profiles caso não exista
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. Criar Bucket público 'avatars' no Supabase Storage caso não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- Limite de 5MB por foto
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Configurar Políticas de Segurança (RLS) para o Bucket 'avatars'
-- A) Leitura pública: qualquer pessoa pode visualizar os avatares (necessário para exibição pública de fotos de perfil)
DROP POLICY IF EXISTS "Avatares são publicamente visíveis" ON storage.objects;
CREATE POLICY "Avatares são publicamente visíveis"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- B) Inserção / Upload: Usuários autenticados podem enviar arquivos para seu próprio diretório no bucket
DROP POLICY IF EXISTS "Usuários autenticados podem enviar avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem enviar avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '_%'
    )
  );

-- C) Atualização / Substituição (Upsert): Usuários autenticados podem atualizar seu próprio avatar
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar seu avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '_%'
    )
  );

-- D) Remoção: Usuários autenticados podem deletar seu próprio avatar
DROP POLICY IF EXISTS "Usuários autenticados podem deletar seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem deletar seu avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '_%'
    )
  );

-- 4. Atualizar gatilho handle_new_user para capturar avatar_url de OAuth (Google/Apple) caso disponível
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_text, avatar_url, pet_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    UPPER(SUBSTRING(COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 1, 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL),
    COALESCE(new.raw_user_meta_data->>'pet_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
