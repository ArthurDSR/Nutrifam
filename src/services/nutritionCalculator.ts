import { DayLog } from '../types';

export interface NutritionAssessmentParams {
  gender?: 'male' | 'female';
  age?: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg?: number;
  goalType: 'Lose weight' | 'Maintain weight' | 'Gain muscle';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
  pace?: 'gentle' | 'standard' | 'fast';
}

export interface NutritionAssessmentResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetMacros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
  waterLiters: number;
  mealTargets: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };
}

/**
 * Standard Mifflin-St Jeor equation and FAO/WHO activity multipliers.
 * Single source of truth for all caloric & macro calculations.
 */
export function calculateNutrition(params: NutritionAssessmentParams): NutritionAssessmentResult {
  const gender = params.gender || 'male';
  const age = params.age || 25;
  const heightCm = params.heightCm > 0 ? params.heightCm : 170;
  const weightKg = params.currentWeightKg > 0 ? params.currentWeightKg : 70;
  const goalType = params.goalType || 'Lose weight';
  const activityLevel = params.activityLevel || 'moderate';
  const pace = params.pace || 'standard';

  // Mifflin-St Jeor BMR
  const bmr = Math.round(
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  );

  // FAO/WHO Activity Multipliers
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9
  };
  const tdee = Math.round(bmr * activityFactors[activityLevel]);

  // Deficit / Surplus based on goal and pace
  let targetCalories = tdee;
  if (goalType === 'Lose weight') {
    const deficit = pace === 'gentle' ? 300 : pace === 'standard' ? 500 : 700;
    targetCalories = Math.max(1200, tdee - deficit);
  } else if (goalType === 'Gain muscle') {
    const surplus = pace === 'gentle' ? 200 : pace === 'standard' ? 350 : 500;
    targetCalories = tdee + surplus;
  }

  // Macros:
  // Protein: 2.0g/kg body weight (4 kcal/g)
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCalories = proteinGrams * 4;

  // Fat: 27% of daily calories (9 kcal/g)
  const fatCalories = targetCalories * 0.27;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: remainder calories (4 kcal/g)
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(carbCalories / 4);

  // Fiber: 14g per 1000 kcal (min 25g)
  const fiberGrams = Math.max(25, Math.round((targetCalories / 1000) * 14));

  // Water: 35ml per kg + 500ml activity reserve
  const waterLiters = Number(((weightKg * 35 + 500) / 1000).toFixed(1));

  // Meal calorie allocation: Breakfast (30%), Lunch (35%), Dinner (25%), Snacks (10%)
  const mealTargets = getMealTargetsForCalories(targetCalories);

  return {
    bmr,
    tdee,
    targetCalories,
    targetMacros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams
    },
    waterLiters,
    mealTargets
  };
}

/**
 * Calculates meal calorie targets in sync with a daily calorie target:
 * Breakfast: 30%
 * Lunch: 35%
 * Dinner: 25%
 * Snacks: remainder (10%)
 */
export function getMealTargetsForCalories(dailyCalories: number) {
  const breakfast = Math.round(dailyCalories * 0.30);
  const lunch = Math.round(dailyCalories * 0.35);
  const dinner = Math.round(dailyCalories * 0.25);
  const snacks = Math.max(0, dailyCalories - breakfast - lunch - dinner);

  return { breakfast, lunch, dinner, snacks };
}

/**
 * Immutably syncs an existing DayLog's meal targetCalories to match a new daily calorie target.
 */
export function syncDayLogMealTargets(dayLog: DayLog, dailyCalories: number): DayLog {
  const targets = getMealTargetsForCalories(dailyCalories);

  return {
    ...dayLog,
    meals: {
      ...dayLog.meals,
      breakfast: {
        ...dayLog.meals.breakfast,
        targetCalories: targets.breakfast
      },
      lunch: {
        ...dayLog.meals.lunch,
        targetCalories: targets.lunch
      },
      dinner: {
        ...dayLog.meals.dinner,
        targetCalories: targets.dinner
      },
      snacks: {
        ...dayLog.meals.snacks,
        targetCalories: targets.snacks
      }
    }
  };
}
