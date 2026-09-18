import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  Plus,
  Trash2,
  Dumbbell,
  Flame,
  Award,
  X,
  Search,
  Timer
} from 'lucide-react';
import {
  WorkoutRoutine,
  ActiveWorkoutSession,
  WorkoutSet,
  CompletedWorkout,
  SetType
} from '../../types/workout';
import { UserProfile } from '../../types';
import { EXERCISE_DATABASE, searchExercises } from '../../services/exerciseDatabase';
import { finishAndSaveWorkout } from '../../services/workoutService';
import { RestTimerModal } from './RestTimerModal';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { useTheme } from '../../services/themeService';

function formatMinutesSeconds(totalSeconds: number): string {
  const safeSec = Math.max(0, totalSeconds || 0);
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface WorkoutExecutionViewProps {
  routine?: WorkoutRoutine | null;
  profile: UserProfile;
  onFinish: (workout: CompletedWorkout) => void;
  onCancel: () => void;
}

export const WorkoutExecutionView: React.FC<WorkoutExecutionViewProps> = ({
  routine,
  profile,
  onFinish,
  onCancel
}) => {
  const { activeColor } = useTheme();

  // Initialize session state
  const [session, setSession] = useState<ActiveWorkoutSession>(() => {
    const startTime = Date.now();
    if (routine) {
      return {
        id: `session_${startTime}`,
        routineId: routine.id,
        routineTitle: routine.title,
        startTime,
        exercises: routine.exercises.map((re) => {
          const numSets = re.targetSets || (re.sets ? re.sets.length : 3);
          return {
            exerciseId: re.exerciseId,
            exerciseName: re.exerciseName,
            category: re.category,
            restSeconds: re.restSeconds || 60,
            sets: Array.from({ length: numSets }).map((_, idx) => {
              const preset = re.sets?.[idx];
              return {
                id: `set_${idx}_${Math.random().toString(36).substring(2, 5)}`,
                setNumber: idx + 1,
                type: preset?.type || 'normal',
                weightKg: preset?.targetWeightKg || 0,
                reps: preset?.targetReps ? parseInt(preset.targetReps) || 10 : 10,
                isCompleted: false
              };
            })
          };
        })
      };
    } else {
      return {
        id: `session_${startTime}`,
        routineTitle: 'Treino Livre',
        startTime,
        exercises: []
      };
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Rest timer modal state
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(60);
  const [restExerciseName, setRestExerciseName] = useState('');

  // Exercise Picker inside active workout
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Finish confirmation modal
  const [finishedWorkoutData, setFinishedWorkoutData] = useState<CompletedWorkout | null>(null);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - session.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle set completed
  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = session.exercises[exerciseIndex];
    const targetSet = exercise.sets[setIndex];
    const willBeCompleted = !targetSet.isCompleted;

    const updatedSets = exercise.sets.map((s, idx) => {
      if (idx === setIndex) {
        return {
          ...s,
          isCompleted: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined
        };
      }
      return s;
    });

    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) =>
        idx === exerciseIndex ? { ...ex, sets: updatedSets } : ex
      )
    }));

    // Trigger rest timer automatically when set is completed
    if (willBeCompleted) {
      setRestTimerSeconds(exercise.restSeconds || 60);
      setRestExerciseName(exercise.exerciseName);
      setIsRestTimerOpen(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
    }
  };

  const handleUpdateSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          const updatedSets = ex.sets.map((s, sIdx) =>
            sIdx === setIndex ? { ...s, [field]: Math.max(0, val) } : s
          );
          return { ...ex, sets: updatedSets };
        }
        return ex;
      })
    }));
  };

  const handleToggleSetType = (exerciseIndex: number, setIndex: number) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          const cycle: SetType[] = ['normal', 'warmup', 'failure', 'dropset'];
          const updatedSets = ex.sets.map((s, sIdx) => {
            if (sIdx === setIndex) {
              const cur = s.type || 'normal';
              const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
              return { ...s, type: next };
            }
            return s;
          });
          return { ...ex, sets: updatedSets };
        }
        return ex;
      })
    }));
  };

  const handleAdjustExerciseRest = (exerciseIndex: number, deltaOrVal: number, isAbsolute = false) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          const current = ex.restSeconds || 60;
          const next = isAbsolute ? deltaOrVal : Math.max(15, Math.min(900, current + deltaOrVal));
          return { ...ex, restSeconds: next };
        }
        return ex;
      })
    }));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          const nextSetNum = ex.sets.length + 1;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: WorkoutSet = {
            id: `set_${nextSetNum}_${Math.random().toString(36).substring(2, 5)}`,
            setNumber: nextSetNum,
            weightKg: lastSet ? lastSet.weightKg : 0,
            reps: lastSet ? lastSet.reps : 10,
            isCompleted: false
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    }));
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          const filtered = ex.sets.filter((_, sIdx) => sIdx !== setIndex);
          // Renumber sets
          const renumbered = filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
          return { ...ex, sets: renumbered };
        }
        return ex;
      })
    }));
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (confirm('Deseja remover este exercício do treino atual?')) {
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((_, idx) => idx !== exerciseIndex)
      }));
    }
  };

  const handleAddExerciseFromPicker = (ex: typeof EXERCISE_DATABASE[0]) => {
    setSession((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category,
          restSeconds: 60,
          sets: [
            {
              id: `set_1_${Math.random().toString(36).substring(2, 5)}`,
              setNumber: 1,
              weightKg: 0,
              reps: 10,
              isCompleted: false
            }
          ]
        }
      ]
    }));
    setIsExercisePickerOpen(false);
  };

  // Finish Workout
  const handleTriggerFinish = async () => {
    const completedSetsCount = session.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0
    );

    if (completedSetsCount === 0) {
      if (!confirm('Você não marcou nenhuma série como concluída. Deseja finalizar mesmo assim?')) {
        return;
      }
    }

    const workout = await finishAndSaveWorkout(session, profile, workoutNotes);
    setFinishedWorkoutData(workout);
  };

  const handleFinalAcknowledge = () => {
    if (finishedWorkoutData) {
      onFinish(finishedWorkoutData);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-[#F7F4EE] dark:bg-[#18201D] flex flex-col overflow-hidden animate-fade-in"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Top App Bar */}
      <header className="px-4 py-3 bg-white dark:bg-[#1E2623] border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs font-black text-[#18201D] dark:text-white truncate max-w-[180px]">
              {session.routineTitle}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <Clock className="w-3 h-3 animate-pulse" />
              {formatElapsed(elapsedSeconds)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Deseja cancelar o treino em andamento? O progresso não salvo será descartado.')) {
                onCancel();
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Descartar
          </button>
          <button
            onClick={handleTriggerFinish}
            className="px-4 py-1.5 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-transform flex items-center gap-1"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Check className="w-3.5 h-3.5" />
            Finalizar
          </button>
        </div>
      </header>

      {/* Main Exercises List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 touch-pan-y">
        {session.exercises.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#AEBDB5]/30 dark:border-[#394842] rounded-3xl">
            <Dumbbell className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
              Seu treino está vazio.
            </p>
            <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1 mb-4">
              Adicione exercícios para começar a registrar suas cargas e séries.
            </p>
            <button
              onClick={() => setIsExercisePickerOpen(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5"
              style={{ backgroundColor: activeColor.primary }}
            >
              <Plus className="w-4 h-4" /> Adicionar Exercício
            </button>
          </div>
        ) : (
          session.exercises.map((exercise, exIdx) => (
            <div
              key={exIdx}
              className="bg-white dark:bg-[#1E2623] rounded-3xl p-4 border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ExerciseThumbnail
                    exerciseId={exercise.exerciseId}
                    category={exercise.category}
                    name={exercise.exerciseName}
                    size="md"
                    allowPreview={true}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-black text-[#0080FF] dark:text-blue-400 truncate">
                      {exercise.exerciseName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Timer className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                      <span className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">Descanso:</span>
                      <select
                        value={exercise.restSeconds || 60}
                        onChange={(e) =>
                          handleAdjustExerciseRest(exIdx, parseInt(e.target.value) || 60, true)
                        }
                        className="bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] border border-blue-200 dark:border-blue-900/50 rounded-lg px-1 py-0.5 text-xs font-black font-mono focus:outline-none cursor-pointer"
                        title={`Tempo de descanso atual: ${formatMinutesSeconds(exercise.restSeconds || 60)} (até 5 min)`}
                      >
                        <option value={30}>00:30</option>
                        <option value={45}>00:45</option>
                        <option value={60}>01:00</option>
                        <option value={75}>01:15</option>
                        <option value={90}>01:30</option>
                        <option value={105}>01:45</option>
                        <option value={120}>02:00</option>
                        <option value={150}>02:30</option>
                        <option value={180}>03:00</option>
                        <option value={210}>03:30</option>
                        <option value={240}>04:00</option>
                        <option value={270}>04:30</option>
                        <option value={300}>05:00</option>
                        {exercise.restSeconds && exercise.restSeconds > 300 && (
                          <option value={exercise.restSeconds}>
                            {formatMinutesSeconds(exercise.restSeconds)} (Personalizado)
                          </option>
                        )}
                      </select>
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustExerciseRest(exIdx, -15)}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#25302B] hover:bg-slate-200 text-[10px] font-bold text-slate-600 dark:text-slate-300 active:scale-95"
                          title="Diminuir descanso em 15s"
                        >
                          -15s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustExerciseRest(exIdx, 15)}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#25302B] hover:bg-slate-200 text-[10px] font-bold text-slate-600 dark:text-slate-300 active:scale-95"
                          title="Aumentar descanso em 15s"
                        >
                          +15s
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Set Table */}
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase px-1">
                  <div className="col-span-2 text-center">Série</div>
                  <div className="col-span-4 text-center">Peso (kg)</div>
                  <div className="col-span-4 text-center">Reps</div>
                  <div className="col-span-2 text-center">OK</div>
                </div>

                {/* Set Rows */}
                {exercise.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-2xl transition-colors ${
                      set.isCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-[#F7F4EE] dark:bg-[#232D29] border border-transparent'
                    }`}
                  >
                    {/* Set Number / Type Badge */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSetType(exIdx, setIdx)}
                        className="w-7 h-7 rounded-xl bg-slate-200/80 dark:bg-[#34423C] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        title="Clique para alternar: Normal, W (Warmup), F (Falha), D (Dropset)"
                      >
                        {set.type === 'warmup' ? (
                          <span className="font-black text-[#E59819] text-xs">W</span>
                        ) : set.type === 'failure' ? (
                          <span className="font-black text-[#EB4D3D] text-xs">F</span>
                        ) : set.type === 'dropset' ? (
                          <span className="font-black text-purple-600 text-xs">D</span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-[#18201D] dark:text-white">
                            {set.setNumber}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.weightKg === 0 ? '' : set.weightKg}
                        onChange={(e) =>
                          handleUpdateSetValue(
                            exIdx,
                            setIdx,
                            'weightKg',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full py-1.5 px-2 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl text-xs font-black text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        value={set.reps === 0 ? '' : set.reps}
                        onChange={(e) =>
                          handleUpdateSetValue(
                            exIdx,
                            setIdx,
                            'reps',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="10"
                        className="w-full py-1.5 px-2 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl text-xs font-black text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Completed Checkmark Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSet(exIdx, setIdx)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
                          set.isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-[#34423C] text-slate-400 hover:text-slate-600 dark:hover:text-white'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <div className="mt-3 pt-2 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F4EE] dark:bg-[#232D29] hover:opacity-80 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Série
                </button>
                {exercise.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(exIdx, exercise.sets.length - 1)}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-semibold"
                  >
                    Remover última série
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Bottom Actions */}
        {session.exercises.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExercisePickerOpen(true)}
            className="w-full py-3 bg-white dark:bg-[#1E2623] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] border border-dashed border-[#AEBDB5]/40 dark:border-[#394842] rounded-3xl text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-500" /> Adicionar Outro Exercício
          </button>
        )}

        {/* Workout Notes */}
        <div className="bg-white dark:bg-[#1E2623] rounded-3xl p-4 border border-[#AEBDB5]/20 dark:border-[#394842]">
          <label className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
            Anotações do Treino (Sensações, RPE, ajuste de cargas)
          </label>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Supino subiu muito bem hoje com 70kg, descanso de 90s foi perfeito..."
            className="w-full p-2.5 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-medium focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isRestTimerOpen}
        initialSeconds={restTimerSeconds}
        exerciseName={restExerciseName}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {/* Exercise Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1E2623] rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">
                Adicionar Exercício ao Treino
              </h3>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1 rounded-full text-[#6F7C76] dark:text-[#A8B8B1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar exercício..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 touch-pan-y">
              {searchExercises(pickerSearch).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddExerciseFromPicker(item)}
                  className="p-2.5 bg-[#F7F4EE] dark:bg-[#232D29] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl cursor-pointer flex items-center justify-between gap-2.5 border border-[#AEBDB5]/20 dark:border-[#394842] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <ExerciseThumbnail
                      exerciseId={item.id}
                      category={item.category}
                      name={item.name}
                      size="sm"
                      allowPreview={true}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#18201D] dark:text-white truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
                        {item.targetMuscle}
                      </span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finished Workout Summary Modal */}
      {finishedWorkoutData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E2623] rounded-3xl p-6 shadow-2xl border border-emerald-500/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#18201D] dark:text-white">
                Treino Concluído com Sucesso!
              </h2>
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1">
                Excelente consistência! Seus dados foram salvos na nuvem.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                <div className="flex items-center justify-center text-emerald-500 mb-1">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-base font-black text-[#18201D] dark:text-white">
                  {finishedWorkoutData.caloriesBurned}
                </div>
                <div className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                  kcal gastas
                </div>
              </div>

              <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                <div className="flex items-center justify-center text-blue-500 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-base font-black text-[#18201D] dark:text-white">
                  {finishedWorkoutData.durationMinutes}m
                </div>
                <div className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                  duração
                </div>
              </div>

              <div className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                <div className="flex items-center justify-center text-amber-500 mb-1">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div className="text-base font-black text-[#18201D] dark:text-white">
                  {finishedWorkoutData.totalVolumeKg}
                </div>
                <div className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                  kg volume
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalAcknowledge}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: activeColor.primary }}
            >
              Ver Resumo & Histórico
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
