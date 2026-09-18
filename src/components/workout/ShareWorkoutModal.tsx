import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { WorkoutRoutine } from '../../types/workout';
import { ExerciseThumbnail } from './ExerciseThumbnail';

interface ShareWorkoutModalProps {
  routine: WorkoutRoutine;
  onClose: () => void;
}

export function encodeRoutineForSharing(routine: WorkoutRoutine): string {
  const payload = {
    v: 1,
    title: routine.title,
    category: routine.category,
    description: routine.description || '',
    exercises: routine.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      category: e.category,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      restSeconds: e.restSeconds,
      sets: e.sets
    }))
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // Safe base64 encoding for unicode
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    console.error('Error encoding routine:', err);
    return '';
  }
}

export function decodeRoutineFromSharing(code: string): Partial<WorkoutRoutine> | null {
  try {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('NF-TREINO-')) {
      cleanCode = cleanCode.replace('NF-TREINO-', '');
    }
    const jsonStr = decodeURIComponent(atob(cleanCode));
    const data = JSON.parse(jsonStr);
    if (!data.title || !Array.isArray(data.exercises)) {
      return null;
    }
    return {
      title: data.title,
      category: data.category || 'custom',
      description: data.description || 'Ficha importada',
      exercises: data.exercises.map((e: any) => ({
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        category: e.category || 'chest',
        targetSets: e.targetSets || 3,
        targetReps: e.targetReps || '10',
        restSeconds: e.restSeconds || 90,
        sets: e.sets || []
      }))
    };
  } catch (err) {
    console.error('Error decoding routine:', err);
    return null;
  }
}

export const ShareWorkoutModal: React.FC<ShareWorkoutModalProps> = ({ routine, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const encoded = encodeRoutineForSharing(routine);
  const shareCode = `NF-TREINO-${encoded}`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?shared_workout=${encoded}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ficha de Treino Nutrifam: ${routine.title}`,
          text: `Confira minha ficha de treino "${routine.title}" no Nutrifam!`,
          url: shareUrl
        });
      } catch (err) {
        console.warn('Share dismissed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1E2623] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#188350]/10 dark:bg-[#25A168]/20 flex items-center justify-center text-[#188350] dark:text-[#25A168]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#18201D] dark:text-white">Compartilhar Treino</h2>
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Envie sua ficha para amigos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6F7C76] hover:text-black dark:text-[#A8B8B1] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workout Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18201D] border border-slate-200/70 dark:border-[#394842]/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#18201D] dark:text-white">{routine.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#188350]/10 text-[#188350] dark:bg-[#25A168]/20 dark:text-[#25A168]">
              {routine.category}
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {routine.exercises.map((e, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ExerciseThumbnail exerciseId={e.exerciseId} category={e.category} size="sm" />
                <span className="truncate flex-1 font-medium">{e.exerciseName}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {e.targetSets}x {e.targetReps}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          {/* Share Link */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Link Direto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#25302B] border border-slate-200 dark:border-[#394842] text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#188350] text-white hover:bg-[#12653E]'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Portable Code */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Código Portátil
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareCode}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#25302B] border border-slate-200 dark:border-[#394842] text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all"
              />
              <button
                onClick={handleCopyCode}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  copiedCode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-[#25302B] text-slate-800 dark:text-white hover:bg-slate-300'
                }`}
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNativeShare}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#188350] to-[#12653E] hover:from-[#157346] hover:to-[#0E5132] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#188350]/20 active:scale-[0.99] transition-all"
        >
          <Share2 className="w-4 h-4" />
          Enviar via WhatsApp / Redes
        </button>
      </div>
    </div>
  );
};
