import React, { useState } from 'react';
import { Gem, Flame, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { UserProfile, DayLog } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface CalorieRingCardProps {
  profile: UserProfile;
  dayLog: DayLog;
  onOpenGemsInfo?: () => void;
  onOpenBurnedInfo?: () => void;
}

export const CalorieRingCard: React.FC<CalorieRingCardProps> = ({
  profile,
  dayLog,
  onOpenGemsInfo,
  onOpenBurnedInfo
}) => {
  const { t } = useTranslation();
  const { isDark, activeColor } = useTheme();
  const [showMacroDetails, setShowMacroDetails] = useState(false);

  const secondarySurface = {
    backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
    borderColor: isDark ? activeColor.darkBorder : activeColor.border,
    color: isDark ? activeColor.darkText : activeColor.textDark
  };
  const secondaryAccent = isDark ? activeColor.darkText : activeColor.primary;

  // Calculate totals
  const eatenCalories = Math.round(
    Object.values(dayLog.meals).reduce(
      (acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.calories * i.servingsCount, 0),
      0
    )
  );

  const eatenProtein = Number(
    Object.values(dayLog.meals)
      .reduce((acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.protein * i.servingsCount, 0), 0)
      .toFixed(1)
  );

  const eatenCarbs = Number(
    Object.values(dayLog.meals)
      .reduce((acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.carbs * i.servingsCount, 0), 0)
      .toFixed(1)
  );

  const eatenFat = Number(
    Object.values(dayLog.meals)
      .reduce((acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.fat * i.servingsCount, 0), 0)
      .toFixed(1)
  );

  const eatenFiber = Number(
    Object.values(dayLog.meals)
      .reduce((acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.fiber * i.servingsCount, 0), 0)
      .toFixed(1)
  );

  const burnedCalories = dayLog.activities.reduce((acc, a) => acc + a.caloriesBurned, 0);

  // Dynamic Visual Feedback Calculation based on Calorie Ingestion
  const targetCal = profile.dailyCaloriesTarget || 2000;
  const ratio = eatenCalories / (targetCal || 1);
  const isOver = ratio > 1.0;
  const isCritical = ratio > 1.5; // > 50% larger than target!

  // Remaining or Over calories
  const remainingOrOverCalories = isOver
    ? eatenCalories - targetCal
    : targetCal - eatenCalories;

  // Progressive fill: 0 to 100% of circle fills as calories are eaten
  const progressRatio = Math.min(1.0, Math.max(0, ratio));
  const circleRadius = 50;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Visual Progression adapted to Cozy Pastel & Secondary Color:
  // - ratio <= 1.0: Uses secondary pastel / brand primary (e.g. mint, lavender, peach...)
  // - 1.0 < ratio <= 1.5: Soft warm caramelo / âmbar
  // - ratio > 1.5: Soft red warning
  let ringStartColor = activeColor.primary;
  let ringStopColor = activeColor.pastel;
  let ringGlowColor = isDark ? 'rgba(0,0,0,0)' : 'rgba(148, 188, 174, 0.2)';

  if (isOver) {
    if (isCritical) {
      ringStartColor = '#ef4444';
      ringStopColor = '#dc2626';
      ringGlowColor = isDark ? 'rgba(0,0,0,0)' : 'rgba(239, 68, 68, 0.25)';
    } else {
      ringStartColor = '#D7A86E';
      ringStopColor = '#F6BD60';
      ringGlowColor = isDark ? 'rgba(0,0,0,0)' : 'rgba(215, 168, 110, 0.25)';
    }
  }

  const isGoalReached = !isOver && ratio >= 0.999 && remainingOrOverCalories === 0;

  const badgeText = isCritical
    ? t('journal.criticalOver')
    : isOver
    ? t('journal.over')
    : isGoalReached
    ? 'Meta Atingida! ✓'
    : t('journal.remaining');

  const centerNumberColor = isCritical
    ? 'text-rose-500 dark:text-rose-400'
    : isOver
    ? 'text-amber-600 dark:text-amber-400'
    : '';

  return (
    <div
      className="rounded-b-[38px] px-5 pt-4 pb-3 shadow-cozy border-b select-none transition-colors duration-200"
      style={{
        background: isDark
          ? `linear-gradient(180deg, ${activeColor.darkBg} 0%, #172621 100%)`
          : `linear-gradient(180deg, ${activeColor.pastel} 0%, ${activeColor.bgTintLight} 100%)`,
        borderBottomColor: isDark ? activeColor.darkBorder : activeColor.border
      }}
    >
      {/* Top 3 Columns: Eaten | Center Radial Meter | Burned */}
      <div className="flex items-center justify-between">
        {/* Left: Consumed & Gems */}
        <div className="flex flex-col items-center w-24">
          <button
            onClick={onOpenGemsInfo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 border"
            style={secondarySurface}
            title="Gemas do NutriFam"
          >
            <Gem className="w-3.5 h-3.5" style={{ color: secondaryAccent }} />
            <span>{profile.gems}</span>
          </button>

          <div className="mt-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Utensils className="w-3.5 h-3.5" style={{ color: secondaryAccent }} />
              <span className="text-xl font-black text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight leading-none">
                {eatenCalories}
              </span>
            </div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F4B46] dark:text-[#EDF2EF] mt-1">
              {t('journal.eaten')}
            </div>
          </div>
        </div>

        {/* Center: Metabolic Calorie Progress Ring wrapping the central pill */}
        <div className="relative flex items-center justify-center w-[126px] h-[126px] sm:w-[132px] sm:h-[132px] shrink-0 my-0.5">
          <svg className="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="calorieProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ringStartColor} />
                <stop offset="100%" stopColor={ringStopColor} />
              </linearGradient>
            </defs>

            {/* 1. Central Circle Disc with soft stroke */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill={isDark ? '#1A2823' : '#ffffff'}
              stroke={isDark ? '#394842' : '#ECEFE7'}
              strokeWidth="1.5"
            />

            {/* 2. Visible Ambient Track Ring */}
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke={isDark ? '#263B33' : '#E2E8F0'}
              strokeWidth="8.5"
              fill="none"
            />

            {/* 3. Dynamic Active Progress Ring filling the contour clockwise */}
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke="url(#calorieProgressGradient)"
              strokeWidth="8.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{
                filter: `drop-shadow(0 2px 6px ${ringGlowColor})`,
                transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease'
              }}
            />
          </svg>

          {/* Central Calorie Readout Pill directly inside the circle contour */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none p-1">
            <span
              className={`text-2xl font-black tracking-tight leading-none ${centerNumberColor}`}
              style={!isOver ? { color: secondaryAccent } : undefined}
            >
              {isOver ? `+${remainingOrOverCalories}` : remainingOrOverCalories}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
              kcal
            </span>
            <span
              className="text-[10px] font-extrabold px-3 py-0.5 rounded-full mt-1 border transition-colors shadow-2xs"
              style={
                isCritical
                  ? { backgroundColor: isDark ? '#451A1A' : '#FEE2E2', color: isDark ? '#FCA5A5' : '#991B1B', borderColor: isDark ? '#7F1D1D' : '#FCA5A5' }
                  : isOver
                  ? { backgroundColor: isDark ? '#3D2A14' : '#FEF3C7', color: isDark ? '#FDE68A' : '#92400E', borderColor: isDark ? '#78350F' : '#FDE68A' }
                  : {
                      backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
                      borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                      color: isDark ? activeColor.darkText : activeColor.textDark
                    }
              }
            >
              {badgeText}
            </span>
          </div>
        </div>

        {/* Right: Burned & Activity */}
        <div className="flex flex-col items-center w-24">
          <button
            onClick={onOpenBurnedInfo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 border"
            style={secondarySurface}
            title="Calorias Queimadas"
          >
            <Flame className="w-3.5 h-3.5" style={{ color: secondaryAccent, fill: secondaryAccent }} />
            <span>{burnedCalories}</span>
          </button>

          <div className="mt-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" style={{ color: secondaryAccent }} />
              <span className="text-xl font-black text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight leading-none">
                {burnedCalories}
              </span>
            </div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F4B46] dark:text-[#EDF2EF] mt-1">
              {t('journal.burned')}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Macro Cards Row - Matching media_1789660096557.png with airy pastel tones */}
      <div className="mt-4 pt-1.5 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
          {/* Protein */}
          <div className="rounded-2xl p-2.5 shadow-2xs border transition-colors" style={secondarySurface}>
            <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] mb-1">
              <span className="truncate">{t('journal.protein')}</span>
              <span className="shrink-0 ml-auto font-extrabold" style={{ color: secondaryAccent }}>{eatenProtein}g</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${activeColor.primary}24` }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (eatenProtein / (profile.targetMacros.proteinGrams || 1)) * 100)}%`,
                  backgroundColor: secondaryAccent
                }}
              />
            </div>
            {showMacroDetails && (
              <p className="text-[9px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium mt-1">
                Meta: {profile.targetMacros.proteinGrams}g
              </p>
            )}
          </div>

          {/* Carbs */}
          <div className="rounded-2xl p-2.5 shadow-2xs border transition-colors" style={secondarySurface}>
            <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] mb-1">
              <span className="truncate">{t('journal.carbs')}</span>
              <span className="shrink-0 ml-auto font-extrabold" style={{ color: secondaryAccent }}>{eatenCarbs}g</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${activeColor.primary}24` }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (eatenCarbs / (profile.targetMacros.carbsGrams || 1)) * 100)}%`,
                  backgroundColor: secondaryAccent
                }}
              />
            </div>
            {showMacroDetails && (
              <p className="text-[9px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium mt-1">
                Meta: {profile.targetMacros.carbsGrams}g
              </p>
            )}
          </div>

          {/* Fat */}
          <div className="rounded-2xl p-2.5 shadow-2xs border transition-colors" style={secondarySurface}>
            <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] mb-1">
              <span className="truncate">{t('journal.fat')}</span>
              <span className="shrink-0 ml-auto font-extrabold" style={{ color: secondaryAccent }}>{eatenFat}g</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${activeColor.primary}24` }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (eatenFat / (profile.targetMacros.fatGrams || 1)) * 100)}%`,
                  backgroundColor: secondaryAccent
                }}
              />
            </div>
            {showMacroDetails && (
              <p className="text-[9px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium mt-1">
                Meta: {profile.targetMacros.fatGrams}g
              </p>
            )}
          </div>

          {/* Fiber */}
          <div className="rounded-2xl p-2.5 shadow-2xs border transition-colors" style={secondarySurface}>
            <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] mb-1">
              <span className="truncate">{t('journal.fiber')}</span>
              <span className="shrink-0 ml-auto font-extrabold" style={{ color: secondaryAccent }}>{eatenFiber}g</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${activeColor.primary}24` }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (eatenFiber / (profile.targetMacros.fiberGrams || 1)) * 100)}%`,
                  backgroundColor: secondaryAccent
                }}
              />
            </div>
            {showMacroDetails && (
              <p className="text-[9px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium mt-1">
                Meta: {profile.targetMacros.fiberGrams}g
              </p>
            )}
          </div>
        </div>

        {/* Toggle Macro Targets Details */}
        <button
          onClick={() => setShowMacroDetails(!showMacroDetails)}
          className="w-full flex justify-center items-center pt-2 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] transition-colors gap-1 text-[11px] font-bold"
          aria-label="Detalhes de macronutrientes"
        >
          <span>{showMacroDetails ? t('journal.hideDetails') : t('journal.details')}</span>
          {showMacroDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
