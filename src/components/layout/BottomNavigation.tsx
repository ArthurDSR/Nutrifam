import React from 'react';
import { Bot, Dumbbell, ClipboardList, PawPrint, User } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unclaimedQuestsCount?: number;
}

// Order: Coach | Treinos | Diário (center) | FoodBud (notification badge) | Perfil
const NAV_ITEMS = [
  { id: 'coach', labelKey: 'nav.coach', Icon: Bot },
  { id: 'workouts', labelKey: 'nav.workouts', Icon: Dumbbell },
  { id: 'journal', labelKey: 'nav.journal', Icon: ClipboardList },
  { id: 'foodbud', labelKey: 'nav.foodbud', Icon: PawPrint },
  { id: 'profile', labelKey: 'nav.profile', Icon: User }
] as const;

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  unclaimedQuestsCount = 0
}) => {
  const { t } = useTranslation();
  const { isDark, activeColor } = useTheme();

  return (
    <nav
      className="shrink-0 z-30 relative select-none w-full border-t shadow-[0_-8px_24px_rgba(63,75,70,0.06)] transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#232D29' : '#FFFCF7',
        borderColor: isDark ? '#394842' : '#E1E5E1'
      }}
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-5 h-[72px] px-2 sm:px-3">
        {NAV_ITEMS.map(({ id, labelKey, Icon }) => {
          const isActive = activeTab === id;
          const isFoodBudWithNotification = id === 'foodbud' && unclaimedQuestsCount > 0;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id as ActiveTab)}
              className="relative min-w-0 flex flex-col items-center justify-center gap-0.5 rounded-2xl active:scale-[0.97] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#232D29]"
              style={{
                color: isActive
                  ? (isDark ? activeColor.darkText : activeColor.textDark)
                  : (isDark ? '#A8B8B1' : '#6F7C76'),
                '--tw-ring-color': activeColor.primary
              } as React.CSSProperties}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(labelKey)}
            >
              {/* Active Tab Pill Indicator */}
              <span
                className="absolute top-0 h-[3px] w-8 rounded-b-full transition-all duration-200"
                style={{
                  backgroundColor: activeColor.primary,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0.4)'
                }}
              />

              {/* Icon Container with Badge */}
              <span
                className="relative w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isActive
                    ? (isDark ? activeColor.darkBg : activeColor.pastel)
                    : 'transparent',
                  border: `1px solid ${isActive ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent'}`
                }}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                  }`}
                />

                {/* Quests notification badge on Pet */}
                {isFoodBudWithNotification && (
                  <span className="absolute -top-1 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center shadow-md animate-bounce ring-2 ring-white dark:ring-[#232D29]">
                    {unclaimedQuestsCount}
                  </span>
                )}
              </span>

              <span
                className={`max-w-full truncate text-[10.5px] tracking-tight leading-none ${
                  isActive ? 'font-extrabold' : 'font-semibold'
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="w-full h-[env(safe-area-inset-bottom,0px)]"
        style={{ backgroundColor: isDark ? '#232D29' : '#FFFCF7' }}
      />
    </nav>
  );
};
