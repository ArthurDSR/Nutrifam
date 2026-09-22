import {
  WorkoutRoutine,
  CompletedWorkout,
  ActiveWorkoutSession,
  ExerciseProgressEntry,
  CompletedWorkoutExercise
} from '../types/workout';
import { UserProfile } from '../types';
import { getLocalAuthUser } from './authService';
import { estimateActiveCalories } from './activityCalories';
import { queueChange, flushPendingChanges, getPendingChanges } from './offlineSync';
import {
  loadWorkoutRoutinesFromSupabase,
  loadCompletedWorkoutsFromSupabase,
  getActiveUserId
} from './supabaseClient';

// ---------------------------------------------------------------------------
// Estimated active calories for resistance training
// ---------------------------------------------------------------------------
/**
 * Estimates active calories for a resistance-training session, including rest.
 * The 2024 Compendium assigns 3.5 MET to multiple resistance exercises;
 * 6 MET is reserved for vigorous lifting and cannot be inferred from tonnage.
 * Set density only adjusts the session average modestly. Tonnage is retained
 * for progress tracking, not added again as an unvalidated calorie bonus.
 */
export function calculateWorkoutCalories(
  durationMinutes: number,
  totalSets: number,
  _totalVolumeKg: number,
  bodyWeightKg: number = 70
): number {
  if (durationMinutes <= 0 || totalSets <= 0) return 0;
  const safeWeight = Number.isFinite(bodyWeightKg) && bodyWeightKg > 30 ? bodyWeightKg : 70;
  const setsPer10Min = totalSets * 10 / durationMinutes;
  const sessionMet = setsPer10Min < 1.5 ? 2.5 : setsPer10Min < 4 ? 3.5 : 4.5;
  return estimateActiveCalories(sessionMet, durationMinutes, safeWeight);
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
  if (!userId || !isVerifiedLocalUser(userId)) return null;
  const remote = navigator.onLine ? await loadWorkoutRoutinesFromSupabase(userId) : null;
  const routines = remote ?? readWorkoutCache<WorkoutRoutine>(userId, 'routines');
  for (const change of getPendingChanges(userId)) {
    if (change.kind === 'routine') upsertById(routines, change.value);
    if (change.kind === 'routineDelete') removeById(routines, change.id);
  }
  writeWorkoutCache(userId, 'routines', routines);
  return routines;
}

export async function saveWorkoutRoutine(routine: WorkoutRoutine, userId?: string): Promise<boolean> {
  const owner = userId || routine.userId;
  if (!owner || !isVerifiedLocalUser(owner)) return false;
  const routines = readWorkoutCache<WorkoutRoutine>(owner, 'routines');
  upsertById(routines, routine);
  writeWorkoutCache(owner, 'routines', routines);
  queueChange(owner, { kind: 'routine', value: routine });
  void flushPendingChanges(owner);
  return true;
}

export async function deleteWorkoutRoutine(routineId: string, userId?: string): Promise<boolean> {
  if (!userId || !isVerifiedLocalUser(userId)) return false;
  const routines = readWorkoutCache<WorkoutRoutine>(userId, 'routines');
  removeById(routines, routineId);
  writeWorkoutCache(userId, 'routines', routines);
  queueChange(userId, { kind: 'routineDelete', id: routineId });
  void flushPendingChanges(userId);
  return true;
}

export async function deleteCompletedWorkout(workoutId: string, userId?: string): Promise<boolean> {
  if (!userId || !isVerifiedLocalUser(userId)) return false;
  const workouts = readWorkoutCache<CompletedWorkout>(userId, 'completed');
  removeById(workouts, workoutId);
  writeWorkoutCache(userId, 'completed', workouts);
  queueChange(userId, { kind: 'completedDelete', id: workoutId });
  void flushPendingChanges(userId);
  return true;
}

export async function getCompletedWorkouts(userId?: string): Promise<CompletedWorkout[] | null> {
  if (!userId || !isVerifiedLocalUser(userId)) return null;
  const remote = navigator.onLine ? await loadCompletedWorkoutsFromSupabase(userId) : null;
  const workouts = remote ?? readWorkoutCache<CompletedWorkout>(userId, 'completed');
  for (const change of getPendingChanges(userId)) {
    if (change.kind === 'completed') upsertById(workouts, change.value);
    if (change.kind === 'completedDelete') removeById(workouts, change.id);
  }
  writeWorkoutCache(userId, 'completed', workouts);
  return workouts;
}

function isVerifiedLocalUser(userId: string): boolean {
  return getLocalAuthUser()?.id === userId && localStorage.getItem('nutrifam_verified_account_id') === userId;
}

function readWorkoutCache<T>(userId: string, kind: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(`nutrifam_${kind}_${userId}`) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function writeWorkoutCache<T>(userId: string, kind: string, values: T[]): void {
  localStorage.setItem(`nutrifam_${kind}_${userId}`, JSON.stringify(values));
}

function upsertById<T extends { id: string }>(items: T[], item: T): void {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) items[index] = item; else items.push(item);
}

function removeById<T extends { id: string }>(items: T[], id: string): void {
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) items.splice(index, 1);
}

export async function finishAndSaveWorkout(
  session: ActiveWorkoutSession,
  profile: UserProfile,
  notes?: string
): Promise<CompletedWorkout> {
  const authenticatedUserId = (navigator.onLine ? await getActiveUserId().catch(() => null) : null) || getLocalAuthUser()?.id;
  if (!authenticatedUserId || authenticatedUserId !== profile.id || !isVerifiedLocalUser(authenticatedUserId)) {
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

  const workouts = readWorkoutCache<CompletedWorkout>(authenticatedUserId, 'completed');
  upsertById(workouts, completedWorkout);
  writeWorkoutCache(authenticatedUserId, 'completed', workouts);
  queueChange(authenticatedUserId, { kind: 'completed', value: completedWorkout });
  void flushPendingChanges(authenticatedUserId);

  return completedWorkout;
}
