import {
  WorkoutRoutine,
  CompletedWorkout,
  ActiveWorkoutSession,
  ExerciseProgressEntry,
  CompletedWorkoutExercise
} from '../types/workout';
import { UserProfile } from '../types';
import {
  loadWorkoutRoutinesFromSupabase,
  saveWorkoutRoutineToSupabase,
  deleteWorkoutRoutineFromSupabase,
  loadCompletedWorkoutsFromSupabase,
  saveCompletedWorkoutToSupabase,
  deleteCompletedWorkoutFromSupabase,
  getActiveUserId
} from './supabaseClient';

// ---------------------------------------------------------------------------
// Scientific Calorie Expenditure (Compendium of Physical Activities - Ainsworth et al.)
// ---------------------------------------------------------------------------
/**
 * Calculates scientific calories burned for a resistance training or cardio session.
 * Compendium of Physical Activities:
 * - Code 02054: Resistance training (squats, deadlifts, presses, vigorous): MET 6.0
 * - Code 02052: Resistance training (multiple exercises, moderate effort): MET 3.5 - 5.0
 *
 * Formula: Calories = MET * Weight(kg) * Duration(hours) * IntensityMultiplier
 */
export function calculateWorkoutCalories(
  durationMinutes: number,
  totalSets: number,
  totalVolumeKg: number,
  bodyWeightKg: number = 70
): number {
  if (durationMinutes <= 0) return 0;

  const durationHours = durationMinutes / 60;
  const safeWeight = bodyWeightKg > 30 ? bodyWeightKg : 70;

  // Calculate work density: sets per 10 minutes
  const setsPer10Min = totalSets / Math.max(1, durationMinutes / 10);

  // Baseline MET for weight lifting
  let met = 5.0; // Moderate resistance training
  if (setsPer10Min >= 3.5 || totalVolumeKg > 5000) {
    met = 6.0; // Vigorous resistance training
  } else if (setsPer10Min < 1.5) {
    met = 3.8; // Light/long rest periods
  }

  // Base expenditure
  const baseCalories = met * safeWeight * durationHours;

  // Volume bonus (approx. 0.005 kcal per kg lifted in total tonnage)
  const volumeBonus = totalVolumeKg * 0.005;

  const totalCalories = Math.round(baseCalories + volumeBonus);
  return Math.max(20, totalCalories);
}

// ---------------------------------------------------------------------------
// 1RM Calculation (Epley Formula)
// ---------------------------------------------------------------------------
/**
 * Epley formula for estimating 1 Rep Max: 1RM = Weight * (1 + Reps / 30)
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  const epley = weightKg * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
}

// ---------------------------------------------------------------------------
// Progression Analysis
// ---------------------------------------------------------------------------
export function computeExerciseProgression(
  exerciseId: string,
  history: CompletedWorkout[]
): ExerciseProgressEntry[] {
  const entries: ExerciseProgressEntry[] = [];

  // Sort chronologically ascending
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const workout of sorted) {
    const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exercise || !exercise.sets || exercise.sets.length === 0) continue;

    // Find best set in this workout session
    let best1RM = 0;
    let bestWeight = 0;
    let bestReps = 0;
    let volumeKg = 0;

    for (const set of exercise.sets) {
      const e1rm = estimate1RM(set.weightKg, set.reps);
      volumeKg += set.weightKg * set.reps;
      if (e1rm > best1RM) {
        best1RM = e1rm;
        bestWeight = set.weightKg;
        bestReps = set.reps;
      }
    }

    if (exercise.sets.length > 0) {
      entries.push({
        date: workout.date,
        weightKg: bestWeight,
        reps: bestReps,
        estimated1RM: best1RM,
        volumeKg
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Supabase Data Access Service
// ---------------------------------------------------------------------------
export async function getWorkoutRoutines(userId?: string): Promise<WorkoutRoutine[] | null> {
  // A failed fetch is distinct from a genuinely empty account.
  return loadWorkoutRoutinesFromSupabase(userId);
}

export async function saveWorkoutRoutine(routine: WorkoutRoutine, userId?: string): Promise<boolean> {
  return await saveWorkoutRoutineToSupabase(routine, userId);
}

export async function deleteWorkoutRoutine(routineId: string, userId?: string): Promise<boolean> {
  return await deleteWorkoutRoutineFromSupabase(routineId, userId);
}

export async function deleteCompletedWorkout(workoutId: string, userId?: string): Promise<boolean> {
  return await deleteCompletedWorkoutFromSupabase(workoutId, userId);
}

export async function getCompletedWorkouts(userId?: string): Promise<CompletedWorkout[] | null> {
  return loadCompletedWorkoutsFromSupabase(userId);
}

export async function finishAndSaveWorkout(
  session: ActiveWorkoutSession,
  profile: UserProfile,
  notes?: string
): Promise<CompletedWorkout> {
  const authenticatedUserId = await getActiveUserId();
  if (!authenticatedUserId || authenticatedUserId !== profile.id) {
    throw new Error('Entre na sua conta antes de finalizar para guardar o treino no histórico.');
  }

  const endTime = new Date().toISOString();
  const startTimeIso = new Date(session.startTime).toISOString();
  const durationMinutes = Math.max(1, Math.round((Date.now() - session.startTime) / 60000));

  let totalVolumeKg = 0;
  let totalSets = 0;

  const completedExercises: CompletedWorkoutExercise[] = session.exercises.map((ex) => {
    const completedSets = ex.sets.filter((s) => s.isCompleted);
    totalSets += completedSets.length;

    const setsData = completedSets.map((s) => {
      totalVolumeKg += (s.weightKg || 0) * (s.reps || 0);
      return {
        setNumber: s.setNumber,
        type: s.type || 'normal',
        weightKg: s.weightKg || 0,
        reps: s.reps || 0
      };
    });

    return {
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      category: ex.category,
      sets: setsData
    };
  });

  const caloriesBurned = calculateWorkoutCalories(
    durationMinutes,
    totalSets,
    totalVolumeKg,
    profile.currentWeightKg || 70
  );

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const completedWorkout: CompletedWorkout = {
    id: `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: authenticatedUserId,
    routineId: session.routineId,
    title: session.routineTitle || 'Treino do Dia',
    date: todayStr,
    startTime: startTimeIso,
    endTime,
    durationMinutes,
    totalVolumeKg: Math.round(totalVolumeKg),
    totalSets,
    caloriesBurned,
    exercises: completedExercises,
    notes: notes || '',
    createdAt: endTime
  };

  // Persist directly to Supabase cloud
  const saved = await saveCompletedWorkoutToSupabase(completedWorkout, authenticatedUserId);
  if (!saved) {
    throw new Error('Não foi possível salvar o treino no banco. Verifique a conexão e a configuração das tabelas de treino no Supabase.');
  }

  return completedWorkout;
}
