import { UserProfile, DayLog, WeightEntry, FoodItem } from '../types';
import { INITIAL_FOOD_DATABASE } from './foodDatabase';
import { getMealTargetsForCalories } from './nutritionCalculator';

const USER_PROFILE_KEY = 'nutrifam_user_profile';
const DAY_LOGS_KEY = 'nutrifam_day_logs';
const WEIGHT_ENTRIES_KEY = 'nutrifam_weight_entries';
const CUSTOM_FOODS_KEY = 'nutrifam_custom_foods';

// Read-only fallbacks keep existing installations compatible after the NutriFam rename.
const LEGACY_USER_PROFILE_KEY = 'nutrimonitor_user_profile';
const LEGACY_DAY_LOGS_KEY = 'nutrimonitor_day_logs';
const LEGACY_WEIGHT_ENTRIES_KEY = 'nutrimonitor_weight_entries';
const LEGACY_CUSTOM_FOODS_KEY = 'nutrimonitor_custom_foods';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Meu Perfil',
  avatarText: 'M',
  avatarUrl: '',
  goalType: 'Lose weight',
  heightCm: 0,
  startWeightKg: 0,
  currentWeightKg: 0,
  goalWeightKg: 0,
  dailyCaloriesTarget: 2000,
  targetMacros: {
    proteinGrams: 120,
    carbsGrams: 180,
    fatGrams: 50,
    fiberGrams: 28
  },
  gems: 0,
  burnedCalories: 0,
  appleHealthSynced: false,
  petLevel: 1,
  petXp: 0,
  petMood: 'happy',
  petName: '',
  inventory: ['cap_lilac'],
  equippedCap: 'cap_lilac',
  equippedGlasses: null,
  equippedClothes: null,
  showSplashAnimation: true,
  isOnboardingCompleted: false,
  aiProvider: 'openrouter',
  openrouterModel: 'openrouter/free',
  geminiModel: 'gemini-3.5-flash-lite',
  openaiModel: 'gpt-4o-mini'
};

export const DEFAULT_WEIGHT_ENTRIES: WeightEntry[] = [];

export function createEmptyDayLog(date: string, dailyCalories = 1800, targetWaterLiters = 2.0): DayLog {
  const targets = getMealTargetsForCalories(dailyCalories);

  return {
    date,
    meals: {
      breakfast: {
        type: 'breakfast',
        title: 'Breakfast',
        targetCalories: targets.breakfast,
        items: []
      },
      lunch: {
        type: 'lunch',
        title: 'Lunch',
        targetCalories: targets.lunch,
        items: []
      },
      dinner: {
        type: 'dinner',
        title: 'Dinner',
        targetCalories: targets.dinner,
        items: []
      },
      snacks: {
        type: 'snacks',
        title: 'Snacks',
        targetCalories: targets.snacks,
        items: []
      }
    },
    water: {
      targetLiters: targetWaterLiters,
      consumedLiters: 0,
      cupsCount: 0
    },
    fasting: {
      isActive: false,
      startTime: 0,
      targetHours: 16,
      elapsedSeconds: 0,
      stage: 'Não Iniciado',
      autoStartEnabled: false,
      scheduledStartTime: '20:00',
      scheduledEndTime: '12:00'
    },
    activities: [],
    claimedQuestIds: [],
    note: '',
    grade: 'A'
  };
}

export function getStoredProfile(userId?: string): UserProfile {
  try {
    const key = userId ? `${USER_PROFILE_KEY}_${userId}` : USER_PROFILE_KEY;
    const legacyKey = userId ? `${LEGACY_USER_PROFILE_KEY}_${userId}` : LEGACY_USER_PROFILE_KEY;
    const raw = localStorage.getItem(key)
      || localStorage.getItem(legacyKey)
      || (userId ? localStorage.getItem(USER_PROFILE_KEY) || localStorage.getItem(LEGACY_USER_PROFILE_KEY) : null);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isMockName = parsed.name === 'Arthur Davi';
      const isMockWeight = (parsed.startWeightKg === 65 && parsed.currentWeightKg === 65 && parsed.goalWeightKg === 60);
      const isCompleted = parsed.isOnboardingCompleted === true && !isMockWeight;

      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: isMockName ? 'Meu Perfil' : parsed.name,
        avatarText: isMockName ? 'M' : (parsed.avatarText || 'M'),
        gems: parsed.gems === 1620 ? 0 : (parsed.gems || 0),
        startWeightKg: isMockWeight ? 0 : (Number(parsed.startWeightKg) || 0),
        currentWeightKg: isMockWeight ? 0 : (Number(parsed.currentWeightKg) || 0),
        goalWeightKg: isMockWeight ? 0 : (Number(parsed.goalWeightKg) || 0),
        heightCm: (parsed.heightCm === 170 && isMockWeight) ? 0 : (Number(parsed.heightCm) || 0),
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        equippedCap: parsed.equippedCap !== undefined ? parsed.equippedCap : null,
        equippedGlasses: parsed.equippedGlasses !== undefined ? parsed.equippedGlasses : null,
        equippedClothes: parsed.equippedClothes !== undefined ? parsed.equippedClothes : null,
        petName: parsed.petName || '',
        showSplashAnimation: parsed.showSplashAnimation !== undefined ? parsed.showSplashAnimation : true,
        isOnboardingCompleted: isCompleted,
        geminiModel: (parsed.geminiModel && parsed.geminiModel !== 'gemini-1.5-flash')
          ? parsed.geminiModel
          : 'gemini-3.5-flash-lite',
        openrouterModel: (parsed.openrouterModel && parsed.openrouterModel !== 'meta-llama/llama-3.3-70b-instruct:free' && parsed.openrouterModel !== 'google/gemini-2.0-flash-exp:free')
          ? parsed.openrouterModel
          : 'openrouter/free'
      };
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    if (profile.id) {
      localStorage.setItem(`${USER_PROFILE_KEY}_${profile.id}`, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function getStoredWeightEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(WEIGHT_ENTRIES_KEY) || localStorage.getItem(LEGACY_WEIGHT_ENTRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading weights:', e);
  }
  return DEFAULT_WEIGHT_ENTRIES;
}

export function saveStoredWeightEntries(entries: WeightEntry[]): void {
  try {
    localStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving weights:', e);
  }
}

export function getStoredDayLogs(userId?: string): Record<string, DayLog> {
  const todayStr = getTodayDateString();
  try {
    const key = userId ? `${DAY_LOGS_KEY}_${userId}` : DAY_LOGS_KEY;
    const legacyKey = userId ? `${LEGACY_DAY_LOGS_KEY}_${userId}` : LEGACY_DAY_LOGS_KEY;
    const raw = localStorage.getItem(key)
      || localStorage.getItem(legacyKey)
      || (userId ? localStorage.getItem(DAY_LOGS_KEY) || localStorage.getItem(LEGACY_DAY_LOGS_KEY) : null);
    if (raw) {
      const parsed: Record<string, DayLog> = JSON.parse(raw);
      // Ensure past and future days never have an active ticking fasting session
      for (const [dateStr, log] of Object.entries(parsed)) {
        if (!log || !log.fasting) continue;
        if (dateStr < todayStr) {
          if (log.fasting.isActive) {
            log.fasting.isActive = false;
            log.fasting.stage = log.fasting.elapsedSeconds > 0 ? 'Jejum Concluído' : 'Inativo';
          }
        } else if (dateStr > todayStr) {
          log.fasting.isActive = false;
          log.fasting.elapsedSeconds = 0;
          log.fasting.stage = 'Não Iniciado';
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading day logs:', e);
  }

  return {
    [todayStr]: createEmptyDayLog(todayStr)
  };
}

export function saveStoredDayLogs(logs: Record<string, DayLog>, userId?: string): void {
  try {
    const key = userId ? `${DAY_LOGS_KEY}_${userId}` : DAY_LOGS_KEY;
    localStorage.setItem(key, JSON.stringify(logs));
    if (userId) {
      localStorage.setItem(DAY_LOGS_KEY, JSON.stringify(logs));
    }
  } catch (e) {
    console.error('Error saving day logs:', e);
  }
}

export function getStoredCustomFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_KEY) || localStorage.getItem(LEGACY_CUSTOM_FOODS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading custom foods:', e);
  }
  return INITIAL_FOOD_DATABASE;
}

export function saveStoredCustomFoods(foods: FoodItem[]): void {
  try {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
  } catch (e) {
    console.error('Error saving custom foods:', e);
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a midday Date object to safely avoid midnight/DST shifts.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

/**
 * Formats a Date object as YYYY-MM-DD using local time (never UTC to avoid date flips).
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely adds or subtracts days from a YYYY-MM-DD string without timezone or UTC offsets.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}
