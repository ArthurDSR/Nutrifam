import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, DayLog, WeightEntry, FoodItem } from '../types';

const STORAGE_URL_KEY = 'nutrifam_supabase_url';
const STORAGE_KEY_KEY = 'nutrifam_supabase_anon_key';
const LEGACY_STORAGE_URL_KEY = 'nutrimonitor_supabase_url';
const LEGACY_STORAGE_KEY_KEY = 'nutrimonitor_supabase_anon_key';

type NutriFamGlobal = typeof globalThis & {
  __nutrifamSupabaseClient?: SupabaseClient | null;
};

const globalCache = globalThis as NutriFamGlobal;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

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
