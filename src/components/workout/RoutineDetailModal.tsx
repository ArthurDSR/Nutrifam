import React, { useState } from 'react';
import { X, Play, Share2, Edit3, Timer, Check } from 'lucide-react';
import { WorkoutRoutine, SetType, RoutineExerciseSet } from '../../types/workout';
import { ExerciseThumbnail } from './ExerciseThumbnail';

interface RoutineDetailModalProps {
  routine: WorkoutRoutine;
  onClose: () => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onEditRoutine?: (routine: WorkoutRoutine) => void;
  onShareRoutine?: (routine: WorkoutRoutine) => void;
  onUpdateRoutine?: (routine: WorkoutRoutine) => Promise<void> | void;
  onSelectExercise?: (exerciseId: string, exerciseName: string) => void;
}

function formatMinutesSeconds(totalSeconds: number): string {
  const safeSec = Math.max(0, totalSeconds || 0);
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({
  routine,
  onClose,
  onStartWorkout,
  onEditRoutine,
  onShareRoutine,
  onUpdateRoutine,
  onSelectExercise
}) => {
  const [currentRoutine, setCurrentRoutine] = useState<WorkoutRoutine>(routine);
  const [editingRestExIndex, setEditingRestExIndex] = useState<number | null>(null);

  const handleToggleSetType = async (exIndex: number, setIndex: number) => {
    const updatedExercises = [...currentRoutine.exercises];
    const targetEx = { ...updatedExercises[exIndex] };
    const numSets = targetEx.sets?.length || targetEx.targetSets || 1;

    // ensure sets array exists
    const sets: RoutineExerciseSet[] = targetEx.sets && targetEx.sets.length > 0
      ? [...targetEx.sets]
      : Array.from({ length: numSets }, () => ({ type: 'normal', targetReps: targetEx.targetReps || '' }));

    const currentType = sets[setIndex]?.type || 'normal';
    const cycle: SetType[] = ['normal', 'warmup', 'failure', 'dropset'];
    const nextType = cycle[(cycle.indexOf(currentType) + 1) % cycle.length];

    sets[setIndex] = {
      ...sets[setIndex],
      type: nextType
    };

    targetEx.sets = sets;
    updatedExercises[exIndex] = targetEx;

    const newRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: updatedExercises,
      updatedAt: new Date().toISOString()
    };

    setCurrentRoutine(newRoutine);
    if (onUpdateRoutine) {
      await onUpdateRoutine(newRoutine);
    }
  };

  const handleUpdateRestSeconds = async (exIndex: number, deltaOrValue: number, isAbsolute = false) => {
    const updatedExercises = [...currentRoutine.exercises];
    const targetEx = { ...updatedExercises[exIndex] };
    const currentRest = targetEx.restSeconds || 90;
    const newRest = isAbsolute ? deltaOrValue : Math.max(15, Math.min(900, currentRest + deltaOrValue));

    targetEx.restSeconds = newRest;
    updatedExercises[exIndex] = targetEx;

    const newRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: updatedExercises,
      updatedAt: new Date().toISOString()
    };

    setCurrentRoutine(newRoutine);
    if (onUpdateRoutine) {
      await onUpdateRoutine(newRoutine);
    }
  };

  const renderSetBadge = (type: SetType | undefined, index: number) => {
    if (type === 'warmup') {
      return <span className="font-extrabold text-[#E59819] text-sm tracking-wide">W</span>;
    }
    if (type === 'failure') {
      return <span className="font-extrabold text-[#EB4D3D] text-sm tracking-wide">F</span>;
    }
    if (type === 'dropset') {
      return <span className="font-extrabold text-purple-600 text-sm tracking-wide">D</span>;
    }
    return <span className="font-bold text-[#6F7C76] dark:text-[#A8B8B1] text-sm">{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1E2623] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between gap-3 bg-white dark:bg-[#1E2623] sticky top-0 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#188350]/10 text-[#188350] dark:bg-[#25A168]/20 dark:text-[#25A168]">
                {currentRoutine.category.toUpperCase()}
              </span>
              <span className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                {currentRoutine.exercises.length} exercícios
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#18201D] dark:text-white truncate mt-1">
              {currentRoutine.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onShareRoutine && (
              <button
                onClick={() => onShareRoutine(currentRoutine)}
                className="p-2 rounded-xl text-[#6F7C76] hover:text-[#188350] hover:bg-[#188350]/10 dark:text-[#A8B8B1] dark:hover:text-[#25A168] transition-colors"
                title="Compartilhar Treino"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {onEditRoutine && (
              <button
                onClick={() => onEditRoutine(currentRoutine)}
                className="p-2 rounded-xl text-[#6F7C76] hover:text-[#188350] hover:bg-[#188350]/10 dark:text-[#A8B8B1] dark:hover:text-[#25A168] transition-colors"
                title="Editar Treino"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6F7C76] hover:text-black dark:text-[#A8B8B1] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#25302B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Routine Exercises List (Hevy Style) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 divide-y divide-[#AEBDB5]/15 dark:divide-[#394842]/50">
          {currentRoutine.exercises.map((ex, exIndex) => {
            const numSets = ex.sets?.length || ex.targetSets || 1;
            const setsList: RoutineExerciseSet[] = ex.sets && ex.sets.length > 0
              ? ex.sets
              : Array.from({ length: numSets }, () => ({
                  type: 'normal',
                  targetReps: ex.targetReps || '',
                  targetWeightKg: undefined
                }));

            const restSeconds = ex.restSeconds || 90;
            const isEditingRest = editingRestExIndex === exIndex;

            return (
              <div key={`${ex.exerciseId}-${exIndex}`} className={exIndex > 0 ? 'pt-4' : ''}>
                {/* Exercise Title Row with Thumbnail */}
                <div className="flex items-center gap-3 mb-2">
                  <ExerciseThumbnail
                    exerciseId={ex.exerciseId}
                    category={ex.category}
                    name={ex.exerciseName}
                    size="md"
                    allowPreview={true}
                  />
                  <div className="min-w-0 flex-1">
                    <button type="button" onClick={() => onSelectExercise?.(ex.exerciseId, ex.exerciseName)}
                      className="text-left w-full text-base sm:text-lg font-bold text-[#0080FF] hover:underline cursor-pointer truncate"
                      title="Ver evolução deste exercício">
                      {ex.exerciseName}
                    </button>
                  </div>
                </div>

                {/* Rest Timer row in blue with stopwatch icon (00:00 format) */}
                <div className="flex items-center justify-between text-xs mb-3 pl-1">
                  <div className="flex items-center gap-1.5 text-[#0080FF]">
                    <Timer className="w-4 h-4 text-[#0080FF]" />
                    <span className="font-semibold">
                      Rest Timer: <span className="font-mono font-bold">{formatMinutesSeconds(restSeconds)}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setEditingRestExIndex(isEditingRest ? null : exIndex)}
                    className="text-[11px] font-medium text-slate-500 hover:text-[#0080FF] dark:text-slate-400 dark:hover:text-[#0080FF] transition-colors underline"
                  >
                    {isEditingRest ? 'Concluir' : 'Alterar'}
                  </button>
                </div>

                {/* Rest timer quick editor popover if open */}
                {isEditingRest && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between gap-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateRestSeconds(exIndex, -15)}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1E2623] border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 active:scale-95 text-xs font-bold"
                      >
                        -15s
                      </button>
                      <button
                        onClick={() => handleUpdateRestSeconds(exIndex, 15)}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1E2623] border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 active:scale-95 text-xs font-bold"
                      >
                        +15s
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs overflow-x-auto max-w-[200px] sm:max-w-xs py-0.5 touch-pan-x">
                      {[30, 45, 60, 90, 120, 150, 180, 240, 300].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => handleUpdateRestSeconds(exIndex, sec, true)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-colors shrink-0 ${
                            restSeconds === sec
                              ? 'bg-[#0080FF] text-white shadow-xs'
                              : 'bg-white dark:bg-[#1E2623] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#394842]'
                          }`}
                        >
                          {formatMinutesSeconds(sec)}
                        </button>
                      ))}
                      {restSeconds > 300 && (
                        <span className="px-2 py-1 rounded-lg text-[11px] font-bold font-mono bg-[#0080FF] text-white shadow-xs shrink-0">
                          {formatMinutesSeconds(restSeconds)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setEditingRestExIndex(null)}
                      className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100/50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Table Header: SET | +KG | REPS */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#394842]/80">
                  <div className="grid grid-cols-3 text-center py-2 px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase bg-slate-100/70 dark:bg-[#18201D]">
                    <div>SET</div>
                    <div>+KG</div>
                    <div>REPS</div>
                  </div>

                  {/* Table Body: Alternating Rows */}
                  <div className="divide-y divide-slate-100 dark:divide-[#394842]/40">
                    {setsList.map((set, setIndex) => {
                      const isEven = setIndex % 2 === 0;
                      return (
                        <div
                          key={setIndex}
                          className={`grid grid-cols-3 items-center text-center py-2.5 px-3 transition-colors ${
                            isEven
                              ? 'bg-white dark:bg-[#1E2623]'
                              : 'bg-[#F4F6F9] dark:bg-[#18201D]/70'
                          }`}
                        >
                          {/* SET BADGE (Clickable to toggle Warmup / Failure / Dropset / Normal) */}
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSetType(exIndex, setIndex)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200/50 dark:hover:bg-[#25302B] transition-transform active:scale-95"
                              title="Clique para alternar: Normal, W (Warmup), F (Falha), D (Dropset)"
                            >
                              {renderSetBadge(set.type, setIndex)}
                            </button>
                          </div>

                          {/* +KG / KG */}
                          <div className="text-sm font-semibold text-[#18201D] dark:text-slate-200">
                            {set.targetWeightKg !== undefined ? set.targetWeightKg : '-'}
                          </div>

                          {/* REPS */}
                          <div className="text-sm font-semibold text-[#18201D] dark:text-slate-200">
                            {set.targetReps || ex.targetReps || '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {ex.notes && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2 pl-1">
                    Nota: {ex.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-[#AEBDB5]/20 dark:border-[#394842] bg-slate-50/80 dark:bg-[#18201D]/80 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              onStartWorkout(currentRoutine);
            }}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#188350] to-[#12653E] hover:from-[#157346] hover:to-[#0E5132] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#188350]/20 active:scale-[0.99] transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            Iniciar Treino
          </button>

          {onShareRoutine && (
            <button
              onClick={() => onShareRoutine(currentRoutine)}
              className="py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#18201D] dark:text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-[#25302B] active:scale-[0.99] transition-all"
            >
              <Share2 className="w-4 h-4 text-[#188350] dark:text-[#25A168]" />
              Compartilhar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
