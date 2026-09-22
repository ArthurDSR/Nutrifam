import React, { useState } from 'react';
import { Heart, CheckCircle2, TrendingDown, Scale } from 'lucide-react';
import { UserProfile, WeightEntry, WeightFilter } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface WeightTabProps {
  profile: UserProfile;
  weightEntries: WeightEntry[];
  onOpenAddWeightModal: () => void;
  onToggleAppleHealth: () => void;
}

export const WeightTab: React.FC<WeightTabProps> = ({
  profile,
  weightEntries,
  onOpenAddWeightModal,
  onToggleAppleHealth
}) => {
  const { t, language } = useTranslation();
  const { isDark, activeColor } = useTheme();
  const [filter, setFilter] = useState<WeightFilter>('1 month');

  // Calculate BMI
  const heightMeters = profile.heightCm / 100;
  const bmi = Number((profile.currentWeightKg / (heightMeters * heightMeters)).toFixed(1));
  let bmiCategory = t('profile.bmiNormal');
  let bmiColor = 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300';
  if (bmi < 18.5) {
    bmiCategory = t('profile.bmiUnder');
    bmiColor = 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = t('profile.bmiOver');
    bmiColor = 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300';
  } else if (bmi >= 30) {
    bmiCategory = t('profile.bmiObese');
    bmiColor = 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300';
  }

  // Filter weight entries
  const sortedEntries = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const nowTime = new Date().getTime();
  const filteredEntries = sortedEntries.filter((e) => {
    if (filter === 'All') return true;
    const entryTime = new Date(e.date).getTime();
    const diffDays = Math.max(0, (nowTime - entryTime) / (1000 * 3600 * 24));
    if (filter === '1 day') return diffDays <= 1.5;
    if (filter === '7 days') return diffDays <= 7;
    if (filter === '1 month') return diffDays <= 30;
    if (filter === '6 months') return diffDays <= 180;
    return true;
  });

  const displayEntries = filteredEntries;

  // SVG Chart Dimensions & Dynamic Bounds
  const chartWidth = 350;
  const chartHeight = 120;
  const allWeights = [
    ...displayEntries.map((e) => e.weightKg),
    profile.currentWeightKg,
    profile.goalWeightKg
  ];
  const yMin = Math.max(20, Math.floor(Math.min(...allWeights) - 2));
  const yMax = Math.ceil(Math.max(...allWeights) + 2);

  const getYCoord = (val: number) => {
    return chartHeight - ((val - yMin) / (yMax - yMin)) * (chartHeight - 20) - 10;
  };

  const getXCoord = (index: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return 30 + (index / (total - 1)) * (chartWidth - 60);
  };

  const goalY = getYCoord(profile.goalWeightKg);

  // Build SVG path
  const points = displayEntries.map((e, idx) => ({
    x: getXCoord(idx, displayEntries.length),
    y: getYCoord(e.weightKg),
    weight: e.weightKg,
    date: e.date
  }));

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  const filterLabels: Record<WeightFilter, string> = {
    '1 day': language === 'pt' ? '1 dia' : language === 'es' ? '1 día' : '1 day',
    '7 days': language === 'pt' ? '7 dias' : language === 'es' ? '7 días' : '7 days',
    '1 month': language === 'pt' ? '1 mês' : language === 'es' ? '1 mes' : '1 month',
    '6 months': language === 'pt' ? '6 meses' : language === 'es' ? '6 meses' : '6 months',
    'All': language === 'pt' ? 'Tudo' : language === 'es' ? 'Todo' : 'All'
  };

  const weightDiff = Number((profile.currentWeightKg - profile.goalWeightKg).toFixed(1));

  return (
    <div className="flex-1 px-4 pt-4 pb-20 select-none overflow-y-auto">
      {/* 3 Modern Metric Pods */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Start Weight */}
        <div className="bg-white dark:bg-[#232D29] rounded-2xl p-3 border border-[#AEBDB5]/30 dark:border-[#394842] shadow-cozy text-center flex flex-col items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7C76] dark:text-[#A8B8B1] block">
            {t('profile.startWeight')}
          </span>
          <span className="text-lg font-black text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight my-1">
            {profile.startWeightKg} <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1]">kg</span>
          </span>
          <span className="text-[10px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">
            Inicial
          </span>
        </div>

        {/* Current Weight */}
        <div
          className="rounded-2xl p-3 border shadow-cozy text-center flex flex-col items-center justify-between transition-all"
          style={{
            backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
            borderColor: isDark ? activeColor.darkBorder : activeColor.border
          }}
        >
          <span
            className="text-[10px] font-extrabold uppercase tracking-wider block"
            style={{ color: isDark ? activeColor.darkText : activeColor.primary }}
          >
            {t('profile.currentWeight')}
          </span>
          <span className="text-xl font-black text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight my-1">
            {profile.currentWeightKg} <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1]">kg</span>
          </span>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${bmiColor}`}>
            {bmiCategory}
          </span>
        </div>

        {/* Goal Weight */}
        <div className="bg-white dark:bg-[#232D29] rounded-2xl p-3 border border-[#AEBDB5]/30 dark:border-[#394842] shadow-cozy text-center flex flex-col items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7C76] dark:text-[#A8B8B1] block">
            {t('profile.goalWeight')}
          </span>
          <span className="text-lg font-black text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight my-1">
            {profile.goalWeightKg} <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1]">kg</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            {weightDiff > 0 ? `-${weightDiff} kg` : 'Alcançado!'}
          </span>
        </div>
      </div>

      {/* Button: "Registrar Pesagem" */}
      <div className="mt-4">
        <button
          onClick={onOpenAddWeightModal}
          className="w-full text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-cozy transition-all active:scale-98 flex items-center justify-center gap-2 hover:opacity-95"
          style={{ backgroundColor: activeColor.primary }}
        >
          <Scale className="w-4 h-4 text-white" />
          <span>{t('profile.addWeight')}</span>
        </button>
      </div>

      {/* Health App Connection Card */}
      <div className="mt-4 bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] relative transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">
                {profile.healthProvider === 'google_fit' ? '👟' : profile.healthProvider === 'health_connect' ? '🟢' : '❤️'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6F7C76] dark:text-[#A8B8B1]">
                {profile.healthProvider === 'google_fit'
                  ? 'Google Fit (Android)'
                  : profile.healthProvider === 'health_connect'
                  ? 'Health Connect (Android)'
                  : 'Apple Health (iOS)'}
              </span>
            </div>
            <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm leading-snug">
              {profile.appleHealthSynced
                ? 'Atividades & Gasto Calórico Vinculados'
                : 'Sincronizar Atividades & Saúde'}
            </h4>
            <p className="text-xs font-medium text-[#6F7C76] dark:text-[#A8B8B1] mt-1 leading-relaxed">
              {profile.appleHealthSynced
                ? 'Seus passos, treinos e calorias gastas são sincronizados dinamicamente com o NutriFam.'
                : 'Conecte uma única vez para manter seus treinos e gasto calórico sempre atualizados.'}
            </p>
          </div>

          <div className="w-12 h-12 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center shrink-0">
            {profile.appleHealthSynced ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            ) : (
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
          <button
            onClick={onToggleAppleHealth}
            className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
              profile.appleHealthSynced
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                : 'text-white hover:opacity-95 active:scale-98'
            }`}
            style={!profile.appleHealthSynced ? { backgroundColor: activeColor.primary } : undefined}
          >
            <span>{profile.appleHealthSynced ? '✓ Conexão Ativa' : 'Conectar com App de Saúde'}</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex justify-between bg-[#ECEFE7] dark:bg-[#18201D] p-1 rounded-2xl mt-4 select-none text-xs font-extrabold border border-[#AEBDB5]/30 dark:border-[#394842]">
        {(['1 day', '7 days', '1 month', '6 months', 'All'] as WeightFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              filter === f
                ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs font-black'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
            }`}
            style={filter === f ? { color: activeColor.primary } : undefined}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Evolution Chart */}
      <div className="bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] mt-3 relative transition-all">
        <div className="relative w-full h-36">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <defs>
              <linearGradient id="weightAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={activeColor.primary} stopOpacity="0.25" />
                <stop offset="100%" stopColor={activeColor.primary} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Goal Line */}
            <line
              x1="20"
              y1={goalY}
              x2={chartWidth - 55}
              y2={goalY}
              stroke={isDark ? '#4B6B60' : '#94a3b8'}
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text
              x={chartWidth - 48}
              y={goalY + 4}
              fontSize="10"
              fontWeight="bold"
              fill={isDark ? '#A8B8B1' : '#64748b'}
            >
              {profile.goalWeightKg} kg
            </text>

            {/* Area under curve */}
            {areaD && (
              <path d={areaD} fill="url(#weightAreaGrad)" />
            )}

            {/* Weight trend line */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke={activeColor.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((point, index) => (
              <circle
                key={`${point.date}-${index}`}
                cx={point.x}
                cy={point.y}
                r={index === points.length - 1 ? 5 : 3}
                fill={activeColor.primary}
                stroke={isDark ? '#232D29' : '#ffffff'}
                strokeWidth="2"
              />
            ))}
          </svg>
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">
              Nenhuma pesagem neste período
            </div>
          )}
        </div>

        {/* Quick Stats: BMI & Progress */}
        <div className="mt-2 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
          <div>
            <span className="font-extrabold text-[#6F7C76] dark:text-[#A8B8B1] block text-[10px] uppercase">{t('profile.bmi')}</span>
            <span className="font-black text-[#3F4B46] dark:text-[#EDF2EF]">{bmi} kg/m² ({bmiCategory})</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-[#6F7C76] dark:text-[#A8B8B1] block text-[10px] uppercase">Rumo à Meta</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
              <TrendingDown className="w-3.5 h-3.5" />
              {weightDiff > 0 ? `${weightDiff} kg restantes` : 'Meta atingida! 🎉'}
            </span>
          </div>
        </div>
      </div>
      <section className="mt-4 bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842]">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h3 className="text-sm font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">Histórico de pesagens</h3>
          <span className="text-xs font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">{sortedEntries.length} registros</span>
        </div>
        {sortedEntries.length === 0 ? (
          <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Suas pesagens aparecerão aqui após o primeiro registro.</p>
        ) : (
          <div className="divide-y divide-[#AEBDB5]/20 dark:divide-[#394842]">
            {[...sortedEntries].reverse().map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                    {new Date(`${entry.date}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  {entry.note && <p className="mt-1 text-xs text-[#6F7C76] dark:text-[#A8B8B1] break-words">{entry.note}</p>}
                </div>
                <span className="shrink-0 text-sm font-black text-[#3F4B46] dark:text-[#EDF2EF]">{entry.weightKg} kg</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
