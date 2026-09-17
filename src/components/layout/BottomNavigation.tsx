import React, { useEffect, useRef, useState } from 'react';
import { Bot, ClipboardList, Box, PawPrint, User } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

const TAB_INDEX_MAP: Record<ActiveTab, number> = {
  coach: 0,
  journal: 1,
  quests: 2,
  foodbud: 3,
  profile: 4
};

// 5 tabs centered in a 500-unit wide SVG coordinate space (10%, 30%, 50%, 70%, 90%)
const TAB_CENTERS = [50, 150, 250, 350, 450];

// Generates the SVG path for the navbar body with a gentle, smooth scooped notch at cx
function getNotchCurves(cx: number) {
  const w = 500;
  const h = 66;
  const depth = 18; // Soft, natural dip depth that hugs the active tab comfortably
  const halfW = 46; // Balanced width: gentle slopes that never invade neighboring tabs
  const bottomHalfW = 18; // Smooth trough width framing the active icon

  const leftStart = Math.max(0, cx - halfW);
  const leftBottom = Math.max(0, cx - bottomHalfW);
  const rightBottom = Math.min(w, cx + bottomHalfW);
  const rightEnd = Math.min(w, cx + halfW);

  // S-curve control points with horizontal tangents at endpoints
  const dxL = leftBottom - leftStart;
  const cp1X = leftStart + dxL * 0.45;
  const cp2X = leftStart + dxL * 0.55;

  const dxR = rightEnd - rightBottom;
  const cp3X = rightBottom + dxR * 0.45;
  const cp4X = rightBottom + dxR * 0.55;

  const topCurve = [
    'M', 0, 0,
    'L', leftStart.toFixed(1), 0,
    'C', cp1X.toFixed(1), 0, cp2X.toFixed(1), depth, leftBottom.toFixed(1), depth,
    'L', rightBottom.toFixed(1), depth,
    'C', cp3X.toFixed(1), depth, cp4X.toFixed(1), 0, rightEnd.toFixed(1), 0,
    'L', w, 0
  ].join(' ');

  const fullPath = [
    topCurve,
    'L', w, h,
    'L', 0, h,
    'Z'
  ].join(' ');

  return { fullPath, topCurve };
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab
}) => {
  const { t } = useTranslation();
  const { isDark, activeColor } = useTheme();

  const targetCx = TAB_CENTERS[TAB_INDEX_MAP[activeTab] ?? 1];
  const [currentCx, setCurrentCx] = useState<number>(targetCx);
  const animRef = useRef<number | null>(null);
  const currentCxRef = useRef<number>(targetCx);

  // Smoothly animate the scoop position horizontally when activeTab changes
  useEffect(() => {
    const startX = currentCxRef.current;
    const destX = TAB_CENTERS[TAB_INDEX_MAP[activeTab] ?? 1];

    if (Math.abs(startX - destX) < 0.5) {
      currentCxRef.current = destX;
      setCurrentCx(destX);
      return;
    }

    const duration = 300; // ms
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      // Fluid ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const newX = startX + (destX - startX) * ease;

      currentCxRef.current = newX;
      setCurrentCx(newX);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        currentCxRef.current = destX;
        setCurrentCx(destX);
        animRef.current = null;
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab]);

  const { fullPath, topCurve } = getNotchCurves(currentCx);

  return (
    <nav className="shrink-0 z-30 relative select-none w-full">
      {/* 66px main navigation bar with SVG scoop */}
      <div className="relative w-full h-[66px]">
        {/* SVG background with dynamic notch */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-colors duration-200"
          viewBox="0 0 500 66"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Body of the navbar with scoop */}
          <path
            d={fullPath}
            fill={isDark ? '#232D29' : '#ffffff'}
            className="transition-colors duration-200"
          />
          {/* Hairline border stroke along top curve */}
          <path
            d={topCurve}
            fill="none"
            stroke={isDark ? '#394842' : 'rgba(148, 188, 174, 0.35)'}
            strokeWidth="1.5"
            className="transition-colors duration-200"
          />
        </svg>

        {/* Tab Buttons */}
        <div className="relative z-10 flex items-center justify-around h-full px-1">
          {/* Coach */}
          <button
            onClick={() => onChangeTab('coach')}
            className="flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 relative select-none active:scale-95 transition-transform"
            style={{ color: activeTab === 'coach' ? (isDark ? activeColor.darkText : activeColor.primary) : undefined }}
          >
            <Bot
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'coach'
                  ? 'stroke-[2.4] scale-105'
                  : 'stroke-[1.8] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
            />
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 ${
                activeTab === 'coach'
                  ? 'font-bold'
                  : 'font-medium text-[#6F7C76] dark:text-[#A8B8B1]'
              }`}
            >
              {t('nav.coach')}
            </span>
          </button>

          {/* Journal */}
          <button
            onClick={() => onChangeTab('journal')}
            className="flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 relative select-none active:scale-95 transition-transform"
            style={{ color: activeTab === 'journal' ? (isDark ? activeColor.darkText : activeColor.primary) : undefined }}
          >
            <ClipboardList
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'journal'
                  ? 'stroke-[2.4] scale-105'
                  : 'stroke-[1.8] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
            />
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 ${
                activeTab === 'journal'
                  ? 'font-bold'
                  : 'font-medium text-[#6F7C76] dark:text-[#A8B8B1]'
              }`}
            >
              {t('nav.journal')}
            </span>
          </button>

          {/* Quests */}
          <button
            onClick={() => onChangeTab('quests')}
            className="flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 relative select-none active:scale-95 transition-transform"
            style={{ color: activeTab === 'quests' ? (isDark ? activeColor.darkText : activeColor.primary) : undefined }}
          >
            <Box
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'quests'
                  ? 'stroke-[2.4] scale-105'
                  : 'stroke-[1.8] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
            />
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 ${
                activeTab === 'quests'
                  ? 'font-bold'
                  : 'font-medium text-[#6F7C76] dark:text-[#A8B8B1]'
              }`}
            >
              {t('nav.quests')}
            </span>
          </button>

          {/* FoodBud */}
          <button
            onClick={() => onChangeTab('foodbud')}
            className="flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 relative select-none active:scale-95 transition-transform"
            style={{ color: activeTab === 'foodbud' ? (isDark ? activeColor.darkText : activeColor.primary) : undefined }}
          >
            <PawPrint
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'foodbud'
                  ? 'stroke-[2.4] scale-105'
                  : 'stroke-[1.8] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
            />
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 ${
                activeTab === 'foodbud'
                  ? 'font-bold'
                  : 'font-medium text-[#6F7C76] dark:text-[#A8B8B1]'
              }`}
            >
              {t('nav.foodbud')}
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onChangeTab('profile')}
            className="flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 relative select-none active:scale-95 transition-transform"
            style={{ color: activeTab === 'profile' ? (isDark ? activeColor.darkText : activeColor.primary) : undefined }}
          >
            <User
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'profile'
                  ? 'stroke-[2.4] scale-105'
                  : 'stroke-[1.8] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
            />
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'font-bold'
                  : 'font-medium text-[#6F7C76] dark:text-[#A8B8B1]'
              }`}
            >
              {t('nav.profile')}
            </span>
          </button>
        </div>
      </div>

      {/* iOS Safe Area Bottom fill */}
      <div className={`w-full h-[env(safe-area-inset-bottom,0px)] ${isDark ? 'bg-[#232D29]' : 'bg-white'}`} />
    </nav>
  );
};
