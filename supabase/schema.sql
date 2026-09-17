-- ==============================================================================
-- NutriFam - Supabase Database Schema
-- Execute este script completo no SQL Editor do seu projeto Supabase
-- (Dashboard do Supabase -> SQL Editor -> New Query -> Colar e clicar em 'Run')
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (vinculada à tabela nativa auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_text TEXT DEFAULT 'A',
  avatar_url TEXT DEFAULT NULL,
  goal_type TEXT DEFAULT 'Lose weight',
  height_cm NUMERIC DEFAULT 0,
  start_weight_kg NUMERIC DEFAULT 0,
  current_weight_kg NUMERIC DEFAULT 0,
  goal_weight_kg NUMERIC DEFAULT 0,
  daily_calories_target INTEGER DEFAULT 2000,
  target_macros JSONB DEFAULT '{"proteinGrams": 120, "carbsGrams": 170, "fatGrams": 45, "fiberGrams": 28}'::jsonb,
  gems INTEGER DEFAULT 100,
  burned_calories NUMERIC DEFAULT 0,
  apple_health_synced BOOLEAN DEFAULT false,
  gender TEXT DEFAULT 'male',
  age INTEGER DEFAULT 25,
  activity_level TEXT DEFAULT 'moderate',
  weekly_pace_kg NUMERIC DEFAULT 0.5,
  pet_level INTEGER DEFAULT 1,
  pet_xp INTEGER DEFAULT 35,
  pet_mood TEXT DEFAULT 'happy',
  pet_name TEXT DEFAULT '',
  inventory JSONB DEFAULT '["cap_lilac"]'::jsonb,
  equipped_cap TEXT DEFAULT 'cap_lilac',
  equipped_glasses TEXT DEFAULT NULL,
  equipped_clothes TEXT DEFAULT NULL,
  show_splash_animation BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Suporte a atualizações de schema incrementais (caso as tabelas já existam)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pet_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_clothes TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_splash_animation BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 3. Tabela de Registros Diários (Refeições, Água, Jejum, Atividades, Notas)
CREATE TABLE IF NOT EXISTS public.day_logs (
  id TEXT PRIMARY KEY, -- formato: {user_id}_{date}
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meals JSONB NOT NULL,
  water JSONB NOT NULL,
  fasting JSONB NOT NULL,
  activities JSONB DEFAULT '[]'::jsonb,
  note TEXT DEFAULT '',
  grade TEXT DEFAULT 'A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_day_logs_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_day_logs_user_date ON public.day_logs(user_id, date);

-- 4. Tabela de Histórico de Pesagens
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON public.weight_entries(user_id, date);

-- 5. Tabela de Alimentos e Receitas Personalizadas do Usuário
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  calories INTEGER NOT NULL,
  serving_size TEXT NOT NULL,
  serving_grams NUMERIC DEFAULT 100,
  serving_unit_name TEXT DEFAULT 'porção',
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  color_dot TEXT DEFAULT '#10b981',
  category TEXT DEFAULT 'Food',
  barcode TEXT,
  nova_group INTEGER,
  health_score INTEGER,
  preservatives_count INTEGER DEFAULT 0,
  additives JSONB DEFAULT '[]'::jsonb,
  healthy_alternative TEXT,
  is_recipe BOOLEAN DEFAULT false,
  recipe_yield_portions NUMERIC,
  recipe_ingredients JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON public.custom_foods(user_id);

-- ==============================================================================
-- Gatilho Automático de Criação de Perfil (Supabase Auth Trigger)
-- Cria automaticamente o perfil do usuário em public.profiles após o cadastro
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_text, pet_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    UPPER(SUBSTRING(COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 1, 1)),
    COALESCE(new.raw_user_meta_data->>'pet_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- Cada usuário autenticado acessa exclusivamente seus próprios registros
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- 1. Policies para Profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Policies para Day Logs
DROP POLICY IF EXISTS "Usuários podem ver seus próprios day_logs" ON public.day_logs;
CREATE POLICY "Usuários podem ver seus próprios day_logs"
  ON public.day_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios day_logs" ON public.day_logs;
CREATE POLICY "Usuários podem inserir seus próprios day_logs"
  ON public.day_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios day_logs" ON public.day_logs;
CREATE POLICY "Usuários podem atualizar seus próprios day_logs"
  ON public.day_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios day_logs" ON public.day_logs;
CREATE POLICY "Usuários podem deletar seus próprios day_logs"
  ON public.day_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Policies para Weight Entries
DROP POLICY IF EXISTS "Usuários podem gerenciar seus pesos" ON public.weight_entries;
CREATE POLICY "Usuários podem gerenciar seus pesos"
  ON public.weight_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Policies para Custom Foods
DROP POLICY IF EXISTS "Usuários podem gerenciar seus alimentos personalizados" ON public.custom_foods;
CREATE POLICY "Usuários podem gerenciar seus alimentos personalizados"
  ON public.custom_foods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 5. Supabase Storage - Bucket de Fotos de Perfil ('avatars')
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Políticas de RLS para o Bucket 'avatars'
DROP POLICY IF EXISTS "Avatares são publicamente visíveis" ON storage.objects;
CREATE POLICY "Avatares são publicamente visíveis"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

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

