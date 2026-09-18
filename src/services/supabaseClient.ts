import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, DayLog, WeightEntry, FoodItem, WorkoutRoutine, CompletedWorkout } from '../types';

const STORAGE_URL_KEY = 'nutrifam_supabase_url';
const STORAGE_KEY_KEY = 'nutrifam_supabase_anon_key';
const LEGACY_STORAGE_URL_KEY = 'nutrimonitor_supabase_url';
const LEGACY_STORAGE_KEY_KEY = 'nutrimonitor_supabase_anon_key';

type NutriFamGlobal = typeof globalThis & {
  __nutrifamSupabaseClient?: SupabaseClient | null;
};

const globalCache = globalThis as NutriFamGlobal;

declare const __SUPABASE_URL__: string | undefined;
declare const __SUPABASE_ANON_KEY__: string | undefined;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  // 1. Literal compile-time define check (Vite replaces these exact symbols during build)
  let staticUrl = '';
  let staticKey = '';
  try {
    if (typeof __SUPABASE_URL__ === 'string') staticUrl = __SUPABASE_URL__;
    if (typeof __SUPABASE_ANON_KEY__ === 'string') staticKey = __SUPABASE_ANON_KEY__;
  } catch {}

  // 2. Direct import.meta.env properties (must be literal import.meta.env for Vite compiler)
  const envUrl =
    staticUrl ||
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env as any)?.SUPABASE_URL ||
    (import.meta.env as any)?.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const envKey =
    staticKey ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta.env as any)?.SUPABASE_ANON_KEY ||
    (import.meta.env as any)?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const localUrl = localStorage.getItem(STORAGE_URL_KEY) || localStorage.getItem(LEGACY_STORAGE_URL_KEY) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_KEY) || '';

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localKey || envKey || '').trim();

  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  globalCache.__nutrifamSupabaseClient = null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function getSupabase(): SupabaseClient | null {
  if (globalCache.__nutrifamSupabaseClient) return globalCache.__nutrifamSupabaseClient;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    globalCache.__nutrifamSupabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return globalCache.__nutrifamSupabaseClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  missingTables?: string[];
}> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'URL ou Chave Anon do Supabase não configuradas no arquivo .env.' };
  }

  try {
    const tables = ['profiles', 'day_logs', 'weight_entries', 'custom_foods'];
    const missing: string[] = [];

    for (const table of tables) {
      const { error } = await client.from(table).select('*').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          missing.push(table);
        } else {
          return { success: false, message: `Erro ao conectar na tabela "${table}": ${error.message}` };
        }
      }
    }

    if (missing.length > 0) {
      return {
        success: false,
        message: `Conectou ao Supabase, mas faltam tabelas no banco: ${missing.join(', ')}. Execute o script supabase/schema.sql completo no SQL Editor do Supabase.`,
        missingTables: missing
      };
    }

    return {
      success: true,
      message: 'Conectado ao Supabase com sucesso! Todas as 4 tabelas (profiles, day_logs, weight_entries, custom_foods) estão ativas e sincronizadas.'
    };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err.message || err}` };
  }
}

// --------------------------------------------------------------------------------
// Profile CRUD
// --------------------------------------------------------------------------------
export async function getActiveUserId(): Promise<string | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user?.id) return user.id;
    } catch {}
  }
  return null;
}

export async function loadProfileFromSupabase(userId?: string): Promise<UserProfile | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (error || !data) return null;

    const currentWeight = Number(data.current_weight_kg) || 0;
    const goalWeight = Number(data.goal_weight_kg) || 0;
    const startWeight = Number(data.start_weight_kg) || currentWeight || 0;

    // Detect legacy mock/template data (65kg/60kg or 60kg/55kg from initial schemas)
    const isLegacyMock =
      (currentWeight === 65 && goalWeight === 60) ||
      (currentWeight === 60 && goalWeight === 55) ||
      (currentWeight === 0 && goalWeight === 0);

    const hasRealBiometrics = !isLegacyMock && currentWeight > 0 && goalWeight > 0;
    const sanitizedCurrent = hasRealBiometrics ? currentWeight : 0;
    const sanitizedGoal = hasRealBiometrics ? goalWeight : 0;
    const sanitizedStart = hasRealBiometrics ? startWeight : 0;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarText: data.avatar_text || 'A',
      avatarUrl: data.avatar_url || undefined,
      goalType: data.goal_type || 'Lose weight',
      heightCm: Number(data.height_cm) || 0,
      startWeightKg: sanitizedStart,
      currentWeightKg: sanitizedCurrent,
      goalWeightKg: sanitizedGoal,
      dailyCaloriesTarget: Number(data.daily_calories_target) || 2000,
      targetMacros: data.target_macros || {
        proteinGrams: 120,
        carbsGrams: 170,
        fatGrams: 45,
        fiberGrams: 28
      },
      gems: Number(data.gems) ?? 100,
      burnedCalories: Number(data.burned_calories) || 0,
      appleHealthSynced: Boolean(data.apple_health_synced),
      gender: data.gender || 'male',
      age: Number(data.age) || 25,
      activityLevel: data.activity_level || 'moderate',
      weeklyPaceKg: Number(data.weekly_pace_kg) || 0.5,
      petLevel: Number(data.pet_level) || 1,
      petXp: Number(data.pet_xp) ?? 35,
      petMood: data.pet_mood || 'happy',
      petName: data.pet_name || '',
      inventory: data.inventory || ['cap_lilac'],
      equippedCap: data.equipped_cap !== undefined ? data.equipped_cap : 'cap_lilac',
      equippedGlasses: data.equipped_glasses !== undefined ? data.equipped_glasses : null,
      equippedClothes: data.equipped_clothes !== undefined ? data.equipped_clothes : null,
      showSplashAnimation: data.show_splash_animation !== undefined ? Boolean(data.show_splash_animation) : true,
      geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
      isOnboardingCompleted: hasRealBiometrics
    };
  } catch (err) {
    console.warn('Error loading profile from Supabase:', err);
    return null;
  }
}

export async function saveProfileToSupabase(profile: UserProfile, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || profile.id || await getActiveUserId();
  if (!targetId) return false;

  try {
    const payload: any = {
      id: targetId,
      name: profile.name,
      avatar_text: profile.avatarText,
      avatar_url: profile.avatarUrl || null,
      goal_type: profile.goalType,
      height_cm: profile.heightCm,
      start_weight_kg: profile.startWeightKg,
      current_weight_kg: profile.currentWeightKg,
      goal_weight_kg: profile.goalWeightKg,
      daily_calories_target: profile.dailyCaloriesTarget,
      target_macros: profile.targetMacros,
      gems: profile.gems,
      burned_calories: profile.burnedCalories,
      apple_health_synced: profile.appleHealthSynced,
      gender: profile.gender || 'male',
      age: profile.age || 25,
      activity_level: profile.activityLevel || 'moderate',
      weekly_pace_kg: profile.weeklyPaceKg || 0.5,
      pet_level: profile.petLevel || 1,
      pet_xp: profile.petXp ?? 35,
      pet_mood: profile.petMood || 'happy',
      pet_name: profile.petName,
      inventory: profile.inventory || ['cap_lilac'],
      equipped_cap: profile.equippedCap,
      equipped_glasses: profile.equippedGlasses,
      equipped_clothes: profile.equippedClothes,
      show_splash_animation: profile.showSplashAnimation,
      updated_at: new Date().toISOString()
    };

    if (profile.email) {
      payload.email = profile.email;
    }

    const { error } = await client.from('profiles').upsert(payload);

    if (error) {
      console.warn('Error saving profile to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving profile to Supabase:', err);
    return false;
  }
}

/**
 * Redimensiona e comprime uma imagem no navegador utilizando HTML Canvas.
 * Limita as dimensões a no máximo 800x800 e comprime com qualidade JPEG 0.85,
 * reduzindo fotos pesadas de câmera (5MB+) para ~80KB para uploads ultrarrápidos.
 */
export async function compressAvatarImage(
  file: File | Blob,
  maxDimension = 800,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido ou corrompido.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Não foi possível inicializar o renderizador de imagem.'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              resolve({ blob: file, dataUrl });
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Envia uma foto de perfil para o Supabase Storage (bucket 'avatars').
 * Inclui compressão client-side prévia automática.
 * Se o bucket ainda não tiver sido criado no banco ou o usuário estiver offline,
 * retorna a imagem comprimida em Data URL Base64 com resiliência total.
 */
export async function uploadAvatarImage(
  file: File | Blob,
  userId?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    // 1. Compressão client-side
    const { blob, dataUrl } = await compressAvatarImage(file, 800, 0.85);

    const client = getSupabase();
    const targetUserId = userId || (await getActiveUserId()) || 'local_user';

    // 2. Se o Supabase não estiver configurado ou usuário não autenticado, usa Data URL Base64
    if (!client || targetUserId === 'local_user') {
      return { success: true, url: dataUrl };
    }

    // 3. Caminho do arquivo: {userId}/avatar_{timestamp}.jpg
    const fileExt = 'jpg';
    const filePath = `${targetUserId}/avatar_${Date.now()}.${fileExt}`;

    // 4. Upload para o bucket 'avatars'
    const { error: uploadError } = await client.storage
      .from('avatars')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, fallback para dataUrl:', uploadError.message);
      return {
        success: true,
        url: dataUrl,
        error: uploadError.message
      };
    }

    // 5. Obter URL pública do Supabase Storage
    const { data } = client.storage.from('avatars').getPublicUrl(filePath);
    if (data?.publicUrl) {
      return { success: true, url: data.publicUrl };
    }

    return { success: true, url: dataUrl };
  } catch (err: any) {
    console.error('Erro no upload de avatar:', err);
    return {
      success: false,
      url: '',
      error: err.message || 'Erro ao processar imagem.'
    };
  }
}

// --------------------------------------------------------------------------------
// Day Logs CRUD
// --------------------------------------------------------------------------------
export async function loadDayLogsFromSupabase(userId?: string): Promise<Record<string, DayLog> | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('day_logs')
      .select('*')
      .eq('user_id', targetId);

    if (error || !data) return null;

    const result: Record<string, DayLog> = {};
    for (const row of data) {
      result[row.date] = {
        date: row.date,
        meals: row.meals,
        water: row.water,
        fasting: row.fasting,
        activities: row.activities || [],
        note: row.note || '',
        grade: row.grade || 'A'
      };
    }
    return result;
  } catch (err) {
    console.warn('Error loading day logs from Supabase:', err);
    return null;
  }
}

export async function saveDayLogToSupabase(dayLog: DayLog, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const compositeId = `${targetId}_${dayLog.date}`;
    const { error } = await client.from('day_logs').upsert({
      id: compositeId,
      user_id: targetId,
      date: dayLog.date,
      meals: dayLog.meals,
      water: dayLog.water,
      fasting: dayLog.fasting,
      activities: dayLog.activities,
      note: dayLog.note,
      grade: dayLog.grade,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Error saving day log to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving day log to Supabase:', err);
    return false;
  }
}

// --------------------------------------------------------------------------------
// Weight Entries CRUD
// --------------------------------------------------------------------------------
export async function loadWeightEntriesFromSupabase(userId?: string): Promise<WeightEntry[] | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('weight_entries')
      .select('*')
      .eq('user_id', targetId)
      .order('date', { ascending: true });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      date: row.date,
      weightKg: Number(row.weight_kg),
      note: row.note
    }));
  } catch (err) {
    console.warn('Error loading weight entries from Supabase:', err);
    return null;
  }
}

export async function saveWeightEntryToSupabase(entry: WeightEntry, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client.from('weight_entries').upsert({
      id: entry.id,
      user_id: targetId,
      date: entry.date,
      weight_kg: entry.weightKg,
      note: entry.note || '',
      created_at: new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.warn('Error saving weight entry to Supabase:', err);
    return false;
  }
}

// --------------------------------------------------------------------------------
// Custom Foods CRUD
// --------------------------------------------------------------------------------
export async function loadCustomFoodsFromSupabase(userId?: string): Promise<FoodItem[] | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('custom_foods')
      .select('*')
      .eq('user_id', targetId);

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      calories: Number(row.calories),
      servingSize: row.serving_size,
      servingGrams: Number(row.serving_grams),
      protein: Number(row.protein),
      carbs: Number(row.carbs),
      fat: Number(row.fat),
      fiber: Number(row.fiber),
      colorDot: row.color_dot,
      category: row.category,
      barcode: row.barcode
    }));
  } catch (err) {
    console.warn('Error loading custom foods from Supabase:', err);
    return null;
  }
}

export async function saveCustomFoodToSupabase(food: FoodItem, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client.from('custom_foods').upsert({
      id: food.id,
      user_id: targetId,
      name: food.name,
      brand: food.brand || '',
      calories: food.calories,
      serving_size: food.servingSize,
      serving_grams: food.servingGrams,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      color_dot: food.colorDot || '#14b8a6',
      category: food.category || 'Food',
      barcode: food.barcode,
      created_at: new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.warn('Error saving custom food to Supabase:', err);
    return false;
  }
}

// --------------------------------------------------------------------------------
// Full Sync
// --------------------------------------------------------------------------------
export async function syncAllLocalDataToSupabase(
  profile: UserProfile,
  dayLogs: Record<string, DayLog>,
  weightEntries: WeightEntry[],
  customFoods: FoodItem[],
  userId?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  const targetId = userId || profile.id || await getActiveUserId();
  if (!targetId) {
    return { success: false, message: 'Faça login para sincronizar os dados com o Supabase.' };
  }

  try {
    // 1. Sync Profile
    await saveProfileToSupabase(profile, targetId);

    // 2. Sync Day Logs
    for (const log of Object.values(dayLogs)) {
      await saveDayLogToSupabase(log, targetId);
    }

    // 3. Sync Weight Entries
    for (const w of weightEntries) {
      await saveWeightEntryToSupabase(w, targetId);
    }

    // 4. Sync Custom Foods
    for (const f of customFoods) {
      await saveCustomFoodToSupabase(f, targetId);
    }

    return { success: true, message: 'Todos os dados locais foram sincronizados com o Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Erro na sincronização: ${err.message || err}` };
  }
}

// --------------------------------------------------------------------------------
// Workouts CRUD (Routines & Completed Workouts)
// --------------------------------------------------------------------------------
export async function loadWorkoutRoutinesFromSupabase(userId?: string): Promise<WorkoutRoutine[] | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('workout_routines')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error loading workout routines:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || '',
      category: row.category || 'custom',
      exercises: Array.isArray(row.exercises) ? row.exercises : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.warn('Error loading workout routines from Supabase:', err);
    return null;
  }
}

export async function saveWorkoutRoutineToSupabase(routine: WorkoutRoutine, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || routine.userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client.from('workout_routines').upsert({
      id: routine.id,
      user_id: targetId,
      title: routine.title,
      description: routine.description || '',
      category: routine.category || 'custom',
      exercises: routine.exercises || [],
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.warn('Error saving workout routine to Supabase:', err);
    return false;
  }
}

export async function deleteWorkoutRoutineFromSupabase(routineId: string, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', targetId);

    return !error;
  } catch (err) {
    console.warn('Error deleting workout routine from Supabase:', err);
    return false;
  }
}

export async function loadCompletedWorkoutsFromSupabase(userId?: string): Promise<CompletedWorkout[] | null> {
  const client = getSupabase();
  if (!client) return null;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return null;

  try {
    const { data, error } = await client
      .from('completed_workouts')
      .select('*')
      .eq('user_id', targetId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Error loading completed workouts:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      routineId: row.routine_id,
      title: row.title,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: Number(row.duration_minutes) || 0,
      totalVolumeKg: Number(row.total_volume_kg) || 0,
      totalSets: Number(row.total_sets) || 0,
      caloriesBurned: Number(row.calories_burned) || 0,
      exercises: Array.isArray(row.exercises) ? row.exercises : [],
      notes: row.notes || '',
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('Error loading completed workouts from Supabase:', err);
    return null;
  }
}

export async function saveCompletedWorkoutToSupabase(workout: CompletedWorkout, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || workout.userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client.from('completed_workouts').upsert({
      id: workout.id,
      user_id: targetId,
      routine_id: workout.routineId || null,
      title: workout.title,
      date: workout.date,
      start_time: workout.startTime,
      end_time: workout.endTime,
      duration_minutes: workout.durationMinutes,
      total_volume_kg: workout.totalVolumeKg,
      total_sets: workout.totalSets,
      calories_burned: workout.caloriesBurned,
      exercises: workout.exercises || [],
      notes: workout.notes || '',
      created_at: workout.createdAt || new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.warn('Error saving completed workout to Supabase:', err);
    return false;
  }
}

export async function deleteCompletedWorkoutFromSupabase(workoutId: string, userId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const targetId = userId || await getActiveUserId();
  if (!targetId) return false;

  try {
    const { error } = await client
      .from('completed_workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', targetId);

    return !error;
  } catch (err) {
    console.warn('Error deleting completed workout from Supabase:', err);
    return false;
  }
}

