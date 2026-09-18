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
  saveCompletedWorkoutToSupabase
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

    if (bestWeight > 0) {
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
// Default Routine Templates (Ready to use out-of-the-box)
// ---------------------------------------------------------------------------
export const DEFAULT_WORKOUT_TEMPLATES: WorkoutRoutine[] = [
  {
    id: 'template_push',
    title: 'Treino A - Push (Peito, Ombros e Tríceps)',
    description: 'Foco em cadeia anterior superior e movimentos de empurrar.',
    category: 'push',
    exercises: [
      {
        exerciseId: 'chest_bench_press_barbell',
        exerciseName: 'Supino Reto com Barra',
        category: 'chest',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90,
        notes: 'Carga progressiva'
      },
      {
        exerciseId: 'chest_incline_bench_press_dumbbell',
        exerciseName: 'Supino Inclinado com Halteres',
        category: 'chest',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 75
      },
      {
        exerciseId: 'shoulders_dumbbell_shoulder_press',
        exerciseName: 'Desenvolvimento com Halteres',
        category: 'shoulders',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 75
      },
      {
        exerciseId: 'shoulders_lateral_raise_dumbbell',
        exerciseName: 'Elevação Lateral com Halteres',
        category: 'shoulders',
        targetSets: 4,
        targetReps: '12-15',
        restSeconds: 60
      },
      {
        exerciseId: 'triceps_rope_pushdown',
        exerciseName: 'Tríceps Corda na Polia',
        category: 'triceps',
        targetSets: 3,
        targetReps: '12-15',
        restSeconds: 60
      }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template_pull',
    title: 'Treino B - Pull (Costas, Bíceps e Trapézio)',
    description: 'Foco em dorsais, trapézio, deltoide posterior e bíceps.',
    category: 'pull',
    exercises: [
      {
        exerciseId: 'back_lat_pulldown_wide',
        exerciseName: 'Puxada Frontal Aberta (Pulldown)',
        category: 'back',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90
      },
      {
        exerciseId: 'back_barbell_bent_over_row',
        exerciseName: 'Remada Curvada com Barra',
        category: 'back',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90
      },
      {
        exerciseId: 'shoulders_face_pull',
        exerciseName: 'Face Pull na Polia',
        category: 'shoulders',
        targetSets: 3,
        targetReps: '12-15',
        restSeconds: 60
      },
      {
        exerciseId: 'biceps_barbell_curl',
        exerciseName: 'Rosca Direta com Barra',
        category: 'biceps',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 60
      },
      {
        exerciseId: 'biceps_hammer_curl',
        exerciseName: 'Rosca Martelo com Halteres',
        category: 'biceps',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 60
      }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template_legs',
    title: 'Treino C - Pernas & Core (Legs)',
    description: 'Foco completo em membros inferiores e abdômen.',
    category: 'legs',
    exercises: [
      {
        exerciseId: 'legs_barbell_squat',
        exerciseName: 'Agachamento Livre com Barra',
        category: 'legs',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 120
      },
      {
        exerciseId: 'legs_leg_press_45',
        exerciseName: 'Leg Press 45°',
        category: 'legs',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 90
      },
      {
        exerciseId: 'legs_romanian_deadlift',
        exerciseName: 'Stiff / Levantamento Romeno (RDL)',
        category: 'legs',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 90
      },
      {
        exerciseId: 'calves_standing_raise_machine',
        exerciseName: 'Panturrilha em Pé na Máquina',
        category: 'calves',
        targetSets: 4,
        targetReps: '15-20',
        restSeconds: 60
      },
      {
        exerciseId: 'abs_plank',
        exerciseName: 'Prancha Isométrica',
        category: 'abs',
        targetSets: 3,
        targetReps: '45s',
        restSeconds: 60
      }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

// ---------------------------------------------------------------------------
// Supabase Data Access Service
// ---------------------------------------------------------------------------
export async function getWorkoutRoutines(userId?: string): Promise<WorkoutRoutine[]> {
  const cloudRoutines = await loadWorkoutRoutinesFromSupabase(userId);
  if (cloudRoutines && cloudRoutines.length > 0) {
    return cloudRoutines;
  }
  // Return default templates if no custom routines saved yet
  return DEFAULT_WORKOUT_TEMPLATES;
}

export async function saveWorkoutRoutine(routine: WorkoutRoutine, userId?: string): Promise<boolean> {
  return await saveWorkoutRoutineToSupabase(routine, userId);
}

export async function deleteWorkoutRoutine(routineId: string, userId?: string): Promise<boolean> {
  return await deleteWorkoutRoutineFromSupabase(routineId, userId);
}

export async function getCompletedWorkouts(userId?: string): Promise<CompletedWorkout[]> {
  const cloudWorkouts = await loadCompletedWorkoutsFromSupabase(userId);
  return cloudWorkouts || [];
}

export async function finishAndSaveWorkout(
  session: ActiveWorkoutSession,
  profile: UserProfile,
  notes?: string
): Promise<CompletedWorkout> {
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

  const todayStr = new Date().toISOString().split('T')[0];

  const completedWorkout: CompletedWorkout = {
    id: `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: profile.id,
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
  await saveCompletedWorkoutToSupabase(completedWorkout, profile.id);

  return completedWorkout;
}
