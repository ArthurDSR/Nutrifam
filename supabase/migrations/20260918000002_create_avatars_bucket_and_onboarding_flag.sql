-- ==============================================================================
-- NutriFam Migration: Bucket de Avatares & Flag de Onboarding
-- Arquivo: supabase/migrations/20260918000002_create_avatars_bucket_and_onboarding_flag.sql
-- Execute este script no SQL Editor do seu projeto Supabase
-- (Dashboard -> SQL Editor -> New Query -> Colar e clicar em 'Run')
-- ==============================================================================

-- 1. Adicionar coluna is_onboarding_completed e avatar_url na tabela public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. Criar ou atualizar o Bucket público 'avatars' no Supabase Storage
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
-- A) Leitura pública: qualquer usuário pode visualizar avatares de perfil
DROP POLICY IF EXISTS "Avatares são publicamente visíveis" ON storage.objects;
CREATE POLICY "Avatares são publicamente visíveis"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- B) Upload: Usuários autenticados podem enviar seus avatares
DROP POLICY IF EXISTS "Usuários autenticados podem enviar avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem enviar avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- C) Atualização / Substituição: Usuários autenticados podem alterar fotos
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar seu avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- D) Exclusão: Usuários autenticados podem remover seu avatar
DROP POLICY IF EXISTS "Usuários autenticados podem remover seu avatar" ON storage.objects;
CREATE POLICY "Usuários autenticados podem remover seu avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
