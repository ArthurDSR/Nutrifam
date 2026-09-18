-- ==============================================================================
-- NutriFam - Migration: Catálogo Próprio de Exercícios e Bucket de Mídia
-- Execute este script no SQL Editor do seu projeto Supabase
-- (Dashboard do Supabase -> SQL Editor -> New Query -> Colar e clicar em 'Run')
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela Oficial de Exercícios (Catálogo do NutriFam + Exercícios Customizados)
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL, -- 'chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'calves', 'cardio'
  equipment TEXT NOT NULL DEFAULT 'other', -- 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'smith', 'other'
  target_muscle TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}'::text[],
  instructions TEXT NOT NULL,
  tips TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  gif_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para buscas ultrarrápidas no catálogo
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_is_custom ON public.exercises(is_custom);

-- 3. Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Leitura: Qualquer pessoa (pública ou autenticada) pode consultar os exercícios oficiais
-- e os usuários autenticados podem ver também seus próprios exercícios customizados
DROP POLICY IF EXISTS "Leitura de exercícios oficiais e customizados do usuário" ON public.exercises;
CREATE POLICY "Leitura de exercícios oficiais e customizados do usuário"
  ON public.exercises
  FOR SELECT
  USING (created_by IS NULL OR auth.uid() = created_by);

-- Inserção: Usuários autenticados podem criar seus próprios exercícios
DROP POLICY IF EXISTS "Usuários autenticados podem cadastrar novos exercícios" ON public.exercises;
CREATE POLICY "Usuários autenticados podem cadastrar novos exercícios"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Edição: Usuários só podem atualizar os exercícios que eles mesmos criaram
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios exercícios" ON public.exercises;
CREATE POLICY "Usuários podem atualizar seus próprios exercícios"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Exclusão: Usuários só podem excluir seus próprios exercícios customizados
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios exercícios" ON public.exercises;
CREATE POLICY "Usuários podem deletar seus próprios exercícios"
  ON public.exercises
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 4. Bucket de Armazenamento para os GIFs e Imagens dos Exercícios
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-media', 'exercise-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket 'exercise-media'
DROP POLICY IF EXISTS "Acesso público de leitura aos GIFs de exercícios" ON storage.objects;
CREATE POLICY "Acesso público de leitura aos GIFs de exercícios"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'exercise-media');

DROP POLICY IF EXISTS "Upload de mídias de exercícios para usuários autenticados" ON storage.objects;
CREATE POLICY "Upload de mídias de exercícios para usuários autenticados"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exercise-media');
