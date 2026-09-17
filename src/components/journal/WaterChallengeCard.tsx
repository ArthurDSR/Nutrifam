import React, { useState } from 'react';
import { MoreHorizontal, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaterLog } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface WaterChallengeCardProps {
  water: WaterLog;
  onUpdateWater: (updated: WaterLog) => void;
}

export const WaterChallengeCard: React.FC<WaterChallengeCardProps> = ({
  water,
  onUpdateWater
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const bottleVolumeLiters = 0.25; // 250 ml

  // Dynamic number of bottles based on target
  const totalBottles = Math.max(6, Math.ceil(Number((water.targetLiters / bottleVolumeLiters).toFixed(2))));
  const isComplete = (water.consumedLiters >= water.targetLiters && water.targetLiters > 0) || (water.cupsCount !== undefined && water.cupsCount >= totalBottles);
  const currentBottles = isComplete
    ? totalBottles
    : Math.min(totalBottles, Math.round(water.consumedLiters / bottleVolumeLiters));

  const handleToggleBottle = (index: number) => {
    let newBottles = currentBottles;
    if (index < currentBottles) {
      // If tapping the last filled bottle, remove it; if tapping an earlier one, set to that count
      if (index === currentBottles - 1) {
        newBottles = currentBottles - 1;
      } else {
        newBottles = index + 1;
      }
    } else {
      newBottles = index + 1;
    }

    // When all bottles are filled, guarantee consumed reaches at least the target
    let newConsumed = Number((newBottles * bottleVolumeLiters).toFixed(2));
    if (newBottles >= totalBottles) {
      newConsumed = Math.max(water.targetLiters, newConsumed);
    }

    onUpdateWater({
      ...water,
      consumedLiters: newConsumed,
      cupsCount: newBottles
    });

    if (newBottles >= totalBottles && currentBottles < totalBottles) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 }
        });
      } catch {}
    }
  };

  const handleReset = () => {
    onUpdateWater({
      ...water,
      consumedLiters: 0,
      cupsCount: 0
    });
    setShowOptions(false);
  };

  const handleComplete = () => {
    onUpdateWater({
      ...water,
      consumedLiters: Math.max(water.targetLiters, Number((totalBottles * bottleVolumeLiters).toFixed(2))),
      cupsCount: totalBottles
    });
    setShowOptions(false);
  };

  const progressPercent = isComplete
    ? 100
    : Math.min(99, Math.round((water.consumedLiters / (water.targetLiters || 1)) * 100));

  return (
    <div className="bg-white dark:bg-[#232D29] mx-4 my-2.5 rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] select-none relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">
            {t('water.title')}
          </h3>
          {progressPercent >= 100 && (
            <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {t('water.goal')}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] p-1 rounded-full hover:bg-[#F7F4EE] dark:hover:bg-[#18201D] transition-colors"
          aria-label="Opções de água"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Options dropdown */}
      {showOptions && (
        <div className="absolute right-5 top-12 z-20 bg-white dark:bg-[#232D29] rounded-2xl shadow-xl border border-[#AEBDB5]/30 dark:border-[#394842] p-2 text-xs text-[#3F4B46] dark:text-[#EDF2EF] min-w-[150px]">
          <button
            onClick={handleReset}
            className="w-full text-left px-3 py-2 hover:bg-[#F7F4EE] dark:hover:bg-[#18201D] rounded-xl text-rose-500 font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar garrafas</span>
          </button>
          <button
            onClick={handleComplete}
            className="w-full text-left px-3 py-2 hover:bg-[#F7F4EE] dark:hover:bg-[#18201D] rounded-xl font-semibold text-[#3F4B46] dark:text-[#EDF2EF] flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completar meta</span>
          </button>
        </div>
      )}

      {/* Sub-row: Goal and Current with progress bar */}
      <div className="mt-2 mb-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">Garrafinhas (250 ml)</span>
            <span className="text-[11px] font-medium text-[#6F7C76] dark:text-[#A8B8B1]">
              {t('water.target')}: {water.targetLiters.toString().replace('.', ',')} L ({totalBottles} {t('water.glasses')})
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-sky-600 dark:text-sky-400">
              {(isComplete ? Math.max(water.targetLiters, water.consumedLiters) : water.consumedLiters).toString().replace('.', ',')} L
            </span>
            <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-bold block">
              {currentBottles}/{totalBottles} bebidas ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Subtle progress track */}
        <div className="w-full h-1.5 bg-[#ECEFE7] dark:bg-[#18201D] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Water Bottles Row */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 pt-2">
        {Array.from({ length: totalBottles }).map((_, index) => {
          const isFilled = index < currentBottles;
          const bottleId = `bottle-${index}`;

          return (
            <button
              key={index}
              onClick={() => handleToggleBottle(index)}
              className="flex flex-col items-center py-1 px-0.5 bg-transparent border-0 outline-none transition-transform duration-200 relative group hover:scale-105 active:scale-90 cursor-pointer"
              title={`Garrafinha ${index + 1} (250 ml) - Clique para ${isFilled ? 'esvaziar' : 'encher'}`}
            >
              {/* Bottle Graphic */}
              <div className="w-7 h-14 relative flex items-center justify-center">
                <svg viewBox="0 0 32 64" className="w-full h-full drop-shadow-2xs">
                  <defs>
                    <linearGradient id={`liquidGrad-${bottleId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <clipPath id={`clip-${bottleId}`}>
                      {/* Realistic ergonomic water bottle silhouette */}
                      <path d="M11 9 C11 8, 21 8, 21 9 L21 13 C26 15, 29 19, 29 25 L29 55 C29 60, 26 62, 16 62 C6 62, 3 60, 3 55 L3 25 C3 19, 6 15, 11 13 Z" />
                    </clipPath>
                  </defs>

                  {/* Bottle Cap with Ridges */}
                  <rect
                    x="12"
                    y="2"
                    width="8"
                    height="6"
                    rx="1.5"
                    fill={isFilled ? "#0284c7" : isDark ? "#4B6B60" : "#94a3b8"}
                  />
                  <line x1="14.5" y1="3" x2="14.5" y2="7" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
                  <line x1="17.5" y1="3" x2="17.5" y2="7" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

                  {/* Bottle Outer Body Base */}
                  <path
                    d="M11 9 C11 8, 21 8, 21 9 L21 13 C26 15, 29 19, 29 25 L29 55 C29 60, 26 62, 16 62 C6 62, 3 60, 3 55 L3 25 C3 19, 6 15, 11 13 Z"
                    fill={isFilled ? "rgba(224, 242, 254, 0.4)" : isDark ? "rgba(46, 68, 61, 0.4)" : "rgba(248, 250, 252, 0.9)"}
                    stroke={isFilled ? "#0284c7" : isDark ? "#394842" : "#cbd5e1"}
                    strokeWidth="1.6"
                  />

                  {/* Fluid Level Container */}
                  <g clipPath={`url(#clip-${bottleId})`}>
                    <rect
                      x="0"
                      y={isFilled ? "14" : "64"}
                      width="32"
                      height="50"
                      fill={`url(#liquidGrad-${bottleId})`}
                      className="transition-all duration-500 ease-out"
                    />

                    {/* Bubbles when filled */}
                    {isFilled && (
                      <>
                        <circle cx="21" cy="35" r="1.4" fill="#ffffff" opacity="0.7" />
                        <circle cx="11" cy="46" r="1" fill="#ffffff" opacity="0.5" />
                      </>
                    )}
                  </g>

                  {/* Bottle Body Reflection Streak */}
                  <path
                    d="M6 24 L6 52"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity={isFilled ? "0.6" : "0.35"}
                  />

                  {/* Grip Rib Line */}
                  <line
                    x1="9"
                    y1="37"
                    x2="23"
                    y2="37"
                    stroke={isFilled ? "#0369a1" : isDark ? "#394842" : "#e2e8f0"}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                </svg>
              </div>

              {/* Volume text below bottle */}
              <span
                className={`text-[9px] font-extrabold mt-1 tracking-tight ${
                  isFilled ? 'text-sky-600 dark:text-sky-400 font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1]'
                }`}
              >
                250 ml
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
