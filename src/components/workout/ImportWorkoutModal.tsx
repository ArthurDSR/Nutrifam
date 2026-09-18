import React, { useState, useEffect } from 'react';
import { X, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WorkoutRoutine } from '../../types/workout';
import { decodeRoutineFromSharing } from './ShareWorkoutModal';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { saveWorkoutRoutine } from '../../services/workoutService';

interface ImportWorkoutModalProps {
  initialCode?: string;
  userId?: string;
  onClose: () => void;
  onImportSuccess: (routine: WorkoutRoutine) => void;
}

export const ImportWorkoutModal: React.FC<ImportWorkoutModalProps> = ({
  initialCode = '',
  userId,
  onClose,
  onImportSuccess
}) => {
  const [inputCode, setInputCode] = useState(initialCode);
  const [decodedRoutine, setDecodedRoutine] = useState<Partial<WorkoutRoutine> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleProcessCode = (raw: string) => {
    setError(null);
    if (!raw.trim()) {
      setDecodedRoutine(null);
      return;
    }

    let codeToDecode = raw.trim();
    // Check if input is a full URL with ?shared_workout=
    if (codeToDecode.includes('shared_workout=')) {
      try {
        const url = new URL(codeToDecode);
        codeToDecode = url.searchParams.get('shared_workout') || codeToDecode;
      } catch {
        const parts = codeToDecode.split('shared_workout=');
        if (parts.length > 1) {
          codeToDecode = parts[1].split('&')[0];
        }
      }
    }

    const decoded = decodeRoutineFromSharing(codeToDecode);
    if (decoded && decoded.title && decoded.exercises && decoded.exercises.length > 0) {
      setDecodedRoutine(decoded);
    } else {
      setDecodedRoutine(null);
      setError('Código de treino inválido ou corrompido.');
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleProcessCode(initialCode);
    }
  }, [initialCode]);

  const handleConfirmImport = async () => {
    if (!decodedRoutine || !decodedRoutine.title || !decodedRoutine.exercises) return;

    setIsSaving(true);
    setError(null);

    const routineId = `routine_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fullRoutine: WorkoutRoutine = {
      id: routineId,
      userId,
      title: decodedRoutine.title,
      category: decodedRoutine.category || 'custom',
      description: decodedRoutine.description || 'Ficha importada',
      exercises: decodedRoutine.exercises as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (userId) {
        await saveWorkoutRoutine(fullRoutine, userId);
      }
      onImportSuccess(fullRoutine);
      onClose();
    } catch (err: any) {
      console.error('Error importing routine:', err);
      // Still allow local import if network fails
      onImportSuccess(fullRoutine);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1E2623] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#188350]/10 dark:bg-[#25A168]/20 flex items-center justify-center text-[#188350] dark:text-[#25A168]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#18201D] dark:text-white">Importar Ficha</h2>
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Cole o link ou código recebido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6F7C76] hover:text-black dark:text-[#A8B8B1] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Código ou Link Compartilhado
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cole aqui NF-TREINO-... ou link"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                handleProcessCode(e.target.value);
              }}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#25302B] border border-slate-200 dark:border-[#394842] text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#188350]"
            />
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Decoded Routine Preview */}
        {decodedRoutine && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#188350]/10 text-[#188350] dark:bg-[#25A168]/20 dark:text-[#25A168]">
                  {decodedRoutine.category?.toUpperCase()}
                </span>
                <h3 className="text-sm font-black text-[#18201D] dark:text-white mt-1">
                  {decodedRoutine.title}
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {decodedRoutine.exercises?.length} exercícios
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 divide-y divide-emerald-200/40 dark:divide-emerald-900/30">
              {decodedRoutine.exercises?.map((e, idx) => (
                <div key={idx} className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-200">
                  <ExerciseThumbnail exerciseId={e.exerciseId} category={e.category} size="sm" />
                  <span className="truncate flex-1 font-medium">{e.exerciseName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {e.targetSets}x {e.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          disabled={!decodedRoutine || isSaving}
          onClick={handleConfirmImport}
          className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            decodedRoutine && !isSaving
              ? 'bg-gradient-to-r from-[#188350] to-[#12653E] hover:from-[#157346] hover:to-[#0E5132] text-white shadow-[#188350]/20 active:scale-[0.99]'
              : 'bg-slate-200 dark:bg-[#25302B] text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSaving ? (
            <span>Salvando na nuvem...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Adicionar aos Meus Treinos
            </>
          )}
        </button>
      </div>
    </div>
  );
};
