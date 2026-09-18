import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Play,
  History,
  TrendingUp,
  BookOpen,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flame,
  ChevronRight,
  Search
} from 'lucide-react';
import {
  WorkoutRoutine,
  CompletedWorkout,
  MuscleCategory,
  Exercise
} from '../../types/workout';
import { UserProfile } from '../../types';
import {
  getWorkoutRoutines,
  saveWorkoutRoutine,
  deleteWorkoutRoutine,
  getCompletedWorkouts
} from '../../services/workoutService';
import { searchExercises } from '../../services/exerciseDatabase';
import { WorkoutExecutionView } from './WorkoutExecutionView';
import { RoutineEditorModal } from './RoutineEditorModal';
import { ExerciseProgressChart } from './ExerciseProgressChart';
import { useTheme } from '../../services/themeService';

interface WorkoutsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

type WorkoutSubTab = 'routines' | 'history' | 'progress' | 'exercises';

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ profile, onUpdateProfile }) => {
  const { activeColor } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('routines');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);

  // Active workout execution session
  const [activeRoutineForWorkout, setActiveRoutineForWorkout] = useState<WorkoutRoutine | null>(null);
  const [isExecutingWorkout, setIsExecutingWorkout] = useState(false);

  // Routine editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

  // Exercise database catalog state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState<MuscleCategory | ''>('');
  const [viewingExerciseDetail, setViewingExerciseDetail] = useState<Exercise | null>(null);

  // Load data from Supabase
  const loadData = async () => {
    try {
      const [loadedRoutines, loadedHistory] = await Promise.all([
        getWorkoutRoutines(profile.id),
        getCompletedWorkouts(profile.id)
      ]);
      setRoutines(loadedRoutines);
      setHistory(loadedHistory);
    } catch (err) {
      console.warn('Error loading workout data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.id]);

  // Start workout session
  const handleStartRoutineWorkout = (routine: WorkoutRoutine) => {
    setActiveRoutineForWorkout(routine);
    setIsExecutingWorkout(true);
  };

  const handleStartQuickEmptyWorkout = () => {
    setActiveRoutineForWorkout(null);
    setIsExecutingWorkout(true);
  };

  // When workout finishes
  const handleWorkoutFinished = (completed: CompletedWorkout) => {
    setIsExecutingWorkout(false);
    setActiveRoutineForWorkout(null);
    setHistory((prev) => [completed, ...prev]);

    // Add burned calories to profile
    if (completed.caloriesBurned > 0) {
      const currentBurned = profile.burnedCalories || 0;
      onUpdateProfile({
        burnedCalories: currentBurned + completed.caloriesBurned
      });
    }

    setActiveSubTab('history');
  };

  // Routine CRUD
  const handleSaveRoutine = async (routine: WorkoutRoutine) => {
    await saveWorkoutRoutine(routine, profile.id);
    await loadData();
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (confirm('Tem certeza que deseja excluir esta ficha de treino?')) {
      await deleteWorkoutRoutine(routineId, profile.id);
      await loadData();
    }
  };

  // If live workout is currently in progress, render execution view
  if (isExecutingWorkout) {
    return (
      <WorkoutExecutionView
        routine={activeRoutineForWorkout}
        profile={profile}
        onFinish={handleWorkoutFinished}
        onCancel={() => {
          setIsExecutingWorkout(false);
          setActiveRoutineForWorkout(null);
        }}
      />
    );
  }

  const catalogExercises = searchExercises(
    exerciseSearch,
    selectedMuscleCategory ? (selectedMuscleCategory as MuscleCategory) : undefined
  );

  return (
    <div
      className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-24 overflow-y-auto touch-pan-y bg-[#F7F4EE] dark:bg-[#18201D] transition-colors"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1E2623] rounded-3xl p-5 border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Dumbbell className="w-4 h-4" />
              NutriFam Treinos
            </div>
            <h1 className="text-lg font-black text-[#18201D] dark:text-white mt-0.5">
              Fichas, Séries & Cargas
            </h1>
          </div>
          <button
            onClick={handleStartQuickEmptyWorkout}
            className="px-3.5 py-2 rounded-2xl text-xs font-black text-white shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Treino Livre
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex gap-1.5 bg-[#F7F4EE] dark:bg-[#232D29] p-1 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('routines')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'routines'
                ? 'bg-white dark:bg-[#1E2623] text-[#18201D] dark:text-white shadow-xs'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#18201D]'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Fichas
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-[#1E2623] text-[#18201D] dark:text-white shadow-xs'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#18201D]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico
          </button>
          <button
            onClick={() => setActiveSubTab('progress')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'progress'
                ? 'bg-white dark:bg-[#1E2623] text-[#18201D] dark:text-white shadow-xs'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#18201D]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Cargas
          </button>
          <button
            onClick={() => setActiveSubTab('exercises')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'exercises'
                ? 'bg-white dark:bg-[#1E2623] text-[#18201D] dark:text-white shadow-xs'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#18201D]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Catálogo
          </button>
        </div>
      </div>

      {/* TAB 1: MINHAS FICHAS (ROUTINES) */}
      {activeSubTab === 'routines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] uppercase tracking-wider">
              Minhas Fichas ({routines.length})
            </h2>
            <button
              onClick={() => {
                setEditingRoutine(null);
                setIsEditorOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/20 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Ficha
            </button>
          </div>

          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white dark:bg-[#1E2623] rounded-3xl p-5 border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {routine.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1]">
                        {routine.exercises.length} exercícios
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-[#18201D] dark:text-white mt-1">
                      {routine.title}
                    </h3>
                    {routine.description && (
                      <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5 line-clamp-2">
                        {routine.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRoutine(routine);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                      title="Editar Ficha"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Excluir Ficha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises preview snippet */}
                <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl text-xs space-y-1">
                  {routine.exercises.slice(0, 3).map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-[#3F4B46] dark:text-[#EDF2EF] font-semibold truncate max-w-[200px]">
                        • {ex.exerciseName}
                      </span>
                      <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-mono">
                        {ex.targetSets}×{ex.targetReps}
                      </span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                      + mais {routine.exercises.length - 3} exercícios...
                    </div>
                  )}
                </div>

                {/* Start Workout Button */}
                <button
                  onClick={() => handleStartRoutineWorkout(routine)}
                  className="w-full py-3 rounded-2xl text-xs font-black text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeColor.primary }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Iniciar Treino com Esta Ficha
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE TREINOS CONCLUÍDOS */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] uppercase tracking-wider">
            Treinos Realizados ({history.length})
          </h2>

          {history.length === 0 ? (
            <div className="bg-white dark:bg-[#1E2623] rounded-3xl p-8 border border-[#AEBDB5]/20 dark:border-[#394842] text-center">
              <History className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                Nenhum treino concluído ainda.
              </p>
              <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1 mb-4">
                Inicie uma ficha ou um treino livre para que seus resultados fiquem registrados na nuvem.
              </p>
              <button
                onClick={handleStartQuickEmptyWorkout}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5"
                style={{ backgroundColor: activeColor.primary }}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Iniciar Treino Agora
              </button>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1E2623] rounded-3xl p-4 border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#6F7C76] dark:text-[#A8B8B1] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.durationMinutes}m
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-[#18201D] dark:text-white mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {item.caloriesBurned} kcal
                    </span>
                    <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">
                      Gasto Científico (MET)
                    </span>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] block">
                      Volume Total
                    </span>
                    <span className="text-xs font-black text-[#18201D] dark:text-white font-mono">
                      {item.totalVolumeKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] block">
                      Séries Feitas
                    </span>
                    <span className="text-xs font-black text-[#18201D] dark:text-white font-mono">
                      {item.totalSets}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] block">
                      Exercícios
                    </span>
                    <span className="text-xs font-black text-[#18201D] dark:text-white font-mono">
                      {item.exercises.length}
                    </span>
                  </div>
                </div>

                {/* Exercises list in this completed workout */}
                <div className="space-y-1.5 pt-1">
                  {item.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-[#202924] flex items-center justify-between"
                    >
                      <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                        {ex.exerciseName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ex.sets.map((s) => `${s.weightKg}kg×${s.reps}`).join(' | ')}
                      </span>
                    </div>
                  ))}
                </div>

                {item.notes && (
                  <p className="text-[11px] italic text-[#6F7C76] dark:text-[#A8B8B1] border-l-2 border-emerald-500 pl-2">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PROGRESSÃO & CARGAS (1RM & EVOLUÇÃO) */}
      {activeSubTab === 'progress' && (
        <ExerciseProgressChart history={history} />
      )}

      {/* TAB 4: CATÁLOGO DE EXERCÍCIOS */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder="Pesquisar exercício por nome ou músculo..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 touch-pan-x">
            <button
              onClick={() => setSelectedMuscleCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedMuscleCategory === ''
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E2623] text-[#6F7C76] dark:text-[#A8B8B1] border border-[#AEBDB5]/20 dark:border-[#394842]'
              }`}
            >
              Todos
            </button>
            {(
              [
                ['chest', 'Peito'],
                ['back', 'Costas'],
                ['legs', 'Pernas'],
                ['shoulders', 'Ombros'],
                ['biceps', 'Bíceps'],
                ['triceps', 'Tríceps'],
                ['abs', 'Abdômen'],
                ['calves', 'Panturrilhas'],
                ['cardio', 'Cardio']
              ] as const
            ).map(([catKey, catLabel]) => (
              <button
                key={catKey}
                onClick={() => setSelectedMuscleCategory(catKey as MuscleCategory)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedMuscleCategory === catKey
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1E2623] text-[#6F7C76] dark:text-[#A8B8B1] border border-[#AEBDB5]/20 dark:border-[#394842]'
                }`}
              >
                {catLabel}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {catalogExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setViewingExerciseDetail(ex)}
                className="bg-white dark:bg-[#1E2623] p-3.5 rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between cursor-pointer hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#18201D] dark:text-white">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                      {ex.category}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500">
                      {ex.targetMuscle}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Editor Modal */}
      <RoutineEditorModal
        isOpen={isEditorOpen}
        initialRoutine={editingRoutine}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveRoutine}
      />

      {/* Exercise Detail Modal */}
      {viewingExerciseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E2623] rounded-3xl p-6 shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] space-y-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {viewingExerciseDetail.category} • {viewingExerciseDetail.equipment}
              </span>
              <h3 className="text-base font-black text-[#18201D] dark:text-white mt-1">
                {viewingExerciseDetail.name}
              </h3>
              {viewingExerciseDetail.nameEn && (
                <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                  {viewingExerciseDetail.nameEn}
                </p>
              )}
            </div>

            <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase block mb-0.5">
                Músculo Alvo
              </span>
              <span className="text-xs font-bold text-[#18201D] dark:text-white">
                {viewingExerciseDetail.targetMuscle}
              </span>
            </div>

            <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase block mb-0.5">
                Como Executar Corretamente
              </span>
              <p className="text-xs text-[#3F4B46] dark:text-[#EDF2EF] leading-relaxed">
                {viewingExerciseDetail.instructions}
              </p>
            </div>

            <button
              onClick={() => setViewingExerciseDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#2B3732] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
