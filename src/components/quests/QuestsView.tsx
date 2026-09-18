import React, { useState } from 'react';
import { Gem, CheckCircle2, Award, Sparkles, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayLog } from '../../types';
import { useTheme } from '../../services/themeService';
import { FoodBudMascot } from '../pet/FoodBudMascot';

interface QuestsViewProps {
  dayLog: DayLog;
  currentGems: number;
  petLevel?: number;
  petXp?: number;
  petName?: string;
  onClaimQuest: (questId: string, rewardGems: number, rewardPetXp: number) => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  rewardGems: number;
  rewardPetXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export function calculateUnclaimedQuests(dayLog?: DayLog): number {
  if (!dayLog) return 0;
  const claimedIds = dayLog.claimedQuestIds || [];
  let count = 0;

  if (dayLog.water && dayLog.water.consumedLiters >= dayLog.water.targetLiters && !claimedIds.includes('q_water')) {
    count++;
  }
  if (
    dayLog.meals &&
    dayLog.meals.breakfast?.items?.length > 0 &&
    dayLog.meals.lunch?.items?.length > 0 &&
    !claimedIds.includes('q_meals')
  ) {
    count++;
  }
  if (
    dayLog.fasting &&
    dayLog.fasting.elapsedSeconds >= (dayLog.fasting.targetHours * 3600) &&
    !claimedIds.includes('q_fast')
  ) {
    count++;
  }
  if (dayLog.activities && dayLog.activities.length > 0 && !claimedIds.includes('q_activity')) {
    count++;
  }

  return count;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  dayLog,
  currentGems,
  petLevel = 1,
  petXp = 0,
  petName,
  onClaimQuest
}) => {
  const { isDark, activeColor } = useTheme();
  const waterDone = dayLog.water.consumedLiters >= dayLog.water.targetLiters;
  const breakfastDone = dayLog.meals.breakfast.items.length > 0;
  const lunchDone = dayLog.meals.lunch.items.length > 0;
  const fastingDone = dayLog.fasting.elapsedSeconds >= (dayLog.fasting.targetHours * 3600);

  const claimedIds = dayLog.claimedQuestIds || [];
  const [levelUpToast, setLevelUpToast] = useState<string | null>(null);

  const quests: Quest[] = [
    {
      id: 'q_water',
      title: 'Desafio da Hidratação',
      description: `Beba ${dayLog.water.targetLiters}L de água hoje (${dayLog.water.consumedLiters}/${dayLog.water.targetLiters}L)`,
      rewardGems: 50,
      rewardPetXp: 35,
      isCompleted: waterDone,
      isClaimed: claimedIds.includes('q_water')
    },
    {
      id: 'q_meals',
      title: 'Registro Consciente',
      description: 'Registre o Café da Manhã e o Almoço no diário',
      rewardGems: 60,
      rewardPetXp: 40,
      isCompleted: breakfastDone && lunchDone,
      isClaimed: claimedIds.includes('q_meals')
    },
    {
      id: 'q_fast',
      title: 'Disciplina Metabólica',
      description: `Complete seu ciclo de jejum de ${dayLog.fasting.targetHours} horas`,
      rewardGems: 80,
      rewardPetXp: 50,
      isCompleted: fastingDone,
      isClaimed: claimedIds.includes('q_fast')
    },
    {
      id: 'q_activity',
      title: 'Corpo em Movimento',
      description: 'Adicione pelo menos 1 atividade física no dia',
      rewardGems: 50,
      rewardPetXp: 35,
      isCompleted: dayLog.activities.length > 0,
      isClaimed: claimedIds.includes('q_activity')
    }
  ];

  const handleClaim = (q: Quest) => {
    if (claimedIds.includes(q.id)) return;
    onClaimQuest(q.id, q.rewardGems, q.rewardPetXp);

    const willLevelUp = (petXp + q.rewardPetXp) >= 100;
    if (willLevelUp) {
      setLevelUpToast(`🎉 Parabéns! ${petName || 'Seu Guaxinim'} subiu para o Nível ${petLevel + 1}!`);
      setTimeout(() => setLevelUpToast(null), 4000);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  return (
    <div className="flex-1 px-5 pt-4 pb-20 select-none overflow-y-auto bg-[#F7F4EE] dark:bg-[#18201D] transition-colors duration-200">
      {/* Toast Level Up */}
      {levelUpToast && (
        <div className="fixed top-5 inset-x-5 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white dark:bg-[#232D29] text-amber-600 dark:text-amber-300 px-5 py-3 rounded-2xl shadow-cozy font-black text-xs border border-amber-400/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{levelUpToast}</span>
          </div>
        </div>
      )}

      {/* Header Cards: Gem Balance & Pet Evolution Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Gems Card */}
        <div
          className="rounded-3xl p-4 shadow-cozy border transition-colors flex items-center justify-between"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${activeColor.darkBg} 0%, #232D29 100%)`
              : `linear-gradient(135deg, ${activeColor.pastel} 0%, ${activeColor.bgTintLight} 100%)`,
            borderColor: isDark ? activeColor.darkBorder : activeColor.border
          }}
        >
          <div>
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider block"
              style={{ color: isDark ? activeColor.darkText : activeColor.textDark }}
            >
              Suas Gemas
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Gem className="w-5 h-5" style={{ color: activeColor.primary }} />
              <span
                className="text-2xl font-black"
                style={{ color: isDark ? activeColor.darkText : activeColor.textDark }}
              >
                {currentGems}
              </span>
            </div>
          </div>
          <div
            className="text-right text-[11px] font-semibold max-w-[130px] leading-tight"
            style={{ color: isDark ? activeColor.darkText : activeColor.textDark }}
          >
            Use na Loja do FoodBud para vestir seu pet!
          </div>
        </div>

        {/* Guaxinim Pet XP Card */}
        <div className="bg-white dark:bg-[#232D29] rounded-3xl p-4 border border-[#AEBDB5]/30 dark:border-[#394842] shadow-cozy flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 p-0.5 flex items-center justify-center shrink-0">
                <FoodBudMascot headOnly className="w-full h-full" mood="happy" petLevel={petLevel} />
              </div>
              <div>
                <div className="text-xs font-black text-[#3F4B46] dark:text-[#EDF2EF]">
                  {petName || 'Guaxinim FoodBud'}
                </div>
                <div
                  className="text-[10px] font-extrabold"
                  style={{ color: activeColor.primary }}
                >
                  Nível {petLevel}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-black text-[#6F7C76] dark:text-[#A8B8B1] bg-[#ECEFE7] dark:bg-[#18201D] px-2 py-0.5 rounded-full border border-[#AEBDB5]/20 dark:border-[#394842]">
              {petXp}/100 XP
            </span>
          </div>

          <div className="mt-2.5">
            <div className="w-full h-2.5 bg-[#ECEFE7] dark:bg-[#18201D] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, petXp)}%`,
                  backgroundColor: activeColor.primary
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info notice explaining quests XP */}
      <div className="mt-4 p-3.5 bg-[#FFFBEB] dark:bg-[#2C2417] border border-[#FDE68A] dark:border-[#523F20] rounded-2xl flex items-center gap-2.5 text-xs text-[#92400E] dark:text-[#FDE68A] shadow-2xs">
        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-[11px] font-medium leading-snug">
          <strong>Como evoluir seu parceiro:</strong> Cumpra as missões diárias de alimentação, água e jejum para resgatar XP legítimo e subir de nível!
        </span>
      </div>

      {/* Quests List */}
      <div className="mt-5">
        <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base mb-3 flex items-center gap-1.5">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Missões Diárias</span>
        </h3>

        <div className="space-y-3">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl p-4 border transition-all shadow-cozy flex items-center justify-between ${
                q.isClaimed
                  ? 'bg-white/60 dark:bg-[#232D29]/60 border-[#AEBDB5]/20 dark:border-[#394842] opacity-60'
                  : q.isCompleted
                  ? 'bg-[#F0FDF4] dark:bg-[#132C23] border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-white dark:bg-[#232D29] border-[#AEBDB5]/30 dark:border-[#394842]'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">{q.title}</h4>
                  <span className="inline-flex items-center gap-1 bg-[#FFFBEB] dark:bg-[#2C2417] text-[#92400E] dark:text-[#FDE68A] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FDE68A] dark:border-[#523F20]">
                    +{q.rewardGems} 💎
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                      borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                      color: isDark ? activeColor.darkText : activeColor.textDark
                    }}
                  >
                    +{q.rewardPetXp} XP 🦝
                  </span>
                </div>
                <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1">{q.description}</p>
              </div>

              <div>
                {q.isClaimed ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Resgatado
                  </span>
                ) : q.isCompleted ? (
                  <button
                    onClick={() => handleClaim(q)}
                    className="px-4 py-2 rounded-full bg-[#C9D9C8] hover:bg-[#C8E6C9] dark:bg-[#2e473e] dark:hover:bg-[#38584c] text-[#3F4B46] dark:text-[#EDF2EF] text-xs font-bold shadow-xs border-2 border-[#6F7C76] dark:border-[#527768] transition-transform active:scale-95 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Resgatar
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] bg-[#ECEFE7] dark:bg-[#18201D] px-3 py-1.5 rounded-full border border-[#AEBDB5]/20 dark:border-[#394842]">
                    Em progresso
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
