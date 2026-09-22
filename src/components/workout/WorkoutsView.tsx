import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Play,
  History,
  BookOpen,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flame,
  ChevronRight,
  Search,
  Share2,
  Download,
  X
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
  deleteCompletedWorkout,
  getCompletedWorkouts
} from '../../services/workoutService';
import { searchExercises, syncExercisesFromSupabase } from '../../services/exerciseDatabase';
import { WorkoutExecutionView } from './WorkoutExecutionView';
import { RoutineEditorModal } from './RoutineEditorModal';
import { RoutineDetailModal } from './RoutineDetailModal';
import { ShareWorkoutModal } from './ShareWorkoutModal';
import { ImportWorkoutModal } from './ImportWorkoutModal';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { ExerciseProgressChart } from './ExerciseProgressChart';
import { useTheme } from '../../services/themeService';

interface WorkoutsViewProps {
  profile: UserProfile;
  onWorkoutFinished: (workout: CompletedWorkout) => void;
  onWorkoutDeleted: (workout: CompletedWorkout) => void;
}

type WorkoutSubTab = 'routines' | 'history' | 'exercises';

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ profile, onWorkoutFinished, onWorkoutDeleted }) => {
  const { activeColor } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('routines');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);

  // Active workout execution session
  const [activeRoutineForWorkout, setActiveRoutineForWorkout] = useState<WorkoutRoutine | null>(null);
  const [isExecutingWorkout, setIsExecutingWorkout] = useState(false);

  // Routine editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

  // Routine detail modal (Hevy-style)
  const [selectedRoutineForDetail, setSelectedRoutineForDetail] = useState<WorkoutRoutine | null>(null);

  // Sharing & Importing modals
  const [sharingRoutine, setSharingRoutine] = useState<WorkoutRoutine | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInitialCode, setImportInitialCode] = useState('');

  // Exercise database catalog state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState<MuscleCategory | ''>('');
  const [viewingExerciseDetail, setViewingExerciseDetail] = useState<Exercise | null>(null);

  // Load data from Supabase
  const loadData = async () => {
    try {
      const [loadedRoutines, loadedHistory] = await Promise.all([
        getWorkoutRoutines(profile.id),
        getCompletedWorkouts(profile.id),
        syncExercisesFromSupabase()
      ]);
      if (loadedRoutines !== null) setRoutines(loadedRoutines);
      if (loadedHistory === null) {
        setHistoryError(profile.id ? 'Não foi possível carregar o histórico. Verifique a conexão e a configuração das tabelas de treino no Supabase.' : 'Entre na sua conta para guardar e consultar o histórico.');
      } else {
        setHistory(loadedHistory);
        setHistoryError(null);
      }
    } catch (err) {
      console.warn('Error loading workout data:', err);
      setHistoryError('Não foi possível carregar o histórico. Tente novamente.');
    }
  };

  useEffect(() => {
    loadData();

    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') void loadData();
    };
    document.addEventListener('visibilitychange', refreshOnReturn);

    // Check for shared workout in URL parameter (?shared_workout=...)
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const sharedCode = params.get('shared_workout');
      if (sharedCode) {
        setImportInitialCode(sharedCode);
        setIsImportModalOpen(true);
      }
    }
    return () => document.removeEventListener('visibilitychange', refreshOnReturn);
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
    setHistory((prev) => [completed, ...prev.filter((item) => item.id !== completed.id)]);
    setHistoryError(null);
    setExpandedWorkoutId(completed.id);

    onWorkoutFinished(completed);

    setActiveSubTab('history');
  };

  // Routine CRUD
  const handleSaveRoutine = async (routine: WorkoutRoutine): Promise<boolean> => {
    const saved = await saveWorkoutRoutine(routine, profile.id);
    if (saved) await loadData();
    return saved;
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (confirm('Tem certeza que deseja excluir esta ficha de treino?')) {
      setDeletingRoutineId(routineId);
      const deleted = await deleteWorkoutRoutine(routineId, profile.id);
      if (deleted) {
        setRoutines((prev) => prev.filter((routine) => routine.id !== routineId));
        if (selectedRoutineForDetail?.id === routineId) setSelectedRoutineForDetail(null);
      } else {
        alert('Não foi possível excluir a ficha. Verifique sua conexão e tente novamente.');
      }
      setDeletingRoutineId(null);
    }
  };

  const handleDeleteCompletedWorkout = async (workoutId: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino do histórico?')) return;

    setDeletingWorkoutId(workoutId);
    const deleted = await deleteCompletedWorkout(workoutId, profile.id);
    if (deleted) {
      setHistory((prev) => prev.filter((workout) => workout.id !== workoutId));
      const removedWorkout = history.find((workout) => workout.id === workoutId);
      if (removedWorkout) onWorkoutDeleted(removedWorkout);
    } else {
      alert('Não foi possível excluir o treino. Verifique sua conexão e tente novamente.');
    }
    setDeletingWorkoutId(null);
  };

  // If live workout is currently in progress, render execution view
  if (isExecutingWorkout) {
    return (
      <WorkoutExecutionView
        routine={activeRoutineForWorkout}
        profile={profile}
        history={history}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setImportInitialCode('');
                  setIsImportModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-[#25302B] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-300 active:scale-95 transition-transform"
                title="Importar ficha de treino compartilhada"
              >
                <Download className="w-3.5 h-3.5" /> Importar
              </button>
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
          </div>

          {routines.length === 0 && (
            <div className="bg-white dark:bg-[#1E2623] rounded-3xl p-8 border border-[#AEBDB5]/20 dark:border-[#394842] text-center">
              <Dumbbell className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                Nenhuma ficha de treino ainda.
              </p>
              <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1">
                Crie sua própria ficha ou importe uma compartilhada.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white dark:bg-[#1E2623] rounded-3xl p-5 border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs space-y-3"
              >
                <div
                  className="cursor-pointer group"
                  onClick={() => setSelectedRoutineForDetail(routine)}
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
                      <h3 className="text-sm font-black text-[#18201D] dark:text-white mt-1 group-hover:text-[#0080FF] transition-colors">
                        {routine.title}
                      </h3>
                      {routine.description && (
                        <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5 line-clamp-2">
                          {routine.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSharingRoutine(routine)}
                        className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                        title="Compartilhar Ficha"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
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
                        disabled={deletingRoutineId === routine.id}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-40"
                        title="Excluir Ficha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Exercises preview snippet */}
                  <div className="mt-3 p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl text-xs space-y-1.5">
                    {routine.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <ExerciseThumbnail exerciseId={ex.exerciseId} category={ex.category} size="sm" allowPreview={true} />
                        <span className="text-[#3F4B46] dark:text-[#EDF2EF] font-semibold truncate flex-1">
                          {ex.exerciseName}
                        </span>
                        <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-mono">
                          {ex.sets?.length || ex.targetSets} séries{ex.targetReps ? ` · ${ex.targetReps} reps` : ''}
                        </span>
                      </div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                        + mais {routine.exercises.length - 3} exercícios...
                      </div>
                    )}
                  </div>
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

          {historyError && (
            <div role="alert" className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
              <span>{historyError}</span><button onClick={loadData} className="font-bold underline">Tentar novamente</button>
            </div>
          )}

          {history.length === 0 && !historyError ? (
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
                <button type="button" onClick={() => setExpandedWorkoutId(item.id)} className="w-full flex items-center justify-between text-left group" aria-label={`Ver detalhes de ${item.title}`}>
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
                    <h3 className="text-sm font-black text-[#18201D] dark:text-white mt-0.5 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {item.caloriesBurned} kcal
                    </span>
                    <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">
                      Estimativa de calorias ativas
                    </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6F7C76]" />
                  </div>
                </button>

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

                <button type="button" onClick={() => setExpandedWorkoutId(item.id)} className="w-full py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 text-left">Ver detalhes e séries →</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CATÁLOGO DE EXERCÍCIOS */}
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
                className="bg-white dark:bg-[#1E2623] p-3 rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <ExerciseThumbnail
                    exerciseId={ex.id}
                    category={ex.category}
                    name={ex.name}
                    size="md"
                    allowPreview={true}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#18201D] dark:text-white truncate">
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                        {ex.category}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {ex.targetMuscle}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Editor Modal */}
      {history.find((item) => item.id === expandedWorkoutId) && (() => {
        const item = history.find((workout) => workout.id === expandedWorkoutId)!;
        return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={() => setExpandedWorkoutId(null)}>
          <div role="dialog" aria-modal="true" aria-label={`Detalhes de ${item.title}`} className="w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-white dark:bg-[#1E2623] rounded-3xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><div><span className="text-[11px] font-mono text-[#6F7C76] dark:text-[#A8B8B1]">{item.date} · {item.durationMinutes} min</span><h2 className="text-lg font-black text-[#18201D] dark:text-white">{item.title}</h2></div><button onClick={() => setExpandedWorkoutId(null)} aria-label="Fechar detalhes" className="p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#232D29]"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#232D29] text-center text-xs font-bold"><span>{item.totalVolumeKg} kg<br />volume</span><span>{item.totalSets}<br />séries</span><span>{item.caloriesBurned}<br />kcal</span></div>
            {item.exercises.map((ex, exIndex) => <section key={`${ex.exerciseId}-${exIndex}`} className="rounded-2xl bg-[#F7F4EE] dark:bg-[#232D29] p-3 space-y-2"><div className="flex items-center gap-2"><ExerciseThumbnail exerciseId={ex.exerciseId} category={ex.category} name={ex.exerciseName} size="sm" allowPreview={true} /><button type="button" onClick={() => setViewingExerciseDetail(searchExercises(ex.exerciseName).find((catalog) => catalog.id === ex.exerciseId) || { id: ex.exerciseId, name: ex.exerciseName, category: ex.category, equipment: 'other', targetMuscle: '', instructions: '' })} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 text-left">{ex.exerciseName}</button></div><div className="grid grid-cols-[3rem_1fr_1fr] text-[10px] uppercase font-bold text-[#6F7C76] dark:text-[#A8B8B1]"><span>Série</span><span>Carga</span><span>Reps</span></div>{ex.sets.map((set, setIndex) => <div key={setIndex} className="grid grid-cols-[3rem_1fr_1fr] py-1.5 border-t border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-mono text-[#18201D] dark:text-white"><span>{set.type === 'warmup' ? 'W' : set.type === 'failure' ? 'F' : set.type === 'dropset' ? 'D' : set.setNumber}</span><span>{set.weightKg} kg</span><span>{set.reps}</span></div>)}</section>)}
            {item.notes && <p className="text-xs text-[#3F4B46] dark:text-[#EDF2EF]">{item.notes}</p>}
            <button type="button" onClick={async () => { await handleDeleteCompletedWorkout(item.id); setExpandedWorkoutId(null); }} disabled={deletingWorkoutId === item.id} className="flex items-center gap-2 text-xs font-bold text-red-600 py-2"><Trash2 className="w-4 h-4" /> Excluir treino</button>
          </div>
        </div>;
      })()}
      <RoutineEditorModal
        isOpen={isEditorOpen}
        initialRoutine={editingRoutine}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveRoutine}
        onSelectExercise={(exerciseId, exerciseName) => {
          const catalog = searchExercises(exerciseName).find((exercise) => exercise.id === exerciseId);
          setViewingExerciseDetail(catalog || {
            id: exerciseId, name: exerciseName, category: 'chest', equipment: 'other', targetMuscle: '', instructions: ''
          });
        }}
      />

      {/* Routine Detail Modal (Hevy Style) */}
      {selectedRoutineForDetail && (
        <RoutineDetailModal
          routine={selectedRoutineForDetail}
          onClose={() => setSelectedRoutineForDetail(null)}
          onStartWorkout={(r) => {
            setSelectedRoutineForDetail(null);
            handleStartRoutineWorkout(r);
          }}
          onEditRoutine={(r) => {
            setSelectedRoutineForDetail(null);
            setEditingRoutine(r);
            setIsEditorOpen(true);
          }}
          onShareRoutine={(r) => {
            setSharingRoutine(r);
          }}
          onSelectExercise={(exerciseId, exerciseName) => {
            const catalog = searchExercises(exerciseName).find((exercise) => exercise.id === exerciseId);
            setViewingExerciseDetail(catalog || {
              id: exerciseId, name: exerciseName, category: 'chest', equipment: 'other', targetMuscle: '', instructions: ''
            });
          }}
          onUpdateRoutine={async (updated) => {
            if (await handleSaveRoutine(updated)) setSelectedRoutineForDetail(updated);
          }}
        />
      )}

      {/* Share Workout Modal */}
      {sharingRoutine && (
        <ShareWorkoutModal
          routine={sharingRoutine}
          onClose={() => setSharingRoutine(null)}
        />
      )}

      {/* Import Workout Modal */}
      {isImportModalOpen && (
        <ImportWorkoutModal
          initialCode={importInitialCode}
          userId={profile.id}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportInitialCode('');
          }}
          onImportSuccess={(newRoutine) => {
            setRoutines((prev) => [newRoutine, ...prev]);
            setSelectedRoutineForDetail(newRoutine);
          }}
        />
      )}

      {/* Exercise Detail Modal */}
      {viewingExerciseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E2623] rounded-3xl p-6 shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] space-y-4">
            <div className="flex items-center gap-3">
              <ExerciseThumbnail
                exerciseId={viewingExerciseDetail.id}
                category={viewingExerciseDetail.category}
                name={viewingExerciseDetail.name}
                size="lg"
                allowPreview={true}
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {viewingExerciseDetail.category} • {viewingExerciseDetail.equipment}
                </span>
                <h3 className="text-base font-black text-[#18201D] dark:text-white mt-0.5 truncate">
                  {viewingExerciseDetail.name}
                </h3>
                {viewingExerciseDetail.nameEn && (
                  <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] truncate">
                    {viewingExerciseDetail.nameEn}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase block mb-0.5">
                Músculo Alvo
              </span>
              <span className="text-xs font-bold text-[#18201D] dark:text-white">
                {viewingExerciseDetail.targetMuscle}
              </span>
            </div>

            {viewingExerciseDetail.secondaryMuscles && viewingExerciseDetail.secondaryMuscles.length > 0 && (
              <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
                <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase block mb-1.5">
                  Músculos Secundários
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingExerciseDetail.secondaryMuscles.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/20 dark:border-[#394842] rounded-lg text-[10px] font-bold text-[#3F4B46] dark:text-[#EDF2EF]"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase block mb-0.5">
                Como Executar Corretamente
              </span>
              <p className="text-xs text-[#3F4B46] dark:text-[#EDF2EF] leading-relaxed max-h-32 overflow-y-auto">
                {viewingExerciseDetail.instructions}
              </p>
            </div>

            {viewingExerciseDetail.tips && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-0.5">
                  Dica Biomecânica do Coach
                </span>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  {viewingExerciseDetail.tips}
                </p>
              </div>
            )}

            <div className="border-t border-[#AEBDB5]/20 dark:border-[#394842] pt-3">
              <h4 className="text-xs font-black text-[#18201D] dark:text-white mb-2">Sua evolução neste exercício</h4>
              <ExerciseProgressChart history={history} exerciseId={viewingExerciseDetail.id} />
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
