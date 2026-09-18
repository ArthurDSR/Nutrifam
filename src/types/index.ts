export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number; // kcal
  servingSize: string; // e.g. "100 g" or "1 serving (50 g)"
  servingGrams: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  category?: 'Food' | 'Recipe' | 'Meal';
  isFavorite?: boolean;
  colorDot?: string; // color dot indicator in search list
  barcode?: string;
  imageUrl?: string;
  novaGroup?: 1 | 2 | 3 | 4; // 1: In natura, 2: Culinário, 3: Processado, 4: Ultraprocessado
  processingGrade?: 'In Natura' | 'Minimamente Processado' | 'Processado' | 'Ultraprocessado';
  healthScore?: number; // 0 to 100
  preservativesCount?: number;
  additives?: string[];
  healthyAlternative?: string;
  servingUnitName?: string; // e.g. "scoop", "fatia", "colher de sopa", "unidade", "copo"
  isRecipe?: boolean;
  recipeYieldPortions?: number; // e.g. 4
  recipeIngredients?: {
    foodId: string;
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingUnitName?: string;
  }[];
}

export interface LoggedFoodItem extends FoodItem {
  loggedId: string;
  servingsCount: number; // multiplier e.g. 1.5
  loggedAt: string; // ISO string or time
}

export interface Meal {
  type: MealType;
  title: string;
  targetCalories: number;
  items: LoggedFoodItem[];
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  avatarText: string;
  avatarUrl?: string;
  goalType: 'Lose weight' | 'Maintain weight' | 'Gain muscle';
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  dailyCaloriesTarget: number;
  targetMacros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
  gems: number; // Diamond count, e.g. 1620
  burnedCalories: number;
  appleHealthSynced: boolean;
  aiProvider?: 'gemini' | 'openai' | 'openrouter';
  geminiApiKey?: string;
  geminiModel?: string; // 'gemini-3.5-flash-lite' | 'gemini-3.5-flash' | 'gemini-2.5-flash'
  openaiApiKey?: string;
  openaiModel?: string; // 'gpt-4o-mini' | 'gpt-4o'
  openrouterApiKey?: string;
  openrouterModel?: string; // e.g. 'openrouter/free'
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
  weeklyPaceKg?: number;
  petName?: string;
  petLevel?: number;
  petXp?: number;
  petMood?: 'happy' | 'sleepy' | 'hungry' | 'love';
  inventory?: string[];
  equippedCap?: string | null;
  equippedGlasses?: string | null;
  equippedClothes?: string | null;
  showSplashAnimation?: boolean;
  isTwoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  isEmailVerified?: boolean;
  language?: 'pt' | 'en' | 'es';
  healthProvider?: 'apple_health' | 'google_fit' | 'health_connect' | 'none';
  healthSyncEnabled?: boolean;
  lastHealthSync?: string;
  isOnboardingCompleted?: boolean;
  pace?: 'gentle' | 'standard' | 'fast';
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface WaterLog {
  targetLiters: number;
  consumedLiters: number;
  cupsCount: number; // each cup is 0.25L
}

export interface FastingSession {
  isActive: boolean;
  startTime: number; // timestamp ms
  targetHours: number; // usually 16h
  elapsedSeconds: number;
  stage: string; // "Blood sugar level stabilizing", etc.
  scheduledStartTime?: string; // e.g. "20:00"
  scheduledEndTime?: string; // e.g. "12:00"
  autoStartEnabled?: boolean;
  isManuallyPaused?: boolean;
  isManuallyStopped?: boolean;
  planName?: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  caloriesBurned: number;
  durationMinutes: number;
  timestamp: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: Record<MealType, Meal>;
  water: WaterLog;
  fasting: FastingSession;
  activities: ActivityEntry[];
  note: string;
  grade: 'A' | 'B' | 'C' | 'D';
  claimedQuestIds?: string[];
}

export interface ProductEvaluation {
  barcode: string;
  name: string;
  brand: string;
  portion: string;
  overallScore: number; // 0 - 100, e.g. 65
  scoreColor: 'green' | 'yellow' | 'orange' | 'red';
  imageUrl: string;
  processing: {
    score: number; // 0 to 100 (100 = menos processado)
    label: string; // e.g. "Alimento minimamente processado (NOVA 1)"
    novaGroup: number; // 1, 2, 3, 4
  };
  nutrients: {
    score: number; // 0 to 100 (100 = mais equilibrado)
    label: string; // e.g. "Bom teor de fibras e proteínas, mas alto em calorias"
    calories: number;
    fat: number;
    saturatedFat: number;
    sugar: number;
    salt: number;
    protein: number;
    fiber: number;
  };
  additives: {
    score: number; // 0 to 100 (100 = menos risco)
    label: string; // e.g. "Nenhum aditivo de risco detectado"
    count: number;
    items: string[];
  };
  ingredients: string[];
  alternatives?: {
    name: string;
    brand: string;
    score: number;
    calories: number;
  }[];
}

export type ActiveTab = 'coach' | 'workouts' | 'journal' | 'foodbud' | 'profile' | 'quests';
export type AddFoodSubTab = 'barcode' | 'search' | 'photo' | 'quick_add' | 'my_foods';
export type ProfileSubTab = 'weight' | 'nutrition' | 'strength';
export type WeightFilter = '1 day' | '7 days' | '1 month' | '6 months' | 'All';
export type NutritionFilter = '7 days' | '30 days' | '90 days';

export * from './workout';
