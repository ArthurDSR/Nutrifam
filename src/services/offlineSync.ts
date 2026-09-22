import { DayLog, FoodItem, UserProfile, WeightEntry } from '../types';
import { WorkoutRoutine, CompletedWorkout } from '../types/workout';
import {
  getSupabase,
  saveProfileToSupabase,
  saveDayLogToSupabase,
  saveWeightEntryToSupabase,
  saveCustomFoodToSupabase,
  saveWorkoutRoutineToSupabase,
  deleteWorkoutRoutineFromSupabase,
  saveCompletedWorkoutToSupabase,
  deleteCompletedWorkoutFromSupabase
} from './supabaseClient';
import { getMfaStatus } from './mfaService';

type PendingChange =
  | { kind: 'profile'; value: UserProfile }
  | { kind: 'dayLog'; value: DayLog }
  | { kind: 'weight'; value: WeightEntry }
  | { kind: 'food'; value: FoodItem }
  | { kind: 'routine'; value: WorkoutRoutine }
  | { kind: 'routineDelete'; id: string }
  | { kind: 'completed'; value: CompletedWorkout }
  | { kind: 'completedDelete'; id: string };

const queueKey = (userId: string) => `nutrifam_sync_queue_${userId}`;
let flushingUserId: string | null = null;

function changeKey(change: PendingChange): string {
  switch (change.kind) {
    case 'profile': return 'profile';
    case 'dayLog': return `dayLog:${change.value.date}`;
    case 'weight': return `weight:${change.value.id}`;
    case 'food': return `food:${change.value.id}`;
    case 'routine': return `routine:${change.value.id}`;
    case 'routineDelete': return `routine:${change.id}`;
    case 'completed': return `completed:${change.value.id}`;
    case 'completedDelete': return `completed:${change.id}`;
  }
}

export function getPendingChanges(userId: string): PendingChange[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(queueKey(userId)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function queueChange(userId: string, change: PendingChange): void {
  if (!userId) return;
  const changes = getPendingChanges(userId).filter((pending) => changeKey(pending) !== changeKey(change));
  changes.push(change);
  localStorage.setItem(queueKey(userId), JSON.stringify(changes));
}

export function hasPendingChange(userId: string, key: string): boolean {
  return getPendingChanges(userId).some((change) => changeKey(change) === key);
}

export async function flushPendingChanges(userId: string): Promise<boolean> {
  if (flushingUserId) return false;
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;
  flushingUserId = userId;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || data.user?.id !== userId) return false;
    const mfa = await getMfaStatus();
    if (mfa.required) return false;
    for (const change of getPendingChanges(userId)) {
      let saved = false;
      switch (change.kind) {
        case 'profile': saved = await saveProfileToSupabase(change.value, userId); break;
        case 'dayLog': saved = await saveDayLogToSupabase(change.value, userId); break;
        case 'weight': saved = await saveWeightEntryToSupabase(change.value, userId); break;
        case 'food': saved = await saveCustomFoodToSupabase(change.value, userId); break;
        case 'routine': saved = await saveWorkoutRoutineToSupabase(change.value, userId); break;
        case 'routineDelete': saved = await deleteWorkoutRoutineFromSupabase(change.id, userId); break;
        case 'completed': saved = await saveCompletedWorkoutToSupabase(change.value, userId); break;
        case 'completedDelete': saved = await deleteCompletedWorkoutFromSupabase(change.id, userId); break;
      }
      if (!saved) return false;
      // Another edit may have replaced this operation while the request was in flight.
      const current = getPendingChanges(userId);
      const remaining = current.filter((pending) =>
        changeKey(pending) !== changeKey(change) || JSON.stringify(pending) !== JSON.stringify(change));
      localStorage.setItem(queueKey(userId), JSON.stringify(remaining));
    }
    return true;
  } catch (error) {
    console.warn('Sincronização pendente; tentaremos novamente:', error);
    return false;
  } finally {
    flushingUserId = null;
  }
}
