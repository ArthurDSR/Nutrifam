import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Dumbbell, Search, ChevronRight, Check } from 'lucide-react';
import { WorkoutRoutine, RoutineExercise, MuscleCategory } from '../../types/workout';
import { EXERCISE_DATABASE, searchExercises } from '../../services/exerciseDatabase';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { useTheme } from '../../services/themeService';

interface RoutineEditorModalProps {
  isOpen: boolean;
  initialRoutine?: WorkoutRoutine | null;
  onClose: () => void;
  onSave: (routine: WorkoutRoutine) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  push: 'Push (Empurrar)',
  pull: 'Pull (Puxar)',
  legs: 'Legs (Pernas)',
  upper: 'Superior (Upper)',
  lower: 'Inferior (Lower)',
  fullbody: 'Full Body',
  custom: 'Personalizado'
};

const MUSCLE_CATEGORY_LABELS: Record<MuscleCategory, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abs: 'Abdômen',
  calves: 'Panturrilhas',
  cardio: 'Cardio'
};

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  isOpen,
  initialRoutine,
  onClose,
  onSave
}) => {
  const { activeColor } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkoutRoutine['category']>('custom');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);

  // Exercise Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<MuscleCategory | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (initialRoutine) {
        setTitle(initialRoutine.title || '');
        setDescription(initialRoutine.description || '');
        setCategory(initialRoutine.category || 'custom');
        setExercises(initialRoutine.exercises ? [...initialRoutine.exercises] : []);
      } else {
        setTitle('');
        setDescription('');
        setCategory('custom');
        setExercises([]);
      }
    }
  }, [isOpen, initialRoutine]);

  if (!isOpen) return null;

  const handleAddExerciseFromPicker = (ex: typeof EXERCISE_DATABASE[0]) => {
    const newRoutineEx: RoutineExercise = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      targetSets: 3,
      targetReps: '10-12',
      restSeconds: 60
    };
    setExercises((prev) => [...prev, newRoutineEx]);
    setIsPickerOpen(false);
  };

  const handleUpdateExercise = (index: number, updates: Partial<RoutineExercise>) => {
    setExercises((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, dê um nome para sua ficha de treino.');
      return;
    }

    if (exercises.length === 0) {
      alert('Adicione pelo menos um exercício na ficha de treino.');
      return;
    }

    const routine: WorkoutRoutine = {
      id: initialRoutine?.id || `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      exercises,
      createdAt: initialRoutine?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(routine);
    onClose();
  };

  const filteredPickerExercises = searchExercises(
    pickerSearch,
    pickerCategory ? (pickerCategory as MuscleCategory) : undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E2623] rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-[#18201D] dark:text-white">
              {initialRoutine ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6F7C76] dark:text-[#A8B8B1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 touch-pan-y">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
              Nome da Ficha *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino A - Peitoral e Tríceps"
              className="w-full px-4 py-2.5 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-semibold text-[#18201D] dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                Divisão / Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-semibold text-[#18201D] dark:text-white focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                Descrição / Notas
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Foco em hipertrofia e progressão"
                className="w-full px-4 py-2 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-semibold text-[#18201D] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Exercises List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                Exercícios ({exercises.length})
              </label>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 active:scale-95 transition-transform"
                style={{ backgroundColor: activeColor.primary }}
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Exercício
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl">
                <Dumbbell className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">
                  Nenhum exercício adicionado ainda.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="mt-2 text-xs font-bold text-emerald-500 hover:underline"
                >
                  Explorar catálogo de exercícios
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#34423C] text-[10px] font-bold flex items-center justify-center text-[#18201D] dark:text-white shrink-0">
                          {idx + 1}
                        </span>
                        <ExerciseThumbnail
                          exerciseId={item.exerciseId}
                          category={item.category}
                          name={item.exerciseName}
                          size="sm"
                          allowPreview={true}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#18201D] dark:text-white">
                            {item.exerciseName}
                          </h4>
                          <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] uppercase font-semibold">
                            {MUSCLE_CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
                      <div>
                        <label className="text-[10px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] block">
                          Séries
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.targetSets}
                          onChange={(e) =>
                            handleUpdateExercise(idx, {
                              targetSets: parseInt(e.target.value) || 1
                            })
                          }
                          className="w-full mt-0.5 px-2 py-1 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] block">
                          Reps
                        </label>
                        <input
                          type="text"
                          value={item.targetReps}
                          onChange={(e) =>
                            handleUpdateExercise(idx, { targetReps: e.target.value })
                          }
                          placeholder="8-12"
                          className="w-full mt-0.5 px-2 py-1 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] block truncate">
                          Descanso ({Math.floor((item.restSeconds || 60) / 60).toString().padStart(2, '0')}:{((item.restSeconds || 60) % 60).toString().padStart(2, '0')})
                        </label>
                        <select
                          value={item.restSeconds || 60}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              const input = prompt('Digite o tempo de descanso em minutos (ex: 6 ou 7.5) ou segundos (ex: 360):');
                              if (input) {
                                const val = parseFloat(input.replace(',', '.'));
                                if (!isNaN(val) && val > 0) {
                                  const totalSec = val <= 20 ? Math.round(val * 60) : Math.round(val);
                                  handleUpdateExercise(idx, { restSeconds: totalSec });
                                }
                              }
                            } else {
                              handleUpdateExercise(idx, {
                                restSeconds: parseInt(e.target.value) || 60
                              });
                            }
                          }}
                          className="w-full mt-0.5 px-2 py-1 bg-white dark:bg-[#1E2623] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-lg text-xs font-bold text-center"
                        >
                          <option value={30}>00:30 (30s)</option>
                          <option value={45}>00:45 (45s)</option>
                          <option value={60}>01:00 (1 min)</option>
                          <option value={75}>01:15 (1m15s)</option>
                          <option value={90}>01:30 (1m30s)</option>
                          <option value={105}>01:45 (1m45s)</option>
                          <option value={120}>02:00 (2 min)</option>
                          <option value={150}>02:30 (2m30s)</option>
                          <option value={180}>03:00 (3 min)</option>
                          <option value={210}>03:30 (3m30s)</option>
                          <option value={240}>04:00 (4 min)</option>
                          <option value={270}>04:30 (4m30s)</option>
                          <option value={300}>05:00 (5 min)</option>
                          {item.restSeconds && item.restSeconds > 300 && (
                            <option value={item.restSeconds}>
                              {Math.floor(item.restSeconds / 60).toString().padStart(2, '0')}:{((item.restSeconds) % 60).toString().padStart(2, '0')} (Personalizado)
                            </option>
                          )}
                          <option value="custom">+ Digitar outro tempo...</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-end gap-3 bg-[#F7F4EE]/50 dark:bg-[#18201D]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Check className="w-4 h-4" />
            Salvar Ficha
          </button>
        </div>
      </div>

      {/* Exercise Picker Sub-Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1E2623] rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18201D] dark:text-white">
                Selecionar Exercício
              </h3>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-1 rounded-full text-[#6F7C76] dark:text-[#A8B8B1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="p-4 border-b border-[#AEBDB5]/20 dark:border-[#394842] space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar exercício por nome ou músculo..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 touch-pan-x">
                <button
                  type="button"
                  onClick={() => setPickerCategory('')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    pickerCategory === ''
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#F7F4EE] dark:bg-[#232D29] text-[#6F7C76] dark:text-[#A8B8B1]'
                  }`}
                >
                  Todos
                </button>
                {Object.entries(MUSCLE_CATEGORY_LABELS).map(([catKey, label]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setPickerCategory(catKey as MuscleCategory)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                      pickerCategory === catKey
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#F7F4EE] dark:bg-[#232D29] text-[#6F7C76] dark:text-[#A8B8B1]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 touch-pan-y">
              {filteredPickerExercises.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddExerciseFromPicker(item)}
                  className="p-3 bg-[#F7F4EE] dark:bg-[#232D29] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl cursor-pointer flex items-center justify-between border border-[#AEBDB5]/20 dark:border-[#394842] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExerciseThumbnail
                      exerciseId={item.id}
                      category={item.category}
                      name={item.name}
                      size="md"
                      allowPreview={true}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#18201D] dark:text-white">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {MUSCLE_CATEGORY_LABELS[item.category]}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-500">
                          {item.targetMuscle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
