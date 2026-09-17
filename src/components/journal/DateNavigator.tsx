import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw, AlertTriangle } from 'lucide-react';
import { getTodayDateString, addDaysToDateString, parseDateString } from '../../services/storage';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface DateNavigatorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  onResetDay?: () => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onDateChange,
  onResetDay
}) => {
  const { t, language } = useTranslation();
  const { isDark, activeColor } = useTheme();
  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handlePrevDay = () => {
    onDateChange(addDaysToDateString(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDaysToDateString(selectedDate, 1));
  };

  const handleGoToday = () => {
    onDateChange(todayStr);
  };

  const getDisplayText = () => {
    if (selectedDate === todayStr) return t('date.today');

    const yesterdayStr = addDaysToDateString(todayStr, -1);
    if (selectedDate === yesterdayStr) return t('date.yesterday');

    const tomorrowStr = addDaysToDateString(todayStr, 1);
    if (selectedDate === tomorrowStr) return t('date.tomorrow');

    const d = parseDateString(selectedDate);
    const localeMap = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES'
    };

    return d.toLocaleDateString(localeMap[language] || 'pt-BR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleConfirmReset = () => {
    setShowConfirmReset(false);
    onResetDay?.();
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 my-3 select-none">
        {/* Previous Day */}
        <button
          onClick={handlePrevDay}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#232D29] hover:bg-[#ECEFE7]/60 dark:hover:bg-[#253933] shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center text-[#3F4B46] dark:text-[#EDF2EF] transition-all active:scale-90"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Island Pill */}
        <div className="flex-1 max-w-[240px] mx-2.5 h-10 bg-white dark:bg-[#232D29] shadow-cozy border border-[#AEBDB5]/40 dark:border-[#394842] rounded-2xl px-3 flex items-center justify-between gap-1.5 text-[#3F4B46] dark:text-[#EDF2EF]">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 shrink-0" style={{ color: activeColor.primary }} />
            <span className="font-extrabold text-xs sm:text-sm capitalize truncate">
              {getDisplayText()}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isToday ? (
              <button
                onClick={handleGoToday}
                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all"
                style={{
                  backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                  borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                  color: isDark ? activeColor.darkText : activeColor.textDark
                }}
                title="Voltar para Hoje"
              >
                {t('date.today')}
              </button>
            ) : onResetDay ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="p-1 rounded-lg text-[#6F7C76] dark:text-[#A8B8B1] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title={t('date.resetDay')}
                aria-label={t('date.resetDay')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Next Day */}
        <button
          onClick={handleNextDay}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#232D29] hover:bg-[#ECEFE7]/60 dark:hover:bg-[#253933] shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center text-[#3F4B46] dark:text-[#EDF2EF] transition-all active:scale-90"
          aria-label="Próximo dia"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Confirmation Modal for Resetting the Day */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-[#3F4B46] dark:text-[#EDF2EF]">
              {t('date.resetDayTitle')}
            </h3>

            <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-2 leading-relaxed px-2">
              {t('date.resetDayConfirm')}
            </p>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-[#F7F4EE] dark:hover:bg-[#18201D] transition-colors"
              >
                {t('date.resetCancel')}
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all active:scale-95"
              >
                {t('date.resetConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
