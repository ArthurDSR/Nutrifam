-- ==============================================================================
-- NutriFam - Migration: Workout Routines and Completed Workouts (Hevy-style)
-- ==============================================================================

-- 1. Tabela de Fichas de Treino (Routines / Treinos A, B, C, Push, Pull, Legs)
CREATE TABLE IF NOT EXISTS public.workout_routines (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'custom',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workout_routines_user ON public.workout_routines(user_id);

-- 2. Tabela de Histórico de Treinos Concluídos
CREATE TABLE IF NOT EXISTS public.completed_workouts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id TEXT,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  total_volume_kg NUMERIC NOT NULL DEFAULT 0,
  total_sets INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_completed_workouts_user_date ON public.completed_workouts(user_id, date);

-- 3. Row Level Security (RLS)
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_workouts ENABLE ROW LEVEL SECURITY;

-- Policies para workout_routines
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias fichas de treino" ON public.workout_routines;
CREATE POLICY "Usuários podem gerenciar suas próprias fichas de treino"
  ON public.workout_routines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies para completed_workouts
DROP POLICY IF EXISTS "Usuários podem gerenciar seus treinos concluídos" ON public.completed_workouts;
CREATE POLICY "Usuários podem gerenciar seus treinos concluídos"
  ON public.completed_workouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
