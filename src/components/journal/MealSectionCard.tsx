import React from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Meal, MealType, LoggedFoodItem } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';
import { BreakfastIcon, LunchIcon, DinnerIcon, SnackIcon } from './MealSvgIcons';

interface MealSectionCardProps {
  meal: Meal;
  onAddFood: (mealType: MealType) => void;
  onOpenReview?: (mealType: MealType) => void;
  onRemoveItem: (mealType: MealType, loggedId: string) => void;
}

export const MealSectionCard: React.FC<MealSectionCardProps> = ({
  meal,
  onAddFood,
  onOpenReview,
  onRemoveItem
}) => {
  const { t } = useTranslation();
  const { activeColor, isDark } = useTheme();

  const eatenCalories = Math.round(
    meal.items.reduce((acc, item) => acc + item.calories * item.servingsCount, 0)
  );

  const getMealTitle = () => {
    switch (meal.type) {
      case 'breakfast':
        return t('meal.breakfast');
      case 'lunch':
        return t('meal.lunch');
      case 'dinner':
        return t('meal.dinner');
      case 'snacks':
        return t('meal.snacks');
      default:
        return meal.title;
    }
  };

  const renderMealIcon = () => {
    switch (meal.type) {
      case 'breakfast':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-amber-950/40 dark:to-orange-950/30 flex items-center justify-center p-1.5 relative shadow-2xs border border-amber-200/50 dark:border-amber-700/40 shrink-0">
            <BreakfastIcon className="w-full h-full" />
          </div>
        );
      case 'lunch':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-emerald-950/40 dark:to-teal-950/30 flex items-center justify-center p-1.5 relative shadow-2xs border border-emerald-200/50 dark:border-emerald-700/40 shrink-0">
            <LunchIcon className="w-full h-full" />
          </div>
        );
      case 'dinner':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/70 dark:from-sky-950/40 dark:to-indigo-950/30 flex items-center justify-center p-1.5 relative shadow-2xs border border-sky-200/50 dark:border-sky-700/40 shrink-0">
            <DinnerIcon className="w-full h-full" />
          </div>
        );
      case 'snacks':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/70 dark:from-purple-950/40 dark:to-pink-950/30 flex items-center justify-center p-1.5 relative shadow-2xs border border-purple-200/50 dark:border-purple-700/40 shrink-0">
            <SnackIcon className="w-full h-full" />
          </div>
        );
    }
  };

  const handleCardClick = () => {
    if (onOpenReview) {
      onOpenReview(meal.type);
    }
  };

  const progressPercent = Math.min(100, Math.round((eatenCalories / (meal.targetCalories || 1)) * 100));

  return (
    <div className="bg-white dark:bg-[#232D29] mx-4 my-2.5 rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] transition-all select-none">
      <div className="flex items-center justify-between">
        {/* Left: Tappable Meal Header Info (Opens Review Modal) */}
        <div
          onClick={handleCardClick}
          className="flex items-center gap-3.5 flex-1 cursor-pointer group pr-2"
          title={`Ver detalhes de ${getMealTitle()}`}
        >
          {renderMealIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base leading-tight group-hover:text-[#5B8273] dark:group-hover:text-emerald-300 transition-colors">
                {getMealTitle()}
              </h3>
              <ChevronRight className="w-4 h-4 text-[#AEBDB5] dark:text-[#A8B8B1] group-hover:text-[#3F4B46] dark:group-hover:text-[#EDF2EF] transition-colors" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold ${eatenCalories > 0 ? 'text-[#3F4B46] dark:text-[#EDF2EF]' : 'text-[#6F7C76] dark:text-[#A8B8B1]'}`}>
                {eatenCalories} <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">/ {meal.targetCalories} kcal</span>
              </span>
              <div className="w-16 h-1.5 bg-[#ECEFE7] dark:bg-[#18201D] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: activeColor.primary
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Round '+' button to quickly add food */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFood(meal.type);
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0 border shadow-2xs hover:opacity-90"
          style={{
            backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
            borderColor: isDark ? activeColor.darkBorder : activeColor.border,
            color: activeColor.primary
          }}
          aria-label={`Adicionar alimento a ${getMealTitle()}`}
          title={t('meal.addFood')}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Logged food items list if any */}
      {meal.items.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] space-y-1.5">
          {meal.items.map((item: LoggedFoodItem) => (
            <div
              key={item.loggedId}
              onClick={handleCardClick}
              className="py-2 px-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F7F4EE] dark:hover:bg-[#18201D]/60 rounded-xl transition-colors group"
            >
              <div className="flex-1 pr-2 min-w-0">
                <div className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.colorDot || activeColor.primary }}
                  />
                  <span className="truncate">{item.name}</span>
                  {item.servingsCount !== 1 && (
                    <span className="text-[10px] font-extrabold text-[#6F7C76] dark:text-[#A8B8B1] bg-[#ECEFE7] dark:bg-[#18201D] px-1.5 py-0.5 rounded-md">
                      ×{item.servingsCount}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] pl-3.5 mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-[#3F4B46] dark:text-[#EDF2EF]">
                    {Math.round(item.calories * item.servingsCount)} kcal
                  </span>
                  <span>•</span>
                  <span>{item.servingSize}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(meal.type, item.loggedId);
                }}
                className="text-[#AEBDB5] dark:text-[#A8B8B1] hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                title="Remover item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
