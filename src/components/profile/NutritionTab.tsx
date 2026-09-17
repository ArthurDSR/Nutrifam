import React, { useState, useMemo } from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { UserProfile, DayLog, NutritionFilter } from '../../types';
import { useTranslation } from '../../services/i18n';
import { formatDateString } from '../../services/storage';
import { useTheme } from '../../services/themeService';

interface NutritionTabProps {
  profile: UserProfile;
  dayLogs: Record<string, DayLog>;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  profile,
  dayLogs
}) => {
  const { t, language } = useTranslation();
  const { isDark, activeColor } = useTheme();
  const [calFilter, setCalFilter] = useState<NutritionFilter>('7 days');
  const [gradeFilter, setGradeFilter] = useState<NutritionFilter>('7 days');

  // Dates for 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = formatDateString(d);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const label = `${day}/${month}`;

    const log = dayLogs[dateKey];
    let eaten = 0;
    let grade = 'A';
    if (log) {
      eaten = Math.round(
        Object.values(log.meals).reduce(
          (acc, m) => acc + m.items.reduce((sAcc, it) => sAcc + it.calories * it.servingsCount, 0),
          0
        )
      );
      grade = log.grade || 'A';
    }

    return { dateKey, label, eaten, grade };
  });

  // Calculate NOVA processing distribution across recent logs
  const novaStats = useMemo(() => {
    let inNatura = 0;
    let culinary = 0;
    let processed = 0;
    let ultra = 0;
    let totalItems = 0;

    Object.values(dayLogs).forEach((log) => {
      Object.values(log.meals).forEach((meal) => {
        meal.items.forEach((item) => {
          totalItems++;
          const g = item.novaGroup || 1;
          if (g === 1) inNatura++;
          else if (g === 2) culinary++;
          else if (g === 3) processed++;
          else if (g === 4) ultra++;
        });
      });
    });

    if (totalItems === 0) {
      return { inNatura: 70, culinary: 15, processed: 10, ultra: 5, totalItems: 0 };
    }

    return {
      inNatura: Math.round((inNatura / totalItems) * 100),
      culinary: Math.round((culinary / totalItems) * 100),
      processed: Math.round((processed / totalItems) * 100),
      ultra: Math.round((ultra / totalItems) * 100),
      totalItems
    };
  }, [dayLogs]);

  // Chart dimensions
  const chartWidth = 360;
  const chartHeight = 160;
  const yMax = 2200;

  const getYCoord = (val: number) => {
    return chartHeight - (val / yMax) * chartHeight;
  };

  const getXCoord = (index: number) => {
    return 45 + (index / 6) * (chartWidth - 85);
  };

  const targetY = getYCoord(profile.dailyCaloriesTarget || 2000);

  // SVG path for actual intake
  const points = last7Days.map((d, idx) => ({
    x: getXCoord(idx),
    y: getYCoord(d.eaten),
    eaten: d.eaten,
    label: d.label
  }));

  const intakePathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const intakeAreaD = points.length > 1
    ? `${intakePathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  const filterLabels: Record<NutritionFilter, string> = {
    '7 days': language === 'pt' ? '7 dias' : language === 'es' ? '7 días' : '7 days',
    '30 days': language === 'pt' ? '30 dias' : language === 'es' ? '30 días' : '30 days',
    '90 days': language === 'pt' ? '90 dias' : language === 'es' ? '90 días' : '90 days'
  };

  return (
    <div className="flex-1 px-4 pt-4 pb-20 select-none overflow-y-auto">
      {/* Goal (Cal) Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">
            {t('journal.target')} (kcal)
          </h3>

          {/* Filter Pills */}
          <div className="flex bg-[#ECEFE7] dark:bg-[#18201D] p-0.5 rounded-xl text-xs font-bold border border-[#AEBDB5]/30 dark:border-[#394842]">
            {(['7 days', '30 days', '90 days'] as NutritionFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setCalFilter(f)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calFilter === f
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs font-extrabold'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
                style={calFilter === f ? { color: activeColor.primary } : undefined}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Calorie Evolution Chart */}
        <div className="bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] transition-all">
          <div className="relative w-full h-48">
            <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`}>
              <defs>
                <linearGradient id="intakeAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={activeColor.primary} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={activeColor.primary} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid lines */}
              {[2000, 1500, 1000, 500, 0].map((val) => {
                const y = getYCoord(val);
                return (
                  <g key={val}>
                    <line
                      x1="38"
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke={val === 0 ? (isDark ? '#4B6B60' : '#cbd5e1') : (isDark ? '#394842' : '#f1f5f9')}
                      strokeWidth="1"
                    />
                    <text
                      x="32"
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isDark ? '#A8B8B1' : '#94a3b8'}
                      fontFamily="sans-serif"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Target Dashed Line */}
              <line
                x1="38"
                y1={targetY}
                x2={chartWidth - 55}
                y2={targetY}
                stroke={isDark ? '#4B6B60' : '#64748b'}
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text
                x={chartWidth - 48}
                y={targetY - 4}
                fontSize="10"
                fontWeight="extrabold"
                fill={isDark ? '#EDF2EF' : '#475569'}
              >
                {profile.dailyCaloriesTarget}
              </text>

              {/* Area fill under intake curve */}
              {intakeAreaD && (
                <path d={intakeAreaD} fill="url(#intakeAreaGrad)" />
              )}

              {/* Actual Intake Line */}
              <path
                d={intakePathD}
                fill="none"
                stroke={activeColor.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Day Points & X Axis Labels */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={activeColor.primary}
                    stroke={isDark ? '#232D29' : '#ffffff'}
                    strokeWidth="2"
                    className="drop-shadow-xs"
                  />
                  <text
                    x={p.x}
                    y={chartHeight + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={isDark ? '#A8B8B1' : '#64748b'}
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* NOVA Processing Audit Section */}
      <div className="mt-4 bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5B8273] dark:text-[#A8B8B1]" />
            <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">
              {t('nutrition.novaAudit')}
            </h4>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
            Alimentação Saudável
          </span>
        </div>

        {/* NOVA Progress Bar Stack */}
        <div className="h-3 rounded-full bg-[#ECEFE7] dark:bg-[#18201D] flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
          <div
            style={{ width: `${novaStats.inNatura}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            title={`${t('nutrition.inNatura')}: ${novaStats.inNatura}%`}
          />
          <div
            style={{ width: `${novaStats.culinary}%` }}
            className="h-full bg-teal-400 rounded-full transition-all duration-700"
            title={`${t('nutrition.culinary')}: ${novaStats.culinary}%`}
          />
          <div
            style={{ width: `${novaStats.processed}%` }}
            className="h-full bg-amber-400 rounded-full transition-all duration-700"
            title={`${t('nutrition.processed')}: ${novaStats.processed}%`}
          />
          <div
            style={{ width: `${novaStats.ultra}%` }}
            className="h-full bg-rose-400 rounded-full transition-all duration-700"
            title={`${t('nutrition.ultraProcessed')}: ${novaStats.ultra}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">{t('nutrition.inNatura')}:</span>
            <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{novaStats.inNatura}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
            <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">{t('nutrition.culinary')}:</span>
            <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{novaStats.culinary}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">{t('nutrition.processed')}:</span>
            <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{novaStats.processed}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
            <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">{t('nutrition.ultraProcessed')}:</span>
            <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{novaStats.ultra}%</strong>
          </div>
        </div>
      </div>

      {/* Meal Grade Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">
            Qualidade das Refeições
          </h3>

          <div className="flex bg-[#ECEFE7] dark:bg-[#18201D] p-0.5 rounded-xl text-xs font-bold border border-[#AEBDB5]/30 dark:border-[#394842]">
            {(['7 days', '30 days', '90 days'] as NutritionFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setGradeFilter(f)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  gradeFilter === f
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs font-extrabold'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
                style={gradeFilter === f ? { color: activeColor.primary } : undefined}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Grade Cards */}
        <div className="bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] transition-all">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-1 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">{d.label}</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs ${
                    d.grade === 'A'
                      ? 'bg-emerald-500 text-white'
                      : d.grade === 'B'
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-rose-400 text-white'
                  }`}
                >
                  {d.grade}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Média semanal: <strong className="text-[#3F4B46] dark:text-[#EDF2EF] font-extrabold">Nota A (Excelente)</strong></span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
              Auditado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
