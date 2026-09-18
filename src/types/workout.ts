export type MuscleCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'calves'
  | 'cardio';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  category: MuscleCategory;
  equipment: EquipmentType;
  targetMuscle: string;
  instructions: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  completedAt?: string;
  previousWeightKg?: number;
  previousReps?: number;
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  category: MuscleCategory;
  targetSets: number;
  targetReps: string; // Ex: "8-12" ou "10"
  restSeconds: number; // Ex: 60, 90, 120
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'fullbody' | 'custom';
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface CompletedWorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  category: MuscleCategory;
  sets: {
    setNumber: number;
    weightKg: number;
    reps: number;
  }[];
}

export interface CompletedWorkout {
  id: string;
  userId?: string;
  routineId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  caloriesBurned: number; // Cálculo MET Ainsworth
  exercises: CompletedWorkoutExercise[];
  notes?: string;
  createdAt: string;
}

export interface ActiveWorkoutSession {
  id: string;
  routineId?: string;
  routineTitle: string;
  startTime: number; // timestamp
  exercises: {
    exerciseId: string;
    exerciseName: string;
    category: MuscleCategory;
    restSeconds: number;
    sets: WorkoutSet[];
  }[];
}

export interface ExerciseProgressEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
  reps: number;
  estimated1RM: number; // Epley: weight * (1 + reps / 30)
  volumeKg: number;
}
