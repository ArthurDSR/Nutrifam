import React, { useState } from 'react';
import { Dumbbell, Eye, X } from 'lucide-react';
import { MuscleCategory } from '../../types/workout';
import { getExerciseGifUrl } from '../../services/exerciseDatabase';

interface ExerciseThumbnailProps {
  exerciseId: string;
  category?: MuscleCategory;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  allowPreview?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  chest: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
  back: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  legs: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
  shoulders: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  biceps: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
  triceps: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
  abs: { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
  calves: { bg: 'bg-lime-500/10 dark:bg-lime-500/20', text: 'text-lime-600 dark:text-lime-400' },
  cardio: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' }
};

export const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({
  exerciseId,
  category = 'chest',
  name = 'Exercício',
  className = '',
  size = 'md',
  allowPreview = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const gifUrl = getExerciseGifUrl(exerciseId);
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.chest;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl'
  }[size];

  return (
    <>
      <div
        onClick={(e) => {
          if (allowPreview && gifUrl) {
            e.stopPropagation();
            setIsPreviewOpen(true);
          }
        }}
        className={`relative shrink-0 overflow-hidden flex items-center justify-center border border-[#AEBDB5]/20 dark:border-[#394842] ${sizeClasses} ${colors.bg} ${
          allowPreview ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
        } ${className}`}
        title={allowPreview ? 'Clique para ver animação de execução' : name}
      >
        {!hasError && gifUrl ? (
          <img
            src={gifUrl}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
            loading="lazy"
          />
        ) : (
          <Dumbbell className={`w-1/2 h-1/2 ${colors.text}`} />
        )}

        {allowPreview && gifUrl && !hasError && (
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Full GIF Preview Modal */}
      {isPreviewOpen && gifUrl && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E2623] rounded-3xl p-5 max-w-sm w-full border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#18201D] dark:text-white">{name}</h3>
                <span className={`text-[10px] font-bold uppercase ${colors.text}`}>{category}</span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
              <img src={gifUrl} alt={name} className="w-full h-full object-contain" />
            </div>

            <button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#2B3732] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]"
            >
              Fechar Demonstração
            </button>
          </div>
        </div>
      )}
    </>
  );
};
