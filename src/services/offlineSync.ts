import { DayLog, FoodItem, UserProfile, WeightEntry } from '../types';
import { WorkoutRoutine, CompletedWorkout } from '../types/workout';
import {
  getSupabase,
  loadProfileFromSupabase,
  loadDayLogsFromSupabase,
  loadWeightEntriesFromSupabase,
  loadCustomFoodsFromSupabase,
  loadWorkoutRoutinesFromSupabase,
  loadCompletedWorkoutsFromSupabase,
  saveProfilePatchToSupabase,
  saveDayLogToSupabase,
  saveWeightEntryToSupabase,
  saveCustomFoodToSupabase,
  saveWorkoutRoutineToSupabase,
  deleteWorkoutRoutineFromSupabase,
  saveCompletedWorkoutToSupabase,
  deleteCompletedWorkoutFromSupabase
} from './supabaseClient';
import { getMfaStatus } from './mfaService';
import { planProfilePatch } from './profileConflict';

type PendingChange =
  // Kept only to recognize and quarantine queues written by older app versions.
  | { kind: 'profile'; value: UserProfile }
  | { kind: 'profilePatch'; values: Partial<UserProfile>; base: Partial<UserProfile> }
  | { kind: 'dayLog'; value: DayLog; base?: DayLog | null }
  | { kind: 'weight'; value: WeightEntry; base?: WeightEntry | null }
  | { kind: 'food'; value: FoodItem; base?: FoodItem | null }
  | { kind: 'routine'; value: WorkoutRoutine; base?: WorkoutRoutine | null }
  | { kind: 'routineDelete'; id: string; base?: WorkoutRoutine | null }
  | { kind: 'completed'; value: CompletedWorkout; base?: CompletedWorkout | null }
  | { kind: 'completedDelete'; id: string; base?: CompletedWorkout | null };

const queueKey = (userId: string) => `nutrifam_sync_queue_${userId}`;
let flushingUserId: string | null = null;

function changeKey(change: PendingChange): string {
  switch (change.kind) {
    case 'profile': return 'profile';
    case 'profilePatch': return 'profile';
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
  const current = getPendingChanges(userId);
  const previous = current.find((pending) => changeKey(pending) === changeKey(change));
  if (previous?.kind === 'profile') archiveConflict(userId, previous, 'Fila de perfil anterior à resolução de conflitos');
  const changes = current.filter((pending) => changeKey(pending) !== changeKey(change));
  if ((change.kind === 'routineDelete' && previous?.kind === 'routine' && previous.base === null)
    || (change.kind === 'completedDelete' && previous?.kind === 'completed' && previous.base === null)) {
    localStorage.setItem(queueKey(userId), JSON.stringify(changes));
    return;
  }
  if (change.kind === 'profilePatch' && previous?.kind === 'profilePatch') {
    change = {
      kind: 'profilePatch',
      values: { ...previous.values, ...change.values },
      base: { ...change.base, ...previous.base }
    };
  } else if ('base' in change && previous && 'base' in previous && previous.base !== undefined) {
    change = { ...change, base: previous.base } as PendingChange;
  }
  changes.push(change);
  localStorage.setItem(queueKey(userId), JSON.stringify(changes));
}

export function hasPendingChange(userId: string, key: string): boolean {
  return getPendingChanges(userId).some((change) => changeKey(change) === key);
}

export function getSyncConflicts(userId: string): unknown[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(`nutrifam_sync_conflicts_${userId}`) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function getSyncConflictCount(userId: string): number {
  return getSyncConflicts(userId).length;
}

function archiveConflict(userId: string, change: PendingChange, reason: string): void {
  const key = `nutrifam_sync_conflicts_${userId}`;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const conflicts = Array.isArray(existing) ? existing : [];
    conflicts.push({ change, reason, archivedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(conflicts));
  } catch (error) {
    throw new Error(`Não foi possível preservar uma alteração em conflito: ${String(error)}`);
  }
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
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
    const pending = getPendingChanges(userId);
    for (const change of pending) {
      let saved = false;
      let serverAfter: unknown = undefined;
      switch (change.kind) {
        case 'profile':
          archiveConflict(userId, change, 'Perfil antigo sem base de comparação');
          saved = true;
          break;
        case 'profilePatch': {
          const remote = await loadProfileFromSupabase(userId);
          if (!remote) return false;
          const { accepted, conflicting } = planProfilePatch(remote, change.values, change.base);
          if (Object.keys(accepted).length) {
            saved = await saveProfilePatchToSupabase(accepted, userId);
          } else saved = true;
          if (saved && Object.keys(conflicting).length) {
            archiveConflict(userId, { kind: 'profilePatch', values: conflicting, base: change.base }, 'Perfil alterado também no servidor');
          }
          if (saved) serverAfter = { ...remote, ...accepted };
          break;
        }
        case 'dayLog': {
          if (change.base === undefined) { archiveConflict(userId, change, 'Registro antigo sem base de comparação'); saved = true; break; }
          const logs = await loadDayLogsFromSupabase(userId);
          if (logs === null) return false;
          if (!sameValue(logs[change.value.date], change.base)) {
            archiveConflict(userId, change, 'Dia alterado também no servidor'); saved = true;
            serverAfter = logs[change.value.date] ?? null;
            break;
          }
          saved = await saveDayLogToSupabase(change.value, userId);
          if (saved) serverAfter = change.value;
          break;
        }
        case 'weight':
        case 'food':
        case 'routine':
        case 'completed': {
          if (change.base === undefined) { archiveConflict(userId, change, 'Registro antigo sem base de comparação'); saved = true; break; }
          const entries = change.kind === 'weight' ? await loadWeightEntriesFromSupabase(userId)
            : change.kind === 'food' ? await loadCustomFoodsFromSupabase(userId)
            : change.kind === 'routine' ? await loadWorkoutRoutinesFromSupabase(userId)
            : await loadCompletedWorkoutsFromSupabase(userId);
          if (entries === null) return false;
          const current = entries.find((entry) => entry.id === change.value.id);
          if (!sameValue(current, change.base)) {
            archiveConflict(userId, change, 'Registro alterado também no servidor'); saved = true;
            serverAfter = current ?? null;
            break;
          }
          saved = change.kind === 'weight' ? await saveWeightEntryToSupabase(change.value, userId)
            : change.kind === 'food' ? await saveCustomFoodToSupabase(change.value, userId)
            : change.kind === 'routine' ? await saveWorkoutRoutineToSupabase(change.value, userId)
            : await saveCompletedWorkoutToSupabase(change.value, userId);
          if (saved) serverAfter = change.value;
          break;
        }
        case 'routineDelete':
        case 'completedDelete': {
          if (change.base === undefined) { archiveConflict(userId, change, 'Exclusão antiga sem base de comparação'); saved = true; break; }
          const entries = change.kind === 'routineDelete'
            ? await loadWorkoutRoutinesFromSupabase(userId)
            : await loadCompletedWorkoutsFromSupabase(userId);
          if (entries === null) return false;
          const current = entries.find((entry) => entry.id === change.id);
          if (!sameValue(current, change.base)) {
            archiveConflict(userId, change, 'Registro alterado também no servidor'); saved = true;
            serverAfter = current ?? null;
            break;
          }
          saved = change.kind === 'routineDelete'
            ? await deleteWorkoutRoutineFromSupabase(change.id, userId)
            : await deleteCompletedWorkoutFromSupabase(change.id, userId);
          if (saved) serverAfter = null;
          break;
        }
      }
      if (!saved) return false;
      // Another edit may have replaced this operation while the request was in flight.
      const current = getPendingChanges(userId);
      const remaining = current.flatMap((queued) => {
        if (changeKey(queued) !== changeKey(change)) return [queued];
        if (JSON.stringify(queued) === JSON.stringify(change)) return [];
        if (serverAfter === undefined || !('base' in queued)) return [queued];
        if (queued.kind === 'profilePatch' && serverAfter && typeof serverAfter === 'object') {
          const base: Partial<UserProfile> = {};
          for (const field of Object.keys(queued.values) as (keyof UserProfile)[]) {
            Object.assign(base, { [field]: (serverAfter as UserProfile)[field] });
          }
          return [{ ...queued, base }];
        }
        return [{ ...queued, base: serverAfter } as PendingChange];
      });
      localStorage.setItem(queueKey(userId), JSON.stringify(remaining));
    }
    if (pending.length && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nutrifam:sync-complete', { detail: { userId } }));
    }
    return true;
  } catch (error) {
    console.warn('Sincronização pendente; tentaremos novamente:', error);
    return false;
  } finally {
    flushingUserId = null;
  }
}
